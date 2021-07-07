const AccessRestriction = artifacts.require("AccessRestriction.sol");
const TreeAuction = artifacts.require("TreeAuction.sol");
const GenesisTree = artifacts.require("GenesisTree.sol");
const Treasury = artifacts.require("Treasury.sol");
const Tree = artifacts.require("Tree.sol");
const GBFactory = artifacts.require("GBFactory.sol");
const Planter = artifacts.require("Planter.sol");
const assert = require("chai").assert;
require("chai").use(require("chai-as-promised")).should();
const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const truffleAssert = require("truffle-assertions");
const Common = require("./common");
const {
  TimeEnumes,
  CommonErrorMsg,
  TreeAuctionErrorMsg,
  GenesisTreeErrorMsg,
  TreesuryManagerErrorMsg,
} = require("./enumes");

const Math = require("./math");

const zeroAddress = "0x0000000000000000000000000000000000000000";
contract("TreeAuction", (accounts) => {
  let treeAuctionInstance;
  let arInstance;
  let TreasuryInstance;
  let genesisTreeInstance;
  let startTime;
  let endTime;
  let gbInstance;
  let planterInstance;

  const ownerAccount = accounts[0];
  const deployerAccount = accounts[1];
  const userAccount1 = accounts[2];
  const userAccount2 = accounts[3];
  const userAccount3 = accounts[4];
  const userAccount4 = accounts[5];
  const userAccount5 = accounts[6];
  const userAccount6 = accounts[7];
  const userAccount7 = accounts[8];
  const userAccount8 = accounts[9];

  const ipfsHash = "some ipfs hash here";

  beforeEach(async () => {
    arInstance = await deployProxy(AccessRestriction, [deployerAccount], {
      initializer: "initialize",
      unsafeAllowCustomTypes: true,
      from: deployerAccount,
    });

    treeAuctionInstance = await deployProxy(TreeAuction, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    TreasuryInstance = await deployProxy(Treasury, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    genesisTreeInstance = await deployProxy(GenesisTree, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    gbInstance = await deployProxy(GBFactory, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    planterInstance = await deployProxy(Planter, [arInstance.address], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    await treeAuctionInstance.setGenesisTreeAddress(
      genesisTreeInstance.address,
      {
        from: deployerAccount,
      }
    );

    await genesisTreeInstance.setTreeTokenAddress(treeTokenInstance.address, {
      from: deployerAccount,
    });

    await Common.addAuctionRole(
      arInstance,
      treeAuctionInstance.address,
      deployerAccount
    );

    await Common.addGenesisTreeRole(
      arInstance,
      genesisTreeInstance.address,
      deployerAccount
    );
  });

  afterEach(async () => {});

  // it("deploys successfully", async () => {
  //   const address = treeAuctionInstance.address;
  //   assert.notEqual(address, 0x0);
  //   assert.notEqual(address, "");
  //   assert.notEqual(address, null);
  //   assert.notEqual(address, undefined);
  // });

  // it("should set tresury address with admin access or fail otherwise", async () => {
  //   let tx = await treeAuctionInstance.setTreasuryAddress(
  //     TreasuryInstance.address,
  //     {
  //       from: deployerAccount,
  //     }
  //   );
  //   await treeAuctionInstance
  //     .setTreasuryAddress(TreasuryInstance.address, {
  //       from: userAccount2,
  //     })
  //     .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN); //must be faild because ots not deployer account
  // });
  // it("should set genesis tree address with admin access or fail otherwise", async () => {
  //   let tx = await treeAuctionInstance.setGenesisTreeAddress(
  //     genesisTreeInstance.address,
  //     {
  //       from: deployerAccount,
  //     }
  //   );
  //   await treeAuctionInstance
  //     .setTreasuryAddress(TreasuryInstance.address, {
  //       from: userAccount2,
  //     })
  //     .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN); //must be faild because ots not deployer account
  // });

  // it("auction call by admin access or fail otherwise", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   const treeId = 1;
  //   const treeId2 = 2;

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await genesisTreeInstance.addTree(treeId2, ipfsHash, {
  //     from: deployerAccount,
  //   });
  //   //only admin can call this method so it should be rejected
  //   await treeAuctionInstance
  //     .createAuction(
  //       treeId2,
  //       Number(startTime.toString()),
  //       Number(endTime.toString()),
  //       web3.utils.toWei("1"),
  //       web3.utils.toWei("0.1"),
  //       { from: userAccount1 }
  //     )
  //     .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);
  // });

  // it("should fail auction with duplicate tree id ( tree is in other provide ) ", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   let treeId = 1;

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );

  //   await treeAuctionInstance
  //     .createAuction(
  //       treeId,
  //       Number(startTime.toString()),
  //       Number(endTime.toString()),
  //       web3.utils.toWei("1"),
  //       web3.utils.toWei("0.1"),
  //       { from: deployerAccount }
  //     )
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.TREE_STATUS);
  // });

  // it("Create auction should be fail (Assign models not exist) ", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   let treeId = 1;

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance
  //     .createAuction(
  //       treeId,
  //       Number(startTime.toString()),
  //       Number(endTime.toString()),
  //       web3.utils.toWei("1"),
  //       web3.utils.toWei("0.1"),
  //       { from: deployerAccount }
  //     )
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.INVALID_ASSIGN_MODEL);

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await treeAuctionInstance
  //     .createAuction(
  //       treeId,
  //       Number(startTime.toString()),
  //       Number(endTime.toString()),
  //       web3.utils.toWei("1"),
  //       web3.utils.toWei("0.1"),
  //       { from: deployerAccount }
  //     )
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.INVALID_ASSIGN_MODEL);
  // });

  // it("Check auction data insert conrrectly", async () => {
  //   let treeId = 1;

  //   let initialValue = web3.utils.toWei("1");
  //   let bidInterval = web3.utils.toWei("0.1");

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     initialValue,
  //     bidInterval,
  //     { from: deployerAccount }
  //   );

  //   let result = await treeAuctionInstance.auctions.call(0);

  //   assert.equal(result.treeId.toNumber(), treeId);
  //   assert.equal(Number(result.highestBid.toString()), initialValue);
  //   assert.equal(Number(result.bidInterval.toString()), bidInterval);
  //   assert.equal(
  //     Number(result.startDate.toString()),
  //     Number(startTime.toString())
  //   );
  //   assert.equal(Number(result.endDate.toString()), Number(endTime.toString()));
  //   assert.equal(web3.utils.hexToUtf8(result.status), "started");
  // });

  // it("bid auction and check highest bid set change correctly", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);
  //   const treeId = 1;
  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );
  //   const resultBefore = await treeAuctionInstance.auctions.call(0);

  //   await treeAuctionInstance.bid(0, {
  //     value: web3.utils.toWei("1.15"),
  //   });
  //   const resultAfter = await treeAuctionInstance.auctions.call(0);
  //   assert.equal(
  //     Number(resultAfter.highestBid.toString()) -
  //       Number(resultBefore.highestBid.toString()),
  //     web3.utils.toWei("0.15")
  //   );
  // });

  // it("must offer suitable value for auction or rejected otherwise", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);
  //   const treeId = 1;
  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );

  //   await treeAuctionInstance.bid(0, {
  //     value: web3.utils.toWei("1.15"),
  //   });

  //   await treeAuctionInstance
  //     .bid(0, {
  //       value: web3.utils.toWei("0.01"),
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);
  // });

  // it("should increase end time of auction beacuse bid less than 600 secconds left to end of auction", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 300);
  //   const treeId = 1;
  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   let tx = await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );
  //   let resultBefore = await treeAuctionInstance.auctions.call(0);

  //   await treeAuctionInstance.bid(0, {
  //     value: web3.utils.toWei("1.15"),
  //   });

  //   let resultAfterChangeTime = await treeAuctionInstance.auctions.call(0);

  //   assert.equal(
  //     resultAfterChangeTime.endDate.toNumber() -
  //       resultBefore.endDate.toNumber(),
  //     600
  //   );
  // });

  // it("bid before start of aution must be failed", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.minutes, 5);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);
  //   const treeId = 1;
  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );

  //   await treeAuctionInstance
  //     .bid(0, {
  //       value: web3.utils.toWei("1.15"),
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_BEFORE_START);
  // });

  // it("bid after end of auction must be failed", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);
  //   const treeId = 1;
  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   let tx = await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );
  //   await treeAuctionInstance.bid(0, {
  //     value: web3.utils.toWei("1.15"),
  //   });
  //   await Common.travelTime(TimeEnumes.hours, 2);
  //   await treeAuctionInstance
  //     .bid(0, {
  //       value: web3.utils.toWei("1.5"),
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_AFTER_END);
  // });

  // it("should emit highest bid event", async () => {
  //   let treeId = 1;
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );
  //   let tx = await treeAuctionInstance.bid(0, {
  //     value: web3.utils.toWei("1.15"),
  //     from: userAccount1,
  //   });

  //   truffleAssert.eventEmitted(tx, "HighestBidIncreased", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == 0 &&
  //       ev.bidder == userAccount1 &&
  //       Number(ev.amount.toString()) == web3.utils.toWei("1.15") &&
  //       Number(ev.treeId.toString()) == treeId
  //     );
  //   });
  // });

  // it("should emit end time event", async () => {
  //   let treeId = 1;

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 60);

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );
  //   let tx = await treeAuctionInstance.bid(0, {
  //     value: web3.utils.toWei("1.15"),
  //     from: userAccount1,
  //   });

  //   truffleAssert.eventEmitted(tx, "AuctionEndTimeIncreased", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == 0 &&
  //       ev.bidder == userAccount1 &&
  //       Number(ev.newAuctionEndTime.toString()) ==
  //         Number(endTime.toString()) + 600
  //     );
  //   });
  // });
  // it("should end auction and fail in invalid situations", async () => {
  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setGenesisTreeAddress(
  //     genesisTreeInstance.address,
  //     { from: deployerAccount }
  //   );
  //   const treeId = 1;
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 60);
  //   const highestBid = web3.utils.toWei("1.15");

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );
  //   await treeAuctionInstance
  //     .endAuction(0, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.END_AUCTION_BEFORE_END_TIME); //end time dont reach and must be rejected
  //   await treeAuctionInstance.bid(0, {
  //     from: userAccount1,
  //     value: highestBid,
  //   });
  //   await Common.travelTime(TimeEnumes.seconds, 670);
  //   let successEnd = await treeAuctionInstance.endAuction(0, {
  //     from: deployerAccount,
  //   }); //succesfully end the auction

  //   let failEnd = await treeAuctionInstance
  //     .endAuction(0, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(
  //       TreeAuctionErrorMsg.END_AUCTION_WHEN_IT_HAS_BEEN_ENDED
  //     ); //auction already ended and must be rejected
  // });

  // it("Check emit end auction event", async () => {
  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     4000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   const treeId = 1;

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 60);

  //   const highestBid = web3.utils.toWei("1.15");

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );

  //   await treeAuctionInstance.bid(0, {
  //     from: userAccount1,
  //     value: highestBid,
  //   });

  //   await Common.travelTime(TimeEnumes.seconds, 670);

  //   let successEnd = await treeAuctionInstance.endAuction(0, {
  //     from: userAccount1,
  //   });

  //   let addressGetToken = await treeTokenInstance.ownerOf(treeId);

  //   assert.equal(addressGetToken, userAccount1, "token not true mint");

  //   truffleAssert.eventEmitted(successEnd, "AuctionEnded", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == 0 &&
  //       Number(ev.treeId.toString()) == treeId &&
  //       ev.winner == userAccount1 &&
  //       Number(ev.amount.toString()) == highestBid
  //     );
  //   });
  // });

  // it("end auction when there is no bidder", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 60);

  //   const treeId = 2;

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1"),
  //     web3.utils.toWei("0.1"),
  //     { from: deployerAccount }
  //   );

  //   await Common.travelTime(TimeEnumes.seconds, 70);

  //   await treeAuctionInstance.endAuction(0, {
  //     from: deployerAccount,
  //   });

  //   let result = await treeAuctionInstance.auctions.call(0);

  //   assert.equal(web3.utils.hexToUtf8(result.status), "ended");
  // });

  // it("Should automatic withdraw successfully", async () => {
  //   let auctionId = 0;
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 120);
  //   const treeId = 0;

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });
  //   //create auction
  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1", "Ether"),
  //     web3.utils.toWei(".5", "Ether"),
  //     { from: deployerAccount }
  //   );

  //   //userAccount1 take part in auction
  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount1,
  //     value: web3.utils.toWei("1.5", "Ether"),
  //   });

  //   //check contract balance
  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("1.5", "Ether"),
  //     "1.Contract balance is not true"
  //   );

  //   let refer1AccountBalanceAfterBid = await web3.eth.getBalance(userAccount1);

  //   //userAccount2 take part in auction
  //   await treeAuctionInstance
  //     .bid(auctionId, {
  //       from: userAccount2,
  //       value: web3.utils.toWei("1.5", "Ether"),
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount2,
  //     value: web3.utils.toWei("2", "Ether"),
  //   });

  //   //check contract balance
  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("2", "Ether"),
  //     "2.Contract balance is not true"
  //   );

  //   //check userAccount1 refunded
  //   assert.equal(
  //     await web3.eth.getBalance(userAccount1),
  //     Math.add(
  //       Number(refer1AccountBalanceAfterBid),
  //       Number(web3.utils.toWei("1.5", "Ether"))
  //     ),
  //     "Redirect automatic withdraw is not true"
  //   );
  // });

  // it("Check contract balance when user call bid function and Balance should be ok", async () => {
  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.seconds, 120);

  //   let auctionId = 0;
  //   const treeId = 0;

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });
  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1", "Ether"),
  //     web3.utils.toWei(".5", "Ether"),
  //     { from: deployerAccount }
  //   );

  //   //userAccount1 take part in auction
  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount1,
  //     value: web3.utils.toWei("1.5", "Ether"),
  //   });

  //   //check contract balance
  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("1.5", "Ether"),
  //     "1.Contract balance is not true"
  //   );

  //   //userAccount2 take part in auction
  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount2,
  //     value: web3.utils.toWei("2", "Ether"),
  //   });

  //   //check contract balance
  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("2", "Ether"),
  //     "2.Contract balance is not true"
  //   );

  //   //userAccount3 take part in auction
  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount3,
  //     value: web3.utils.toWei("4", "Ether"),
  //   });

  //   //check contract balance
  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("4", "Ether"),
  //     "3.Contract balance is not true"
  //   );
  // });

  // it("Should manualWithdraw is reject because user balance is not enough", async () => {
  //   await treeAuctionInstance
  //     .manualWithdraw({
  //       from: userAccount1,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.MANUAL_WITHDRAW_USER_BALANCE);
  // });

  // it("Should manualWithdraw function is reject because pause is true", async () => {
  //   await arInstance.pause({
  //     from: deployerAccount,
  //   });
  //   await treeAuctionInstance
  //     .manualWithdraw({
  //       from: userAccount1,
  //     })
  //     .should.be.rejectedWith(CommonErrorMsg.PAUSE);
  // });

  // it("Should bid function is reject because function is pause", async () => {
  //   let auctionId = 0;

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);
  //   const treeId = 1;

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });
  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1", "Ether"),
  //     web3.utils.toWei(".5", "Ether"),
  //     { from: deployerAccount }
  //   );

  //   //userAccount1 take part in auction
  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount1,
  //     value: web3.utils.toWei("1.5", "Ether"),
  //   });

  //   await arInstance.pause({
  //     from: deployerAccount,
  //   });

  //   //userAccount2 take part in auction but function is pause
  //   await treeAuctionInstance
  //     .bid(auctionId, {
  //       from: userAccount2,
  //       value: web3.utils.toWei("2", "Ether"),
  //     })
  //     .should.be.rejectedWith(CommonErrorMsg.PAUSE);
  // });

  // it("Should endAuction function is reject because function is pause", async () => {
  //   let auctionId = 0;
  //   const treeId = 1;

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     4000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1", "Ether"),
  //     web3.utils.toWei(".5", "Ether"),
  //     { from: deployerAccount }
  //   );

  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount2,
  //     value: web3.utils.toWei("2", "Ether"),
  //   });

  //   await Common.travelTime(TimeEnumes.hours, 2);

  //   await arInstance.pause({
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance
  //     .endAuction(auctionId, { from: deployerAccount })
  //     .should.be.rejectedWith(CommonErrorMsg.PAUSE);
  // });

  // it("Should createAuction function is reject because function is pause", async () => {
  //   let auctionId = 0;

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await arInstance.pause({
  //     from: deployerAccount,
  //   });
  //   const treeId = 1;
  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance
  //     .createAuction(
  //       treeId,
  //       Number(startTime.toString()),
  //       Number(endTime.toString()),
  //       web3.utils.toWei("1", "Ether"),
  //       web3.utils.toWei(".5", "Ether"),
  //       { from: deployerAccount }
  //     )
  //     .should.be.rejectedWith(CommonErrorMsg.PAUSE);
  // });

  // it("Should endAuction function is reject because function is pause", async () => {
  //   let auctionId = 0;

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   const treeId = 1;

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.addFundDistributionModel(
  //     4000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.addTree(treeId, ipfsHash, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     Number(startTime.toString()),
  //     Number(endTime.toString()),
  //     web3.utils.toWei("1", "Ether"),
  //     web3.utils.toWei(".5", "Ether"),
  //     { from: deployerAccount }
  //   );

  //   await treeAuctionInstance.bid(auctionId, {
  //     from: userAccount2,
  //     value: web3.utils.toWei("2", "Ether"),
  //   });

  //   await Common.travelTime(TimeEnumes.hours, 2);

  //   await arInstance.pause({
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance
  //     .endAuction(auctionId, { from: deployerAccount })
  //     .should.be.rejectedWith(CommonErrorMsg.PAUSE);
  // });
  //------------------------------------------- complete proccess of auction ------------------------------------------ //
  it("should do an acution completly", async () => {
    const treeId = 1;
    const birthDate = parseInt(new Date().getTime() / 1000);
    const countryCode = 2;
    const initialValue = web3.utils.toWei("1");
    const bidInterval = web3.utils.toWei("0.1");

    startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
    endTime = await Common.timeInitial(TimeEnumes.hours, 1);

    await genesisTreeInstance.setGBFactoryAddress(gbInstance.address, {
      from: deployerAccount,
    });

    await Common.addPlanter(arInstance, userAccount7, deployerAccount);
    await Common.addPlanter(arInstance, userAccount8, deployerAccount);

    await Common.joinOrganizationPlanter(
      planterInstance,
      userAccount8,
      zeroAddress,
      deployerAccount
    );

    await Common.joinSimplePlanter(
      planterInstance,
      3,
      userAccount7,
      zeroAddress,
      userAccount8
    );

    await genesisTreeInstance.setTreeTokenAddress(treeTokenInstance.address, {
      from: deployerAccount,
    });

    await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
      from: deployerAccount,
    });

    await genesisTreeInstance.addTree(treeId, ipfsHash, {
      from: deployerAccount,
    });

    await TreasuryInstance.addFundDistributionModel(
      4000,
      1200,
      1200,
      1200,
      1200,
      1200,
      0,
      0,
      {
        from: deployerAccount,
      }
    );

    await Common.addAuctionRole(
      arInstance,
      treeAuctionInstance.address,
      deployerAccount
    );

    await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
      from: deployerAccount,
    });

    await treeAuctionInstance.createAuction(
      treeId,
      startTime,
      endTime,
      initialValue,
      bidInterval,
      { from: deployerAccount }
    );

    await treeAuctionInstance.bid(0, {
      from: userAccount1,
      value: web3.utils.toWei("1.1"),
    });

    const auction1 = await treeAuctionInstance.auctions.call(0);

    assert.equal(auction1.bider, userAccount1, "bidder is incoreect");

    assert.equal(
      Number(auction1.highestBid.toString()),
      web3.utils.toWei("1.1"),
      "highest bid is incorrect"
    );

    await Common.travelTime(TimeEnumes.minutes, 55);

    await treeAuctionInstance.bid(0, {
      from: userAccount2,
      value: web3.utils.toWei("1.2"),
    });

    const auction2 = await treeAuctionInstance.auctions.call(0);

    assert.equal(auction2.bider, userAccount2, "bidder is incorrect");

    assert.equal(
      Number(auction2.endDate.toString()) - Number(auction1.endDate.toString()),
      600,
      "time increse incorrect"
    );

    await treeAuctionInstance
      .bid(0, { from: userAccount1, value: web3.utils.toWei("1.29") })
      .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

    await treeAuctionInstance.bid(0, {
      from: userAccount1,
      value: web3.utils.toWei("1.3"),
    });

    const auction3 = await treeAuctionInstance.auctions.call(0);

    assert.equal(auction3.bider, userAccount1, "bider is incorrect");
    assert.equal(
      Number(auction3.endDate.toString()),
      Number(auction2.endDate.toString()),
      "increase end time inccorect"
    );

    await Common.travelTime(TimeEnumes.seconds, 600);

    await treeAuctionInstance.bid(0, {
      from: userAccount3,
      value: web3.utils.toWei("1.4"),
    });

    await treeAuctionInstance
      .endAuction(0, { from: deployerAccount })
      .should.be.rejectedWith(TreeAuctionErrorMsg.END_AUCTION_BEFORE_END_TIME);

    const auction4 = await treeAuctionInstance.auctions.call(0);

    assert.equal(
      Number(auction4.endDate.toString()) - Number(auction3.endDate.toString()),
      600,
      "increase end time incorrect"
    );

    assert.equal(auction4.bider, userAccount3, "bider is inccorect");

    await Common.travelTime(TimeEnumes.minutes, 16);

    let contractBalanceBefore = await web3.eth.getBalance(
      treeAuctionInstance.address
    );

    assert.equal(
      Number(contractBalanceBefore.toString()),
      Number(web3.utils.toWei("1.4")),
      "1.Contract balance not true"
    );

    await treeAuctionInstance.endAuction(0, { from: userAccount3 });

    let contractBalanceAfter = await web3.eth.getBalance(
      treeAuctionInstance.address
    );

    assert.equal(
      Number(contractBalanceAfter.toString()),
      0,
      "2.Contract balance not true"
    );

    assert.equal(
      await web3.eth.getBalance(TreasuryInstance.address),
      web3.utils.toWei("1.4"),
      "1.TreasuryInstance contract balance not true"
    );

    assert.equal(
      await treeTokenInstance.ownerOf(treeId),
      userAccount3,
      "owner of token is incorrect"
    );

    //check treasury updated true
    let pFund = await TreasuryInstance.planterFunds.call(treeId);

    let totalFunds = await TreasuryInstance.totalFunds();

    let amount = Number(web3.utils.toWei("1.4"));

    let expected = {
      planterFund: (40 * amount) / 100,
      referralFund: (12 * amount) / 100,
      treeResearch: (12 * amount) / 100,
      localDevelop: (12 * amount) / 100,
      rescueFund: (12 * amount) / 100,
      treejerDevelop: (12 * amount) / 100,
      otherFund1: 0,
      otherFund2: 0,
    };

    assert.equal(
      Number(pFund.toString()),
      expected.planterFund,
      "planter funds invalid"
    );

    assert.equal(
      Number(totalFunds.planterFund.toString()),
      expected.planterFund,
      "planterFund totalFunds invalid"
    );

    assert.equal(
      Number(totalFunds.referralFund.toString()),
      expected.referralFund,
      "referralFund funds invalid"
    );

    assert.equal(
      Number(totalFunds.treeResearch.toString()),
      expected.treeResearch,
      "treeResearch funds invalid"
    );

    assert.equal(
      Number(totalFunds.localDevelop.toString()),
      expected.localDevelop,
      "localDevelop funds invalid"
    );

    assert.equal(
      Number(totalFunds.rescueFund.toString()),
      expected.rescueFund,
      "rescueFund funds invalid"
    );

    assert.equal(
      Number(totalFunds.treejerDevelop.toString()),
      expected.treejerDevelop,
      "treejerDevelop funds invalid"
    );

    assert.equal(
      Number(totalFunds.otherFund1.toString()),
      expected.otherFund1,
      "otherFund1 funds invalid"
    );

    assert.equal(
      Number(totalFunds.otherFund2.toString()),
      expected.otherFund2,
      "otherFund2 funds invalid"
    );

    await genesisTreeInstance.asignTreeToPlanter(treeId, userAccount7, {
      from: deployerAccount,
    });

    // await genesisTreeInstance
    //   .plantTree(treeId, ipfsHash, birthDate, countryCode, {
    //     from: userAccount8,
    //   })
    //   .should.be.rejectedWith(GenesisTreeErrorMsg.PLANT_TREE_WITH_PLANTER);

    // await genesisTreeInstance.plantTree(
    //   treeId,
    //   ipfsHash,
    //   birthDate,
    //   countryCode,
    //   { from: userAccount7 }
    // );

    // await genesisTreeInstance
    //   .verifyPlant(treeId, true, { from: userAccount7 })
    //   .should.be.rejectedWith(GenesisTreeErrorMsg.VERIFY_PLANT_BY_PLANTER);

    // await genesisTreeInstance
    //   .verifyPlant(treeId, true, { from: userAccount3 })
    //   .should.be.rejectedWith(GenesisTreeErrorMsg.VERIFY_PLANT_ACCESS);

    // await genesisTreeInstance.verifyPlant(treeId, true, {
    //   from: deployerAccount,
    // });
  });

  // // ---------------------------------------complex test (auction and genesisTree and treasury)-------------------------------------

  // it("complex test 1", async () => {
  //   const treeId = 1;
  //   const gbId = 1;
  //   const gbType = 1;
  //   const birthDate = parseInt(new Date().getTime() / 1000);
  //   const countryCode = 2;

  //   let initialValue = web3.utils.toWei("1");
  //   let bidInterval = web3.utils.toWei("0.1");

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await genesisTreeInstance.setTreeTokenAddress(treeTokenInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await Common.successPlant(
  //     genesisTreeInstance,
  //     gbInstance,
  //     arInstance,
  //     ipfsHash,
  //     treeId,
  //     gbId,
  //     gbType,
  //     birthDate,
  //     countryCode,
  //     [userAccount2, userAccount3],
  //     userAccount1,
  //     userAccount2,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.addFundDistributionModel(
  //     6500,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   ).should.be.rejectedWith(TreesuryManagerErrorMsg.SUM_INVALID);

  //   await treeAuctionInstance
  //     .createAuction(treeId, startTime, endTime, initialValue, bidInterval, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.INVALID_ASSIGN_MODEL);

  //   await TreasuryInstance.addFundDistributionModel(
  //     3000,
  //     1200,
  //     1200,
  //     1200,
  //     1200,
  //     2200,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     startTime,
  //     endTime,
  //     initialValue,
  //     bidInterval,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   let createResult = await genesisTreeInstance.genTrees.call(treeId);

  //   assert.equal(
  //     createResult.provideStatus,
  //     1,
  //     "Provide status not true update when auction create"
  //   );

  //   await treeAuctionInstance
  //     .createAuction(treeId, startTime, endTime, initialValue, bidInterval, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.TREE_STATUS);

  //   await treeAuctionInstance
  //     .endAuction(0, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.END_AUCTION_BEFORE_END_TIME);

  //   await Common.travelTime(TimeEnumes.hours, 1);

  //   await treeAuctionInstance.endAuction(0, {
  //     from: deployerAccount,
  //   });

  //   let failResult = await genesisTreeInstance.genTrees.call(treeId);

  //   assert.equal(
  //     failResult.provideStatus,
  //     0,
  //     "Provide status not true update when auction fail"
  //   );

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     startTime,
  //     endTime,
  //     initialValue,
  //     bidInterval,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   let createResult2 = await genesisTreeInstance.genTrees.call(treeId);

  //   assert.equal(
  //     createResult2.provideStatus,
  //     1,
  //     "Provide status not true update when auction create"
  //   );

  //   await treeAuctionInstance
  //     .bid(1, {
  //       value: web3.utils.toWei("1.09"),
  //       from: userAccount3,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

  //   await treeAuctionInstance.bid(1, {
  //     value: web3.utils.toWei("1.15"),
  //     from: userAccount3,
  //   });

  //   let firstBiderAfterBid = await web3.eth.getBalance(userAccount3);

  //   await treeAuctionInstance
  //     .bid(1, {
  //       value: web3.utils.toWei("1.24"),
  //       from: userAccount4,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

  //   await treeAuctionInstance.bid(1, {
  //     value: web3.utils.toWei("1.25"),
  //     from: userAccount4,
  //   });

  //   let firstBiderAfterAutomaticWithdraw = await web3.eth.getBalance(
  //     userAccount3
  //   );

  //   assert.equal(
  //     firstBiderAfterAutomaticWithdraw,
  //     Math.add(
  //       Number(firstBiderAfterBid),
  //       Number(web3.utils.toWei("1.15", "Ether"))
  //     ),
  //     "automatic withdraw not true work"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("1.25", "Ether"),
  //     "1.Contract balance is not true"
  //   );

  //   await treeAuctionInstance
  //     .endAuction(1, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.END_AUCTION_BEFORE_END_TIME);

  //   await Common.travelTime(TimeEnumes.hours, 1);

  //   let TreasuryInstanceBeforeAuctionEnd = await web3.eth.getBalance(
  //     TreasuryInstance.address
  //   );

  //   let successEnd = await treeAuctionInstance.endAuction(1, {
  //     from: deployerAccount,
  //   });

  //   assert.equal(
  //     await web3.eth.getBalance(TreasuryInstance.address),
  //     Math.add(
  //       Number(TreasuryInstanceBeforeAuctionEnd),
  //       Number(web3.utils.toWei("1.25", "Ether"))
  //     ),
  //     "treasury transfer not work true"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     0,
  //     "Contract balance not true when auction end"
  //   );

  //   //check treasury updated true
  //   let pFund = await TreasuryInstance.planterFunds.call(treeId);

  //   let totalFunds = await TreasuryInstance.totalFunds();

  //   let amount = Number(web3.utils.toWei("1.25"));

  //   let expected = {
  //     planterFund: (30 * amount) / 100,
  //     gbFund: (12 * amount) / 100,
  //     treeResearch: (12 * amount) / 100,
  //     localDevelop: (12 * amount) / 100,
  //     rescueFund: (12 * amount) / 100,
  //     treejerDevelop: (22 * amount) / 100,
  //     otherFund1: 0,
  //     otherFund2: 0,
  //   };

  //   assert.equal(
  //     Number(pFund.toString()),
  //     expected.planterFund,
  //     "planter funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.planterFund.toString()),
  //     expected.planterFund,
  //     "planterFund totalFunds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.gbFund.toString()),
  //     expected.gbFund,
  //     "gbFund funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.treeResearch.toString()),
  //     expected.treeResearch,
  //     "treeResearch funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.localDevelop.toString()),
  //     expected.localDevelop,
  //     "localDevelop funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.rescueFund.toString()),
  //     expected.rescueFund,
  //     "rescueFund funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.treejerDevelop.toString()),
  //     expected.treejerDevelop,
  //     "treejerDevelop funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.otherFund1.toString()),
  //     expected.otherFund1,
  //     "otherFund1 funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.otherFund2.toString()),
  //     expected.otherFund2,
  //     "otherFund2 funds invalid"
  //   );

  //   let successResult = await genesisTreeInstance.genTrees.call(treeId);

  //   assert.equal(
  //     successResult.provideStatus,
  //     0,
  //     "Provide status not true update when auction success"
  //   );

  //   truffleAssert.eventEmitted(successEnd, "AuctionEnded", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == 1 &&
  //       Number(ev.treeId.toString()) == treeId &&
  //       ev.winner == userAccount4 &&
  //       Number(ev.amount.toString()) == web3.utils.toWei("1.25", "Ether")
  //     );
  //   });
  // });

  // //check hold auction
  // it("complex test 2", async () => {
  //   const treeId = 0;
  //   const auctionId = 0;
  //   const gbId = 1;
  //   const gbType = 1;
  //   const birthDate = parseInt(new Date().getTime() / 1000);
  //   const countryCode = 2;

  //   let initialValue = web3.utils.toWei("1");
  //   let bidInterval = web3.utils.toWei("0.1");

  //   startTime = await Common.timeInitial(TimeEnumes.minutes, 5);
  //   endTime = await Common.timeInitial(TimeEnumes.days, 5);

  //   await genesisTreeInstance.setTreeTokenAddress(treeTokenInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await genesisTreeInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await Common.successPlant(
  //     genesisTreeInstance,
  //     gbInstance,
  //     arInstance,
  //     ipfsHash,
  //     treeId,
  //     gbId,
  //     gbType,
  //     birthDate,
  //     countryCode,
  //     [userAccount2, userAccount6, userAccount7], //GB planter list
  //     userAccount1,
  //     userAccount2,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.addFundDistributionModel(
  //     3500,
  //     1000,
  //     1000,
  //     1500,
  //     1000,
  //     2000,
  //     0,
  //     0,
  //     {
  //       from: userAccount5,
  //     }
  //   ).should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

  //   await TreasuryInstance.addFundDistributionModel(
  //     3500,
  //     1000,
  //     1000,
  //     1500,
  //     1000,
  //     2000,
  //     0,
  //     0,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 0, 0, {
  //     from: deployerAccount,
  //   });

  //   await treeAuctionInstance.createAuction(
  //     treeId,
  //     startTime,
  //     endTime,
  //     initialValue,
  //     bidInterval,
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   let createResult = await genesisTreeInstance.genTrees.call(treeId);

  //   assert.equal(
  //     createResult.provideStatus,
  //     1,
  //     "Provide status not true update when auction create"
  //   );

  //   await treeAuctionInstance
  //     .createAuction(treeId, startTime, endTime, initialValue, bidInterval, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.TREE_STATUS);

  //   await treeAuctionInstance
  //     .bid(auctionId, {
  //       value: web3.utils.toWei("1.50"),
  //       from: userAccount3,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_BEFORE_START);

  //   await Common.travelTime(TimeEnumes.minutes, 5);

  //   await treeAuctionInstance
  //     .bid(auctionId, {
  //       value: web3.utils.toWei("1.09"),
  //       from: userAccount3,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

  //   await treeAuctionInstance.bid(auctionId, {
  //     value: web3.utils.toWei("1.15"),
  //     from: userAccount3,
  //   });
  //   await Common.travelTime(TimeEnumes.days, 1);

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("1.15", "Ether"),
  //     "1.Contract balance is not true"
  //   );

  //   let firstBiderAfterBid = await web3.eth.getBalance(userAccount3);

  //   await treeAuctionInstance
  //     .bid(auctionId, {
  //       value: web3.utils.toWei("1.13"),
  //       from: userAccount4,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

  //   await treeAuctionInstance
  //     .bid(auctionId, {
  //       value: web3.utils.toWei("1.24"),
  //       from: userAccount4,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.BID_VALUE);

  //   await treeAuctionInstance.bid(auctionId, {
  //     value: web3.utils.toWei("1.25"),
  //     from: userAccount4,
  //   });

  //   let firstBiderAfterAutomaticWithdraw1 = await web3.eth.getBalance(
  //     userAccount3
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("1.25", "Ether"),
  //     "2.Contract balance is not true"
  //   );

  //   assert.equal(
  //     firstBiderAfterAutomaticWithdraw1,
  //     Math.add(
  //       Number(firstBiderAfterBid),
  //       Number(web3.utils.toWei("1.15", "Ether"))
  //     ),
  //     "1.automatic withdraw not true work"
  //   );

  //   let firstBiderAfterBid4 = await web3.eth.getBalance(userAccount4);

  //   await treeAuctionInstance.bid(auctionId, {
  //     value: web3.utils.toWei("1.5312"),
  //     from: userAccount5,
  //   });

  //   let firstBiderAfterAutomaticWithdraw2 = await web3.eth.getBalance(
  //     userAccount4
  //   );

  //   assert.equal(
  //     firstBiderAfterAutomaticWithdraw2,
  //     Math.add(
  //       Number(firstBiderAfterBid4),
  //       Number(web3.utils.toWei("1.25", "Ether"))
  //     ),
  //     "2.automatic withdraw not true work"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("1.5312", "Ether"),
  //     "3.Contract balance is not true"
  //   );

  //   await Common.travelTime(TimeEnumes.days, 2);

  //   let firstBiderAfterBid5 = await web3.eth.getBalance(userAccount5);

  //   await treeAuctionInstance.bid(auctionId, {
  //     value: web3.utils.toWei("2.12"),
  //     from: userAccount3,
  //   });

  //   let firstBiderAfterAutomaticWithdraw3 = await web3.eth.getBalance(
  //     userAccount5
  //   );

  //   assert.equal(
  //     firstBiderAfterAutomaticWithdraw3,
  //     Math.add(
  //       Number(firstBiderAfterBid5),
  //       Number(web3.utils.toWei("1.5312", "Ether"))
  //     ),
  //     "3.automatic withdraw not true work"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("2.12", "Ether"),
  //     "4.Contract balance is not true"
  //   );

  //   //planter update tree
  //   await genesisTreeInstance.updateTree(treeId, ipfsHash, {
  //     from: userAccount2,
  //   });

  //   await genesisTreeInstance.verifyUpdate(treeId, true, {
  //     from: userAccount7,
  //   });

  //   let planterBalance = await TreasuryInstance.balances.call(userAccount2);

  //   assert.equal(planterBalance, 0, "1.planter balance not true in treasury");

  //   await treeAuctionInstance
  //     .endAuction(auctionId, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.END_AUCTION_BEFORE_END_TIME);

  //   await Common.travelTime(TimeEnumes.days, 1);

  //   await Common.travelTime(TimeEnumes.minutes, 1430);

  //   //final bid
  //   let firstBiderAfterBid3_2 = await web3.eth.getBalance(userAccount3);

  //   let tx = await treeAuctionInstance.bid(auctionId, {
  //     value: web3.utils.toWei("2.52"),
  //     from: userAccount4,
  //   });

  //   truffleAssert.eventEmitted(tx, "AuctionEndTimeIncreased", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == 0 &&
  //       ev.bidder == userAccount4 &&
  //       Number(ev.newAuctionEndTime.toString()) ==
  //         Math.add(Number(endTime.toString()), 600)
  //     );
  //   });

  //   let firstBiderAfterAutomaticWithdraw4 = await web3.eth.getBalance(
  //     userAccount3
  //   );

  //   assert.equal(
  //     firstBiderAfterAutomaticWithdraw4,
  //     Math.add(
  //       Number(firstBiderAfterBid3_2),
  //       Number(web3.utils.toWei("2.12", "Ether"))
  //     ),
  //     "4.automatic withdraw not true work"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("2.52", "Ether"),
  //     "5.Contract balance is not true"
  //   );

  //   await Common.travelTime(TimeEnumes.minutes, 15);

  //   let successEnd = await treeAuctionInstance.endAuction(auctionId, {
  //     from: userAccount4,
  //   });

  //   await treeAuctionInstance
  //     .createAuction(treeId, startTime, endTime, initialValue, bidInterval, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.TREE_STATUS);

  //   assert.equal(
  //     await web3.eth.getBalance(treeAuctionInstance.address),
  //     web3.utils.toWei("0", "Ether"),
  //     "6.Contract balance is not true"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(TreasuryInstance.address),
  //     web3.utils.toWei("2.52", "Ether"),
  //     "Treasury contract balance is not true"
  //   );

  //   truffleAssert.eventEmitted(successEnd, "AuctionEnded", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == auctionId &&
  //       Number(ev.treeId.toString()) == treeId &&
  //       ev.winner == userAccount4 &&
  //       Number(ev.amount.toString()) == web3.utils.toWei("2.52", "Ether")
  //     );
  //   });

  //   let addressGetToken = await treeTokenInstance.ownerOf(treeId);

  //   assert.equal(addressGetToken, userAccount4, "token not true mint");

  //   //check treasury updated true
  //   let pFund = await TreasuryInstance.planterFunds.call(treeId);

  //   let totalFunds = await TreasuryInstance.totalFunds();

  //   let amount = Number(web3.utils.toWei("2.52"));

  //   let expected = {
  //     planterFund: (35 * amount) / 100,
  //     gbFund: (10 * amount) / 100,
  //     treeResearch: (10 * amount) / 100,
  //     localDevelop: (15 * amount) / 100,
  //     rescueFund: (10 * amount) / 100,
  //     treejerDevelop: (20 * amount) / 100,
  //     otherFund1: 0,
  //     otherFund2: 0,
  //   };

  //   assert.equal(
  //     Number(pFund.toString()),
  //     expected.planterFund,
  //     "planter funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.planterFund.toString()),
  //     expected.planterFund,
  //     "planterFund totalFunds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.gbFund.toString()),
  //     expected.gbFund,
  //     "gbFund funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.treeResearch.toString()),
  //     expected.treeResearch,
  //     "treeResearch funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.localDevelop.toString()),
  //     expected.localDevelop,
  //     "localDevelop funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.rescueFund.toString()),
  //     expected.rescueFund,
  //     "rescueFund funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.treejerDevelop.toString()),
  //     expected.treejerDevelop,
  //     "treejerDevelop funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.otherFund1.toString()),
  //     expected.otherFund1,
  //     "otherFund1 funds invalid"
  //   );

  //   assert.equal(
  //     Number(totalFunds.otherFund2.toString()),
  //     expected.otherFund2,
  //     "otherFund2 funds invalid"
  //   );

  //   //planter update tree
  //   await genesisTreeInstance.updateTree(treeId, ipfsHash, {
  //     from: userAccount2,
  //   });

  //   await genesisTreeInstance.verifyUpdate(treeId, true, {
  //     from: userAccount7,
  //   });

  //   let planterBalance2 = await TreasuryInstance.balances.call(userAccount2);

  //   assert.equal(
  //     planterBalance2,
  //     parseInt(
  //       Math.divide(
  //         Math.mul(Number(web3.utils.toWei("2.52")), 0.35, 120),
  //         25920
  //       )
  //     ),
  //     "2.planter balance not true in treasury"
  //   );

  //   let plantersPaidTreeId0_1 = await TreasuryInstance.plantersPaid.call(
  //     treeId
  //   );

  //   assert.equal(
  //     plantersPaidTreeId0_1,
  //     parseInt(
  //       Math.divide(
  //         Math.mul(Number(web3.utils.toWei("2.52")), 0.35, 120),
  //         25920
  //       )
  //     ),
  //     "1.planter paid not true in treasury"
  //   );

  //   //planter withdraw

  //   let firstWithdrawPlanter = Number(web3.utils.toWei(".001"));

  //   await TreasuryInstance.withdrawPlanterBalance(web3.utils.toWei("1"), {
  //     from: userAccount2,
  //   }).should.be.rejectedWith(TreesuryManagerErrorMsg.INSUFFICIENT_AMOUNT);

  //   await TreasuryInstance.withdrawPlanterBalance(web3.utils.toWei(".001"), {
  //     from: userAccount2,
  //   });

  //   let planterBalance3 = await TreasuryInstance.balances.call(userAccount2);

  //   assert.equal(
  //     planterBalance3,
  //     Math.subtract(
  //       parseInt(
  //         Math.divide(
  //           Math.mul(Number(web3.utils.toWei("2.52")), 0.35, 120),
  //           25920
  //         )
  //       ),
  //       firstWithdrawPlanter
  //     ),
  //     "3.planter balance not true in treasury"
  //   );

  //   await Common.travelTime(TimeEnumes.years, 3);

  //   //planter update tree
  //   await genesisTreeInstance.updateTree(treeId, ipfsHash, {
  //     from: userAccount2,
  //   });

  //   await genesisTreeInstance.verifyUpdate(treeId, true, {
  //     from: userAccount7,
  //   });

  //   let planterBalance4 = await TreasuryInstance.balances.call(userAccount2);

  //   assert.equal(
  //     planterBalance4,
  //     Math.subtract(
  //       Math.mul(Number(web3.utils.toWei("2.52")), 0.35),
  //       firstWithdrawPlanter
  //     ),
  //     "4.planter balance not true in treasury"
  //   );

  //   let plantersPaidTreeId0_2 = await TreasuryInstance.plantersPaid.call(
  //     treeId
  //   );

  //   let planterFundsTreeId0_2 = await TreasuryInstance.planterFunds.call(
  //     treeId
  //   );

  //   assert.equal(
  //     Number(plantersPaidTreeId0_2.toString()),
  //     Number(planterFundsTreeId0_2.toString()),
  //     "planter paid not equal to planter funds"
  //   );

  //   let treasuryBalance = await web3.eth.getBalance(TreasuryInstance.address);

  //   assert.equal(
  //     treasuryBalance,
  //     Math.subtract(
  //       Number(web3.utils.toWei("2.52")),
  //       Number(web3.utils.toWei(".001"))
  //     ),
  //     "2.treasury balance not true"
  //   );

  //   let totalFunds2 = await TreasuryInstance.totalFunds();

  //   let treejerDevelopBalance = totalFunds2.treejerDevelop.toString();
  //   let ownerAccountBalanceBefore = await web3.eth.getBalance(ownerAccount);

  //   await TreasuryInstance.setTreejerDevelopAddress(ownerAccount, {
  //     from: deployerAccount,
  //   });

  //   await TreasuryInstance.withdrawTreejerDevelop(
  //     web3.utils.toWei(totalFunds2.treejerDevelop.toString(), "wei"),
  //     "reason message",
  //     {
  //       from: deployerAccount,
  //     }
  //   );

  //   let ownerAccountBalanceAfter = await web3.eth.getBalance(ownerAccount);

  //   assert.equal(
  //     Number(ownerAccountBalanceAfter.toString()),
  //     Math.add(
  //       Number(ownerAccountBalanceBefore.toString()),
  //       Number(treejerDevelopBalance.toString())
  //     ),
  //     "1.owner balance not true"
  //   );

  //   assert.equal(
  //     await web3.eth.getBalance(TreasuryInstance.address),
  //     Math.subtract(
  //       Number(web3.utils.toWei("2.52")),
  //       Math.add(
  //         Number(web3.utils.toWei(".001")),
  //         Number(treejerDevelopBalance.toString())
  //       )
  //     ),
  //     "3.treasury balance not true"
  //   );
  // });

  // it("complex test 3 ( complete auction done ) ", async () => {
  //   const treeId1 = 1;
  //   const treeId2 = 2;
  //   const gbId = 1;
  //   const auctionId1 = 0;
  //   const initialPrice = web3.utils.toWei("1");
  //   const bidInterval = web3.utils.toWei("0.1");

  //   startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
  //   endTime = await Common.timeInitial(TimeEnumes.hours, 1);

  //   //////////////// --------- set contract address
  //   await treeAuctionInstance.setGenesisTreeAddress(
  //     genesisTreeInstance.address,
  //     {
  //       from: deployerAccount,
  //     }
  //   );
  //   await treeAuctionInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });
  //   await genesisTreeInstance.setTreeTokenAddress(treeTokenInstance.address, {
  //     from: deployerAccount,
  //   });
  //   await genesisTreeInstance.setTreasuryAddress(TreasuryInstance.address, {
  //     from: deployerAccount,
  //   });

  //   //////////////// -----------  fail to create auction
  //   await treeAuctionInstance
  //     .createAuction(treeId1, startTime, endTime, initialPrice, bidInterval, {
  //       from: userAccount1,
  //     })
  //     .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);
  //   await treeAuctionInstance
  //     .createAuction(treeId1, startTime, endTime, initialPrice, bidInterval, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.INVALID_ASSIGN_MODEL);
  //   await Common.addAuctionRole(
  //     arInstance,
  //     treeAuctionInstance.address,
  //     deployerAccount
  //   );

  //   ////////////// fail to add fund dm

  //   await TreasuryInstance.addFundDistributionModel(
  //     5000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     0,
  //     0,
  //     { from: userAccount1 }
  //   ).should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);
  //   await TreasuryInstance.addFundDistributionModel(
  //     5000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     { from: deployerAccount }
  //   ).should.be.rejectedWith(TreesuryManagerErrorMsg.SUM_INVALID);

  //   ///////// ----- add fund dm
  //   await TreasuryInstance.addFundDistributionModel(
  //     5000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     1000,
  //     0,
  //     0,
  //     { from: deployerAccount }
  //   );
  //   ////////// ----------- assign tree fund dm
  //   await TreasuryInstance.assignTreeFundDistributionModel(0, 10, 0, {
  //     from: deployerAccount,
  //   });

  //   //////// ----------- fail to create auction <<invalid-tree>>
  //   await treeAuctionInstance
  //     .createAuction(treeId1, startTime, endTime, initialPrice, bidInterval, {
  //       from: deployerAccount,
  //     })
  //     .should.be.rejectedWith(GenesisTreeErrorMsg.INVALID_TREE);

  //   /////////------------------ ad tree
  //   await genesisTreeInstance.addTree(treeId1, ipfsHash, {
  //     from: deployerAccount,
  //   });
  //   ///// --------- create auction
  //   await treeAuctionInstance.createAuction(
  //     treeId1,
  //     startTime,
  //     endTime,
  //     initialPrice,
  //     bidInterval,
  //     { from: deployerAccount }
  //   );
  //   const initailAuction = await treeAuctionInstance.auctions.call(auctionId1);

  //   //////////// bid 1

  //   let bidTx = await treeAuctionInstance.bid(auctionId1, {
  //     from: userAccount8,
  //     value: web3.utils.toWei("1.5"),
  //   });
  //   truffleAssert.eventEmitted(bidTx, "HighestBidIncreased", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == auctionId1 &&
  //       ev.treeId == treeId1 &&
  //       ev.bidder == userAccount8 &&
  //       Number(ev.amount.toString()) ==
  //         Number(web3.utils.toWei("1.5").toString())
  //     );
  //   });

  //   /////////////// bid 2
  //   await Common.travelTime(TimeEnumes.minutes, 55);
  //   const FinalBidTx = await treeAuctionInstance.bid(auctionId1, {
  //     from: userAccount7,
  //     value: web3.utils.toWei("2"),
  //   });
  //   const auctionAfterEndTimeIncrease = await treeAuctionInstance.auctions.call(
  //     auctionId1
  //   );

  //   truffleAssert.eventEmitted(FinalBidTx, "HighestBidIncreased", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == auctionId1 &&
  //       ev.treeId == treeId1 &&
  //       ev.bidder == userAccount7 &&
  //       Number(ev.amount.toString()) == Number(web3.utils.toWei("2").toString())
  //     );
  //   });

  //   assert.equal(
  //     Number(initailAuction.endDate.toString()) + 600,
  //     Number(auctionAfterEndTimeIncrease.endDate.toString()),
  //     "invaild end time for auction after increase time"
  //   );
  //   truffleAssert.eventEmitted(FinalBidTx, "AuctionEndTimeIncreased", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == auctionId1 &&
  //       ev.bidder == userAccount7 &&
  //       Number(ev.newAuctionEndTime.toString()) ==
  //         Number(initailAuction.endDate.toString()) + 600
  //     );
  //   });

  //   const treasuryBalanceBeforeAuctionEnd = await web3.eth.getBalance(
  //     TreasuryInstance.address
  //   );
  //   const totalFundBeforeAuctionEnd = await TreasuryInstance.totalFunds();
  //   ///------------ check totalFunds before auction end
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.planterFund.toString()),
  //     0,
  //     "invalid planterFund"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.gbFund.toString()),
  //     0,
  //     "invalid gbFund"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.treeResearch.toString()),
  //     0,
  //     "invalid treeResearch"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.localDevelop.toString()),
  //     0,
  //     "invalid localDevelop"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.rescueFund.toString()),
  //     0,
  //     "invalid rescueFund"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.treejerDevelop.toString()),
  //     0,
  //     "invalid treejerDevelop"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.otherFund1.toString()),
  //     0,
  //     "invalid otherFund1"
  //   );
  //   assert.equal(
  //     Number(totalFundBeforeAuctionEnd.otherFund2.toString()),
  //     0,
  //     "invalid otherFund2"
  //   );
  //   //------------- end auction
  //   await treeAuctionInstance
  //     .endAuction(auctionId1)
  //     .should.be.rejectedWith(TreeAuctionErrorMsg.END_AUCTION_BEFORE_END_TIME);
  //   await Common.travelTime(TimeEnumes.minutes, 20);
  //   const endAuctionTx = await treeAuctionInstance.endAuction(auctionId1);

  //   const treasuryBalanceAfterAuctionEnd = await web3.eth.getBalance(
  //     TreasuryInstance.address
  //   );

  //   let tokenOwner = await treeTokenInstance.ownerOf(treeId1);
  //   assert.equal(tokenOwner, userAccount7, "token owner not correct");
  //   const totalPlanterFund =
  //     (Number(web3.utils.toWei("2").toString()) * 5000) / 10000;
  //   const expectedPayValue = {
  //     planterFund: (Number(web3.utils.toWei("2").toString()) * 5000) / 10000,
  //     gbFund: (Number(web3.utils.toWei("2").toString()) * 1000) / 10000,
  //     treeResearch: (Number(web3.utils.toWei("2").toString()) * 1000) / 10000,
  //     localDevelop: (Number(web3.utils.toWei("2").toString()) * 1000) / 10000,
  //     rescueFund: (Number(web3.utils.toWei("2").toString()) * 1000) / 10000,
  //     treejerDevelop: (Number(web3.utils.toWei("2").toString()) * 1000) / 10000,
  //     otherFund1: 0,
  //     otherFund2: 0,
  //   };

  //   const totalFundAfterAuctionEnd = await TreasuryInstance.totalFunds();
  //   ///------------ check totalFunds after auction end
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.planterFund.toString()),
  //     expectedPayValue.planterFund,
  //     "invalid planterFund"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.gbFund.toString()),
  //     expectedPayValue.gbFund,
  //     "invalid gbFund"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.treeResearch.toString()),
  //     expectedPayValue.treeResearch,
  //     "invalid treeResearch"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.localDevelop.toString()),
  //     expectedPayValue.localDevelop,
  //     "invalid localDevelop"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.rescueFund.toString()),
  //     expectedPayValue.rescueFund,
  //     "invalid rescueFund"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.treejerDevelop.toString()),
  //     expectedPayValue.treejerDevelop,
  //     "invalid treejerDevelop"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.otherFund1.toString()),
  //     expectedPayValue.otherFund1,
  //     "invalid otherFund1"
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.otherFund2.toString()),
  //     expectedPayValue.otherFund2,
  //     "invalid otherFund2"
  //   );
  //   ///////////------------ check charge treasury contract
  //   assert.equal(
  //     Number(treasuryBalanceAfterAuctionEnd.toString()) -
  //       Number(treasuryBalanceBeforeAuctionEnd.toString()),
  //     Number(web3.utils.toWei("2").toString()),
  //     "treasury done charge correctly"
  //   );

  //   truffleAssert.eventEmitted(endAuctionTx, "AuctionEnded", (ev) => {
  //     return (
  //       Number(ev.auctionId.toString()) == auctionId1 &&
  //       Number(ev.treeId.toString()) == treeId1 &&
  //       ev.winner == userAccount7 &&
  //       Number(ev.amount.toString()) == Number(web3.utils.toWei("2").toString())
  //     );
  //   });
  //   //////////////// ----------------------- setting up gb
  //   await genesisTreeInstance.setGBFactoryAddress(gbInstance.address, {
  //     from: deployerAccount,
  //   });
  //   await Common.addAmbassador(arInstance, userAccount1, deployerAccount);
  //   await Common.addPlanter(arInstance, userAccount2, deployerAccount);
  //   await Common.addGB(gbInstance, userAccount1, [userAccount2], "gb 1");
  //   /////////////----------------------- plant tree
  //   await genesisTreeInstance.asignTreeToPlanter(
  //     treeId1,
  //     gbId,
  //     userAccount2,
  //     1,
  //     {
  //       from: deployerAccount,
  //     }
  //   );
  //   await genesisTreeInstance.plantTree(treeId1, ipfsHash, 1, 1, {
  //     from: userAccount2,
  //   });
  //   await genesisTreeInstance.verifyPlant(treeId1, true, {
  //     from: deployerAccount,
  //   });
  //   ////////////// ------------------- update tree
  //   await genesisTreeInstance
  //     .updateTree(treeId1, ipfsHash, { from: userAccount2 })
  //     .should.be.rejectedWith(GenesisTreeErrorMsg.UPDATE_TIME_NOT_REACH);
  //   await Common.travelTime(TimeEnumes.hours, 26);

  //   await genesisTreeInstance.updateTree(treeId1, ipfsHash, {
  //     from: userAccount2,
  //   });
  //   /////////////////// --------------- verify update

  //   await genesisTreeInstance.verifyUpdate(treeId1, true, {
  //     from: deployerAccount,
  //   });

  //   //////////////// ---------------------- check total funds value

  //   const totalFundsAfterFundPlanter = await TreasuryInstance.totalFunds();
  //   const planterPaidAfterVerify = await TreasuryInstance.plantersPaid.call(
  //     treeId1
  //   );
  //   const resultAfterGT = await genesisTreeInstance.genTrees.call(treeId1);
  //   const expectedPaidAfterFundPlanter = parseInt(
  //     (totalPlanterFund * Number(resultAfterGT.treeStatus.toString())) / 25920
  //   );
  //   assert.equal(
  //     Number(totalFundAfterAuctionEnd.planterFund.toString()) -
  //       expectedPaidAfterFundPlanter,
  //     Number(totalFundsAfterFundPlanter.planterFund.toString()),
  //     "planter total fund is not ok"
  //   );

  //   ///////////// ------------------------- check paid planter funds
  //   assert.equal(
  //     Number(planterPaidAfterVerify.toString()),
  //     expectedPaidAfterFundPlanter,
  //     "planter paid not correct"
  //   );
  //   /////////////---------------------- check planter balance before withdraw

  //   const planterPaidBeforeWithdrawTotalAmount = await TreasuryInstance.balances.call(
  //     userAccount2
  //   );

  //   assert.equal(
  //     Number(planterPaidBeforeWithdrawTotalAmount.toString()),
  //     expectedPaidAfterFundPlanter,
  //     "planter balance before withdraw is not ok"
  //   );

  //   ////////////// ----------------- withdraw planter fund
  //   await TreasuryInstance.withdrawPlanterBalance(
  //     expectedPaidAfterFundPlanter,
  //     {
  //       from: userAccount2,
  //     }
  //   );
  //   ////////////////--------------- check planter balance after withdraw
  //   const planterPaidAfterWithdrawTotalAmount = await TreasuryInstance.balances.call(
  //     userAccount2
  //   );
  //   assert.equal(
  //     Number(planterPaidAfterWithdrawTotalAmount.toString()),
  //     0,
  //     "planter fund is not ok after withdraw total amount"
  //   );
  // });
});
