//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../access/IAccessRestriction.sol";
import "../tree/ITreeFactory.sol";
import "../treasury/IDaiFunds.sol";
import "../treasury/IFinancialModel.sol";
import "../gsn/RelayRecipient.sol";
import "../treasury/IPlanterFund.sol";
import "../treasury/IWethFunds.sol";

/** @title RegularSell contract */
contract RegularSell is Initializable, RelayRecipient {
    uint256 public lastSoldRegularTree;
    uint256 public treePrice;

    /** NOTE {isRegularSell} set inside the initialize to {true} */
    bool public isRegularSell;

    //TODO: ADD_COMMENT
    uint256 public regularPlanterFund;
    uint256 public regularReferralFund;

    uint256 public perRegularBuys;

    mapping(address => uint256) public referrerGifts;
    mapping(address => uint256) public referrerRegularCount;

    struct FundDistribution {
        uint256 planterFund;
        uint256 referralFund;
        uint256 treeResearch;
        uint256 localDevelop;
        uint256 rescueFund;
        uint256 treejerDevelop;
        uint256 reserveFund1;
        uint256 reserveFund2;
    }

    IAccessRestriction public accessRestriction;
    ITreeFactory public treeFactory;
    IDaiFunds public daiFunds;
    IFinancialModel public financialModel;
    IERC20Upgradeable public daiToken;
    IPlanterFund public planterFundContract;
    IWethFunds public wethFunds;

    event TreePriceUpdated(uint256 price);
    event RegularTreeRequsted(
        address buyer,
        address referrer,
        uint256 count,
        uint256 amount
    );
    event RegularMint(address buyer, uint256 treeId, uint256 treePrice);
    event RegularTreeRequstedById(
        address buyer,
        address referrer,
        uint256 treeId,
        uint256 amount
    );
    event LastSoldRegularTreeUpdated(uint256 lastSoldRegularTree);
    event GiftPerRegularBuyUpdated();
    event RegularPlanterFundSet(
        uint256 regularPlanterFund,
        uint256 regularReferralFund
    );

    event ReferrGiftClaimed(address referrer, uint256 count, uint256 amount);

    /** NOTE modifier to check msg.sender has admin role */
    modifier onlyAdmin() {
        accessRestriction.ifAdmin(_msgSender());
        _;
    }

    /**NOTE only gift owner  */
    modifier onlyGiftOwner() {
        require(referrerGifts[_msgSender()] > 0, "invalid gift owner");
        _;
    }

    /** NOTE modifier to check msg.sender has data manager role */
    modifier onlyDataManager() {
        accessRestriction.ifDataManager(_msgSender());
        _;
    }

    /** NOTE modifier for check msg.sender has TreejerContract role*/
    modifier onlyTreejerContract() {
        accessRestriction.ifTreejerContract(_msgSender());
        _;
    }

    /** NOTE modifier for check valid address */
    modifier validAddress(address _address) {
        require(_address != address(0), "invalid address");
        _;
    }

    /**
     * @dev initialize accessRestriction contract and set true for isRegularSell
     * set {_price} to tree price and set 10000 to lastSoldRegularTree
     * @param _accessRestrictionAddress set to the address of accessRestriction contract
     * @param _price initial tree price
     */
    function initialize(address _accessRestrictionAddress, uint256 _price)
        external
        initializer
    {
        IAccessRestriction candidateContract = IAccessRestriction(
            _accessRestrictionAddress
        );
        require(candidateContract.isAccessRestriction());
        accessRestriction = candidateContract;

        isRegularSell = true;
        lastSoldRegularTree = 10000;
        treePrice = _price;
        emit TreePriceUpdated(_price);
    }

    /**
     * @dev admin set trusted forwarder address
     * @param _address set to {trustedForwarder}
     */
    function setTrustedForwarder(address _address)
        external
        onlyAdmin
        validAddress(_address)
    {
        trustedForwarder = _address;
    }

    /** @dev data manager can update lastSoldRegularTree */
    function setLastSoldRegularTree(uint256 _lastSoldRegularTree)
        external
        onlyDataManager
    {
        require(
            _lastSoldRegularTree > lastSoldRegularTree,
            "Input must be gt last tree sold"
        );

        lastSoldRegularTree = _lastSoldRegularTree;

        emit LastSoldRegularTreeUpdated(_lastSoldRegularTree);
    }

    /** @dev admin set treeFactory contract address
     * @param _address treeFactory contract address
     */
    function setTreeFactoryAddress(address _address) external onlyAdmin {
        ITreeFactory candidateContract = ITreeFactory(_address);

        require(candidateContract.isTreeFactory());

        treeFactory = candidateContract;
    }

    /** @dev admin set daiFunds contract address
     * @param _address daiFunds contract address
     */
    function setDaiFundsAddress(address _address) external onlyAdmin {
        IDaiFunds candidateContract = IDaiFunds(_address);

        require(candidateContract.isDaiFunds());

        daiFunds = candidateContract;
    }

    /** @dev admin set daiToken contract address
     * @param _address daiToken contract address
     */
    function setDaiTokenAddress(address _address)
        external
        onlyAdmin
        validAddress(_address)
    {
        IERC20Upgradeable candidateContract = IERC20Upgradeable(_address);
        daiToken = candidateContract;
    }

    /**
     * @dev admin set FinancialModel contract address
     * @param _address set to the address of financialModel
     */
    function setFinancialModelAddress(address _address) external onlyAdmin {
        IFinancialModel candidateContract = IFinancialModel(_address);
        require(candidateContract.isFinancialModel());
        financialModel = candidateContract;
    }

    /** @dev admin set planterFund contract address
     * @param _address planterFund contract address
     */
    function setPlanterFundAddress(address _address) external onlyAdmin {
        IPlanterFund candidateContract = IPlanterFund(_address);

        require(candidateContract.isPlanterFund());

        planterFundContract = candidateContract;
    }

    /** @dev admin set wethFunds contract address
     * @param _address wethFunds contract address
     */
    function setWethFundsAddress(address _address) external onlyAdmin {
        IWethFunds candidateContract = IWethFunds(_address);

        require(candidateContract.isWethFunds());

        wethFunds = candidateContract;
    }

    /** @dev admin set the price of trees that are sold regular
     * @param _price price of tree
     */
    function setPrice(uint256 _price) external onlyDataManager {
        treePrice = _price;
        emit TreePriceUpdated(_price);
    }

    //TODO: ADD_COMMENT
    function setGiftPerRegularBuys(uint256 _count) external onlyDataManager {
        perRegularBuys = _count;

        emit GiftPerRegularBuyUpdated();
    }

    /** @dev request {_count} trees and the paid amount must be more than
     * {_count * treePrice }
     * @param _count is the number of trees requested by user
     */
    function requestTrees(uint256 _count, address _referrer) external {
        require(_count > 0 && _count < 101, "invalid count");

        uint256 totalPrice = treePrice * _count;

        require(
            daiToken.balanceOf(_msgSender()) >= totalPrice,
            "invalid amount"
        );

        bool success = daiToken.transferFrom(
            _msgSender(),
            address(daiFunds),
            totalPrice
        );

        require(success, "unsuccessful transfer");

        emit RegularTreeRequsted(_msgSender(), _referrer, _count, totalPrice);

        uint256 tempLastRegularSold = lastSoldRegularTree;

        FundDistribution memory totalFunds;

        for (uint256 i = 0; i < _count; i++) {
            tempLastRegularSold = treeFactory.mintRegularTrees(
                tempLastRegularSold,
                _msgSender()
            );

            (
                uint16 planterFund,
                uint16 referralFund,
                uint16 treeResearch,
                uint16 localDevelop,
                uint16 rescueFund,
                uint16 treejerDevelop,
                uint16 reserveFund1,
                uint16 reserveFund2
            ) = financialModel.findTreeDistribution(tempLastRegularSold);

            totalFunds.planterFund += (treePrice * planterFund) / 10000;
            totalFunds.referralFund += (treePrice * referralFund) / 10000;
            totalFunds.treeResearch += (treePrice * treeResearch) / 10000;
            totalFunds.localDevelop += (treePrice * localDevelop) / 10000;
            totalFunds.rescueFund += (treePrice * rescueFund) / 10000;
            totalFunds.treejerDevelop += (treePrice * treejerDevelop) / 10000;
            totalFunds.reserveFund1 += (treePrice * reserveFund1) / 10000;
            totalFunds.reserveFund2 += (treePrice * reserveFund2) / 10000;

            planterFundContract.setPlanterFunds(
                tempLastRegularSold,
                (treePrice * planterFund) / 10000,
                (treePrice * referralFund) / 10000
            );

            emit RegularMint(_msgSender(), tempLastRegularSold, treePrice);
        }

        daiFunds.regularFund(
            totalFunds.planterFund,
            totalFunds.referralFund,
            totalFunds.treeResearch,
            totalFunds.localDevelop,
            totalFunds.rescueFund,
            totalFunds.treejerDevelop,
            totalFunds.reserveFund1,
            totalFunds.reserveFund2
        );

        lastSoldRegularTree = tempLastRegularSold;

        if (_referrer != address(0)) {
            _funcReferrer(_referrer, _count);
        }
    }

    function _funcReferrer(address _referrer, uint256 _count) private {
        uint256 localReferrerRegularCount = referrerRegularCount[_referrer] +
            _count;

        if (localReferrerRegularCount > perRegularBuys) {
            uint256 temp = localReferrerRegularCount / perRegularBuys;
            localReferrerRegularCount -= temp * perRegularBuys;
            referrerGifts[_referrer] += temp;
        }

        referrerRegularCount[_referrer] = localReferrerRegularCount;
    }

    //TODO: ADD_COMMENT
    function _mintReferralTree(uint256 _count, address _referrer) private {
        uint256 tempLastRegularSold = lastSoldRegularTree;

        for (uint256 i = 0; i < _count; i++) {
            tempLastRegularSold = treeFactory.mintRegularTrees(
                tempLastRegularSold,
                _referrer
            );

            planterFundContract.setPlanterFunds(
                tempLastRegularSold,
                regularPlanterFund,
                regularReferralFund
            );

            emit RegularMint(_referrer, tempLastRegularSold, treePrice);
        }

        lastSoldRegularTree = tempLastRegularSold;
    }

    /** @dev request  tree with id {_treeId} and the paid amount must be more than
     * {treePrice} and the {_treeId} must be more than {lastSoldRegularTree} to
     * make sure that has not been sold before
     * @param _treeId is the id of tree requested by user
     */
    function requestByTreeId(uint256 _treeId, address _referrer) external {
        require(_treeId > lastSoldRegularTree, "invalid tree");

        require(
            daiToken.balanceOf(_msgSender()) >= treePrice,
            "invalid amount"
        );

        bool success = daiToken.transferFrom(
            _msgSender(),
            address(daiFunds),
            treePrice
        );

        require(success, "unsuccessful transfer");

        emit RegularTreeRequstedById(
            _msgSender(),
            _referrer,
            _treeId,
            treePrice
        );

        treeFactory.requestRegularTree(_treeId, _msgSender());

        (
            uint16 planterFund,
            uint16 referralFund,
            uint16 treeResearch,
            uint16 localDevelop,
            uint16 rescueFund,
            uint16 treejerDevelop,
            uint16 reserveFund1,
            uint16 reserveFund2
        ) = financialModel.findTreeDistribution(_treeId);

        daiFunds.fundTree(
            _treeId,
            treePrice,
            planterFund,
            referralFund,
            treeResearch,
            localDevelop,
            rescueFund,
            treejerDevelop,
            reserveFund1,
            reserveFund2
        );

        if (_referrer != address(0)) {
            _funcReferrer(_referrer, 1);
        }
    }

    function setRegularPlanterFund(
        uint256 _regularPlanterFund,
        uint256 _regularReferralFund
    ) external onlyDataManager {
        regularPlanterFund = _regularPlanterFund;
        regularReferralFund = _regularReferralFund;

        emit RegularPlanterFundSet(_regularPlanterFund, _regularReferralFund);
    }

    function updateReferrerGiftCount(address _referrer, uint256 _count)
        external
        onlyTreejerContract
    {
        referrerGifts[_referrer] += _count;
    }

    function claimGifts() external onlyGiftOwner {
        uint256 _count = referrerGifts[_msgSender()];

        if (_count > 50) {
            _count = 50;
        }
        uint256 _amount = _count * (regularPlanterFund + regularReferralFund);

        wethFunds.updateDaiSwap(_amount);

        referrerGifts[_msgSender()] -= _count;

        emit ReferrGiftClaimed(_msgSender(), _count, _amount);

        _mintReferralTree(_count, _msgSender());
    }
}
