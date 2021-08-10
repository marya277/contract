// // SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../access/IAccessRestriction.sol";
import "../tree/ITreeFactory.sol";
import "../tree/ITreeAttribute.sol";
import "../treasury/IPlanterFund.sol";

/** @title CommunityGifts */

contract CommunityGifts is Initializable {
    /** NOTE {isCommunityGifts} set inside the initialize to {true} */

    bool public isCommunityGifts;
    uint256 public planterFund;
    uint256 public referralFund;

    IAccessRestriction public accessRestriction;
    ITreeFactory public treeFactory;
    IPlanterFund public planterFundContract;
    ITreeAttribute public treeAttribute;

    struct CommunityGift {
        uint32 symbol;
        bool claimed;
        bool exist;
    }

    /** NOTE mapping of funder address to CommunityGift struct */
    mapping(address => CommunityGift) public communityGifts;

    uint256 public claimedCount;
    uint256 public expireDate;
    uint256 public giftCount;

    event GifteeUpdated(address giftee);
    event TreeClaimed(uint256 treeId);
    event TreeTransfered(uint256 treeId);

    modifier onlyAdmin() {
        accessRestriction.ifAdmin(msg.sender);
        _;
    }

    modifier ifNotPaused() {
        accessRestriction.ifNotPaused();
        _;
    }

    /**
     * @dev initialize accessRestriction contract and set true for isTreeAuction
     * @param _accessRestrictionAddress set to the address of accessRestriction contract
     */
    function initialize(address _accessRestrictionAddress, uint256 _expireDate)
        public
        initializer
    {
        IAccessRestriction candidateContract = IAccessRestriction(
            _accessRestrictionAddress
        );

        require(candidateContract.isAccessRestriction());

        isCommunityGifts = true;
        accessRestriction = candidateContract;

        expireDate = _expireDate;
    }

    /**
     * @dev admin set TreeFactoryAddress
     * @param _address set to the address of treeAttribute
     */

    function setTreeAttributesAddress(address _address) external onlyAdmin {
        ITreeAttribute candidateContract = ITreeAttribute(_address);
        require(candidateContract.isTreeAttribute());
        treeAttribute = candidateContract;
    }

    /**
     * @dev admin set TreeFactoryAddress
     * @param _address set to the address of treeFactory
     */

    function setTreeFactoryAddress(address _address) external onlyAdmin {
        ITreeFactory candidateContract = ITreeFactory(_address);
        require(candidateContract.isTreeFactory());
        treeFactory = candidateContract;
    }

    /**
     * @dev admin set PlanterFundAddress
     * @param _address set to the address of PlanterFund
     */

    function setPlanterFundAddress(address _address) external onlyAdmin {
        IPlanterFund candidateContract = IPlanterFund(_address);
        require(candidateContract.isPlanterFund());
        planterFundContract = candidateContract;
    }

    function setGiftsRange(uint256 _startTreeId, uint256 _endTreeId)
        external
        onlyAdmin
    {
        bool check = treeFactory.manageProvideStatus(
            _startTreeId,
            _endTreeId,
            5
        );
        require(check, "not available tree exist");
    }

    function updateGiftees(address _giftee, uint32 _symbol) external onlyAdmin {
        CommunityGift storage communityGift = communityGifts[_giftee];

        require(!communityGift.claimed, "Claimed before");
        require(giftCount < 90, "max giftCount reached");

        if (!communityGift.exist) {
            giftCount += 1;
            communityGift.exist = true;
        } else {
            treeAttribute.freeReserveTreeAttributes(communityGift.symbol);
        }

        communityGift.symbol = _symbol;

        treeAttribute.reserveTreeAttributes(_symbol);

        emit GifteeUpdated(_giftee);
    }

    function claimTree() external {
        CommunityGift storage communityGift = communityGifts[msg.sender];

        require(block.timestamp <= expireDate, "CommunityGift ended");
        require(communityGifts[msg.sender].exist, "User not exist");
        require(!communityGifts[msg.sender].claimed, "Claimed before");

        uint256 treeId = 11 + claimedCount;

        claimedCount += 1;

        communityGift.claimed = true;

        treeAttribute.setTreeAttributesByAdmin(treeId, communityGift.symbol);

        treeFactory.updateOwner(treeId, msg.sender, 3);

        //call planter contract
        planterFundContract.setPlanterFunds(treeId, planterFund, referralFund);

        emit TreeClaimed(treeId);
    }

    function setExpireDate(uint256 _expireDate) external onlyAdmin {
        expireDate = _expireDate;
    }

    function transferTree(address _giftee, uint32 _symbol) external onlyAdmin {
        require(
            block.timestamp > expireDate,
            "CommunityGift Time not yet ended"
        );

        require(claimedCount < 89, "claimedCount not true");

        require(
            treeAttribute.reservedAttributes(_symbol) == 1,
            "Symbol not reserved"
        );

        uint256 treeId = 11 + claimedCount;

        claimedCount += 1;

        treeAttribute.setTreeAttributesByAdmin(treeId, _symbol);

        treeFactory.updateOwner(treeId, _giftee, 3);

        //call planter contract
        planterFundContract.setPlanterFunds(treeId, planterFund, referralFund);

        emit TreeTransfered(treeId);
    }

    function setPrice(uint256 _planterFund, uint256 _referralFund)
        external
        onlyAdmin
    {
        planterFund = _planterFund;
        referralFund = _referralFund;
    }
}
