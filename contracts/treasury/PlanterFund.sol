// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "../access/IAccessRestriction.sol";
import "../planter/IPlanter.sol";
import "../gsn/RelayRecipient.sol";

import "./IPlanterFund.sol";

/** @title PlanterFund Contract */

contract PlanterFund is Initializable, RelayRecipient, IPlanterFund {
    struct TotalBalances {
        uint256 planter;
        uint256 ambassador;
        uint256 localDevelopment;
    }

    /** NOTE {isPlanterFund} set inside the initialize to {true} */
    bool public override isPlanterFund;

    /** NOTE minimum withdrawable amount */
    uint256 public override minWithdrawable;

    /** NOTE localDevelopment address */
    address public override localDevelopmentAddress;

    IAccessRestriction public accessRestriction;
    IPlanter public planterContract;
    IERC20Upgradeable public daiToken;

    /** NOTE totalBalances keep total share of
     * planter, ambassador, localDevelopment
     */
    TotalBalances public override totalBalances;

    /** NOTE mapping of treeId to planterProjectedEarning*/
    mapping(uint256 => uint256) public override treeToPlanterProjectedEarning;

    /** NOTE mapping of treeId to ambassadorProjectedEarning*/
    mapping(uint256 => uint256)
        public
        override treeToAmbassadorProjectedEarning;

    /** NOTE mpping of treeId to treeToPlanterTotalClaimed balance*/
    mapping(uint256 => uint256) public override treeToPlanterTotalClaimed;

    /** NOTE mapping of planter address to planter balance*/
    mapping(address => uint256) public override balances;

    /** NOTE modifier to check msg.sender has admin role */
    modifier onlyAdmin() {
        accessRestriction.ifAdmin(_msgSender());
        _;
    }

    /** NOTE modifier to check msg.sender has data manager role */
    modifier onlyDataManager() {
        accessRestriction.ifDataManager(msg.sender);
        _;
    }

    /** NOTE modifier for check if function is not paused */
    modifier ifNotPaused() {
        accessRestriction.ifNotPaused();
        _;
    }

    /** NOTE modifier for check msg.sender has TreejerContract role */
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
     * @dev initialize AccessRestriction contract and set true for isPlanterFund
     * @param _accessRestrictionAddress set to the address of AccessRestriction contract
     */
    function initialize(address _accessRestrictionAddress)
        external
        override
        initializer
    {
        IAccessRestriction candidateContract = IAccessRestriction(
            _accessRestrictionAddress
        );

        require(candidateContract.isAccessRestriction());

        isPlanterFund = true;
        minWithdrawable = .5 ether;
        accessRestriction = candidateContract;
    }

    /**
     * @dev set trusted forwarder address
     * @param _address set to {trustedForwarder}
     */
    function setTrustedForwarder(address _address)
        external
        override
        onlyAdmin
        validAddress(_address)
    {
        trustedForwarder = _address;
    }

    /**
     * @dev admin set Planter contract address
     * @param _address set to the address of Planter contract
     */
    function setPlanterContractAddress(address _address)
        external
        override
        onlyAdmin
    {
        IPlanter candidateContract = IPlanter(_address);
        require(candidateContract.isPlanter());
        planterContract = candidateContract;
    }

    /**
     * @dev admin set DaiToken contract address
     * @param _address set to the address of DaiToken contract
     */
    function setDaiTokenAddress(address _address)
        external
        override
        onlyAdmin
        validAddress(_address)
    {
        IERC20Upgradeable candidateContract = IERC20Upgradeable(_address);
        daiToken = candidateContract;
    }

    /**
     * @dev admin set localDevelopment address to fund
     * @param _address localDevelopment address
     */
    function setLocalDevelopmentAddress(address payable _address)
        external
        override
        onlyAdmin
        validAddress(_address)
    {
        localDevelopmentAddress = _address;
    }

    /** @dev admin set the minimum amount to withdraw
     * @param _amount is minimum withdrawable amount
     */
    function updateWithdrawableAmount(uint256 _amount)
        external
        override
        ifNotPaused
        onlyDataManager
    {
        minWithdrawable = _amount;

        emit MinWithdrawableAmountUpdated();
    }

    /**
     * @dev set projected earnings
     * @param _treeId id of tree to set projected earning for
     * @param _planterAmount planter amount
     * @param _ambassadorAmount ambassador amount
     */
    function updateProjectedEarnings(
        uint256 _treeId,
        uint256 _planterAmount,
        uint256 _ambassadorAmount
    ) external override onlyTreejerContract {
        treeToPlanterProjectedEarning[_treeId] = _planterAmount;
        treeToAmbassadorProjectedEarning[_treeId] = _ambassadorAmount;

        totalBalances.planter += _planterAmount;
        totalBalances.ambassador += _ambassadorAmount;

        emit ProjectedEarningUpdated(
            _treeId,
            _planterAmount,
            _ambassadorAmount
        );
    }

    /**
     * @dev based on the {_treeStatus} planter total claimable amount updated in every tree
     * update verifying
     * @param _treeId id of a tree that planter's total claimable amount updated for
     * @param _planter  address of planter to fund
     * @param _treeStatus status of tree
     */
    function updatePlanterTotalClaimed(
        uint256 _treeId,
        address _planter,
        uint64 _treeStatus
    ) external override onlyTreejerContract {
        require(
            treeToPlanterProjectedEarning[_treeId] > 0,
            "planter fund not exist"
        );

        (
            bool exists,
            address organizationAddress,
            address ambassadorAddress,
            uint256 share
        ) = planterContract.getOrganizationMemberData(_planter);

        if (exists) {
            uint256 totalPayableAmountToPlanter;

            if (_treeStatus > 25920) {
                //25920 = 30 * 24 * 36

                totalPayableAmountToPlanter =
                    treeToPlanterProjectedEarning[_treeId] -
                    treeToPlanterTotalClaimed[_treeId];
            } else {
                totalPayableAmountToPlanter =
                    ((treeToPlanterProjectedEarning[_treeId] * _treeStatus) /
                        25920) -
                    treeToPlanterTotalClaimed[_treeId];
            }

            if (totalPayableAmountToPlanter > 0) {

                    uint256 totalPayableAmountToAmbassador
                 = (treeToAmbassadorProjectedEarning[_treeId] *
                    totalPayableAmountToPlanter) /
                    treeToPlanterProjectedEarning[_treeId];

                //referral calculation section

                totalBalances.ambassador -= totalPayableAmountToAmbassador;

                if (ambassadorAddress == address(0)) {
                    totalBalances
                        .localDevelopment += totalPayableAmountToAmbassador;
                } else {
                    balances[
                        ambassadorAddress
                    ] += totalPayableAmountToAmbassador;
                }

                totalBalances.planter -= totalPayableAmountToPlanter;

                balances[organizationAddress] +=
                    (totalPayableAmountToPlanter * (10000 - share)) /
                    10000;

                //planter calculation section

                treeToPlanterTotalClaimed[
                    _treeId
                ] += totalPayableAmountToPlanter;

                balances[_planter] +=
                    (totalPayableAmountToPlanter * share) /
                    10000;

                emit PlanterTotalClaimedUpdated(
                    _treeId,
                    _planter,
                    totalPayableAmountToPlanter,
                    ambassadorAddress
                );
            }
        }
    }

    /**
     * @dev planter withdraw {_amount} from balances
     * @param _amount amount to withdraw
     */
    function withdrawBalance(uint256 _amount) external override ifNotPaused {
        require(
            _amount <= balances[_msgSender()] && _amount >= minWithdrawable,
            "insufficient amount"
        );

        balances[_msgSender()] -= _amount;

        bool success = daiToken.transfer(_msgSender(), _amount);

        require(success, "unsuccessful transfer");

        emit BalanceWithdrew(_amount, _msgSender());
    }

    /**
     * @dev admin withdraw from localDevelopment totalBalances
     * NOTE amount transfer to localDevelopmentAddress
     * @param _amount amount to withdraw
     * @param _reason reason to withdraw
     */
    function withdrawLocalDevelopmentBalance(
        uint256 _amount,
        string calldata _reason
    ) external override onlyAdmin validAddress(localDevelopmentAddress) {
        require(
            _amount <= totalBalances.localDevelopment && _amount > 0,
            "insufficient amount"
        );

        totalBalances.localDevelopment -= _amount;

        bool success = daiToken.transfer(localDevelopmentAddress, _amount);

        require(success, "unsuccessful transfer");

        emit LocalDevelopmentBalanceWithdrew(
            _amount,
            localDevelopmentAddress,
            _reason
        );
    }
}
