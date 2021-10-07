// const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
// const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
// const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

// const WETH_10 = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F";

// const DAI_WHALE = process.env.DAI_WHALE;
// const USDC_WHALE = process.env.USDC_WHALE;
// const USDT_WHALE = process.env.USDT_WHALE;
// const WETH_WHALE = process.env.WETH_WHALE;
// const WBTC_WHALE = process.env.WBTC_WHALE;

// // compound
// const CDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
// const CUSDC = "0x39AA39c021dfbaE8faC545936693aC917d5E7563";
// const CWBTC = "0xccF4429DB6322D5C611ee964527D42E5d685DD6a";
// const CETH = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";

// module.exports = {
//   DAI,
//   USDC,
//   USDT,
//   WETH,
//   WBTC,
//   WETH_10,
//   DAI_WHALE,
//   USDC_WHALE,
//   USDT_WHALE,
//   WETH_WHALE,
//   WBTC_WHALE,
//   CDAI,
//   CUSDC,
//   CWBTC,
//   CETH,
// };
const AccessRestriction = artifacts.require("AccessRestriction");
const CommunityGifts = artifacts.require("CommunityGifts.sol");
const TreeAttribute = artifacts.require("TreeAttribute.sol");
const TreeFactory = artifacts.require("TreeFactory.sol");
const Allocation = artifacts.require("Allocation.sol");
const PlanterFund = artifacts.require("PlanterFund.sol");
const Tree = artifacts.require("Tree.sol");
const Dai = artifacts.require("Dai.sol");
const TestCommunityGifts = artifacts.require("TestCommunityGifts.sol");
const assert = require("chai").assert;
require("chai").use(require("chai-as-promised")).should();
const Units = require("ethereumjs-units");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const truffleAssert = require("truffle-assertions");
const Common = require("./common");
const math = require("./math");

//gsn
const WhitelistPaymaster = artifacts.require("WhitelistPaymaster");
const Gsn = require("@opengsn/provider");
const { GsnTestEnvironment } = require("@opengsn/cli/dist/GsnTestEnvironment");
const ethers = require("ethers");

const {
  CommonErrorMsg,
  TimeEnumes,
  CommunityGiftErrorMsg,
  TreeAttributeErrorMsg,
  erc20ErrorMsg,
  GsnErrorMsg,
} = require("./enumes");

contract("CommunityGifts", (accounts) => {
  let communityGiftsInstance;
  let arInstance;
  let treeAttributeInstance;
  let treeFactoryInstance;

  let treeTokenInstance;
  let planterFundsInstnce;
  let daiInstance;

  const dataManager = accounts[0];
  const deployerAccount = accounts[1];
  const userAccount1 = accounts[2];
  const userAccount2 = accounts[3];
  const userAccount3 = accounts[4];
  const userAccount4 = accounts[5];
  const userAccount5 = accounts[6];
  const userAccount6 = accounts[7];
  const userAccount7 = accounts[8];
  const userAccount8 = accounts[9];

  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const initialPlanterFund = web3.utils.toWei("0.5");
  const initialReferralFund = web3.utils.toWei("0.1");

  before(async () => {
    arInstance = await deployProxy(AccessRestriction, [deployerAccount], {
      initializer: "initialize",
      from: deployerAccount,
      unsafeAllowCustomTypes: true,
    });

    await Common.addDataManager(arInstance, dataManager, deployerAccount);
  });

  afterEach(async () => {});

  ////////////////--------------------------------------------gsn------------------------------------------------
  // it("test gsn [ @skip-on-coverage ]", async () => {
  //   let env = await GsnTestEnvironment.startGsn("localhost");

  //   const { forwarderAddress, relayHubAddress, paymasterAddress } =
  //     env.contractsDeployment;

  //   await communityGiftsInstance.setTrustedForwarder(forwarderAddress, {
  //     from: deployerAccount,
  //   });

  //   let paymaster = await WhitelistPaymaster.new(arInstance.address);

  //   await paymaster.setRelayHub(relayHubAddress);
  //   await paymaster.setTrustedForwarder(forwarderAddress);

  //   web3.eth.sendTransaction({
  //     from: accounts[0],
  //     to: paymaster.address,
  //     value: web3.utils.toWei("1"),
  //   });

  //   origProvider = web3.currentProvider;

  //   conf = { paymasterAddress: paymaster.address };

  //   gsnProvider = await Gsn.RelayProvider.newProvider({
  //     provider: origProvider,
  //     config: conf,
  //   }).init();

  //   provider = new ethers.providers.Web3Provider(gsnProvider);

  //   let signerGiftee = provider.getSigner(3);

  //   let contractCommunityGift = await new ethers.Contract(
  //     communityGiftsInstance.address,
  //     communityGiftsInstance.abi,
  //     signerGiftee
  //   );

  //   const giftee = userAccount2;
  //   const symbol = 1234554321;

  //   //////////--------------add giftee by admin

  //   const startTree = 11;
  //   const endTree = 13;
  //   const planterShare = web3.utils.toWei("5");
  //   const referralShare = web3.utils.toWei("2");
  //   const transferAmount = web3.utils.toWei("14");
  //   const adminWallet = userAccount8;
  //   const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

  //   ///////---------------- handle admin walllet

  //   await daiInstance.setMint(adminWallet, transferAmount);

  //   await daiInstance.approve(communityGiftsInstance.address, transferAmount, {
  //     from: adminWallet,
  //   });

  //   //////////--------------add giftee by admin

  //   await communityGiftsInstance.setGiftsRange(
  //     startTree,
  //     endTree,
  //     planterShare,
  //     referralShare,
  //     Number(expireDate),
  //     adminWallet,
  //     {
  //       from: dataManager,
  //     }
  //   );

  //   await communityGiftsInstance.updateGiftees(giftee, symbol, {
  //     from: dataManager,
  //   });

  //   await communityGiftsInstance.setPrice(
  //     web3.utils.toWei("4.9"), //planter share
  //     web3.utils.toWei("2.1"), //referral share
  //     { from: dataManager }
  //   );

  //   let balanceAccountBefore = await web3.eth.getBalance(giftee);

  //   await contractCommunityGift
  //     .claimTree({
  //       from: giftee,
  //     })
  //     .should.be.rejectedWith(GsnErrorMsg.ADDRESS_NOT_EXISTS);

  //   await paymaster.addFunderWhitelistTarget(communityGiftsInstance.address, {
  //     from: deployerAccount,
  //   });

  //   await contractCommunityGift.claimTree({
  //     from: giftee,
  //   });

  //   let balanceAccountAfter = await web3.eth.getBalance(giftee);

  //   assert.equal(
  //     balanceAccountAfter,
  //     balanceAccountBefore,
  //     "gsn not true work"
  //   );
  // });

  /*
  describe("deployment and set addresses", () => {
    beforeEach(async () => {
      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [arInstance.address, initialPlanterFund, initialReferralFund],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });
    });
    it("deploys successfully and set addresses", async () => {
      //////////////////------------------------------------ deploy successfully ----------------------------------------//
      const address = communityGiftsInstance.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);

      ///////////////---------------------------------set trust forwarder address--------------------------------------------------------

      await communityGiftsInstance
        .setTrustedForwarder(userAccount2, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance
        .setTrustedForwarder(zeroAddress, {
          from: deployerAccount,
        })
        .should.be.rejectedWith(CommonErrorMsg.INVALID_ADDRESS);

      await communityGiftsInstance.setTrustedForwarder(userAccount2, {
        from: deployerAccount,
      });

      assert.equal(
        userAccount2,
        await communityGiftsInstance.trustedForwarder(),
        "address set incorrect"
      );

      /////////////////---------------------------------set dai token address--------------------------------------------------------

      await communityGiftsInstance
        .setDaiTokenAddress(daiInstance.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance
        .setDaiTokenAddress(zeroAddress, {
          from: deployerAccount,
        })
        .should.be.rejectedWith(CommonErrorMsg.INVALID_ADDRESS);

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      assert.equal(
        daiInstance.address,
        await communityGiftsInstance.daiToken.call(),
        "address set incorect"
      );

      /////////////////---------------------------------set tree attribute address--------------------------------------------------------
      await communityGiftsInstance
        .setTreeAttributesAddress(treeAttributeInstance.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      assert.equal(
        treeAttributeInstance.address,
        await communityGiftsInstance.treeAttribute.call(),
        "address set incorect"
      );

      /////////////////---------------------------------set tree factory address--------------------------------------------------------

      await communityGiftsInstance
        .setTreeFactoryAddress(treeFactoryInstance.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      assert.equal(
        treeFactoryInstance.address,
        await communityGiftsInstance.treeFactory.call(),
        "address set incorect"
      );
      /////////////////---------------------------------set planter fund address--------------------------------------------------------

      await communityGiftsInstance
        .setPlanterFundAddress(planterFundsInstnce.address, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_ADMIN);

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      assert.equal(
        planterFundsInstnce.address,
        await communityGiftsInstance.planterFundContract.call(),
        "address set incorect"
      );
    });
  });
  
  describe("set price and add giftee update giftee", () => {
    beforeEach(async () => {
      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [arInstance.address, initialPlanterFund, initialReferralFund],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );
    });

    /////////////////-------------------------------------- set price ------------------------------------------------

    it("should set price successfully and check data to be ok and fail in invalid situation", async () => {
      const planterFund = Units.convert("0.5", "eth", "wei");
      const referralFund = Units.convert("0.1", "eth", "wei");

      ////////// --------------- fail because caller is not data manager
      await communityGiftsInstance
        .setPrice(100, 200, { from: userAccount1 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      const eventTx = await communityGiftsInstance.setPrice(
        planterFund,
        referralFund,
        {
          from: dataManager,
        }
      );

      const settedPlanterFund = await communityGiftsInstance.planterFund.call();
      const settedReferralFund =
        await communityGiftsInstance.referralFund.call();

      assert.equal(
        Number(settedPlanterFund),
        Number(planterFund),
        "planter fund is not correct"
      );

      assert.equal(
        Number(settedReferralFund),
        Number(referralFund),
        "referral fund is not correct"
      );

      truffleAssert.eventEmitted(eventTx, "CommunityGiftPlanterFund", (ev) => {
        return (
          Number(ev.planterFund) == Number(planterFund) &&
          Number(ev.referralFund) == Number(referralFund)
        );
      });
    });

    /////////////////---------------------------------addGiftee--------------------------------------------------------
    it("should add giftee", async () => {
      const startDate = parseInt(new Date().getTime() / 1000) + 60 * 60;
      const expireDate = parseInt(new Date().getTime() / 1000) + 2 * 60 * 60;

      const newStartDate = parseInt(new Date().getTime() / 1000) + 5 * 60 * 60;
      const newExpireDate = parseInt(new Date().getTime() / 1000) + 9 * 60 * 60;

      await communityGiftsInstance
        .addGiftee(userAccount1, startDate, expireDate, { from: userAccount2 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      await communityGiftsInstance.addGiftee(
        userAccount1,
        startDate,
        expireDate,
        {
          from: dataManager,
        }
      );

      const oldGiftee = await communityGiftsInstance.giftees.call(userAccount1);

      assert.equal(Number(oldGiftee.status), 1, "status is incorrect");

      assert.equal(
        Number(oldGiftee.expireDate),
        expireDate,
        "expire date is incorrect"
      );

      assert.equal(
        Number(oldGiftee.startDate),
        startDate,
        "start date is incorrect"
      );

      await communityGiftsInstance.addGiftee(
        userAccount1,
        newStartDate,
        newExpireDate,
        {
          from: dataManager,
        }
      );

      const newGiftee = await communityGiftsInstance.giftees.call(userAccount1);

      assert.equal(Number(newGiftee.status), 1, "status is incorrect");

      assert.equal(
        Number(newGiftee.expireDate),
        newExpireDate,
        "expire date is incorrect"
      );

      assert.equal(
        Number(newGiftee.startDate),
        newStartDate,
        "start date is incorrect"
      );
    });
    /////////////////---------------------------------editGiftee--------------------------------------------------------
    it("should edit giftee", async () => {
      const startDate1 = parseInt(new Date().getTime() / 1000) + 60 * 60;
      const expireDate1 = parseInt(new Date().getTime() / 1000) + 2 * 60 * 60;

      const startDate2 =
        parseInt(new Date().getTime() / 1000) + 1 * 24 * 60 * 60;
      const expireDate2 =
        parseInt(new Date().getTime() / 1000) + 2 * 24 * 60 * 60;

      await communityGiftsInstance
        .updateGiftee(userAccount1, startDate1, expireDate1, {
          from: userAccount8,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      await communityGiftsInstance
        .updateGiftee(userAccount1, startDate1, expireDate1, {
          from: dataManager,
        })
        .should.be.rejectedWith(
          CommunityGiftErrorMsg.UPDATE_GIFTEE_INVALID_STATUS
        );

      await communityGiftsInstance.addGiftee(
        userAccount1,
        startDate1,
        expireDate1,
        { from: dataManager }
      );

      const gifteeAfterAdd = await communityGiftsInstance.giftees.call(
        userAccount1
      );

      assert.equal(Number(gifteeAfterAdd.status), 1, "status is incorrect");

      assert.equal(
        Number(gifteeAfterAdd.expireDate),
        expireDate1,
        "expire date is incorrect"
      );

      assert.equal(
        Number(gifteeAfterAdd.startDate),
        startDate1,
        "start date is incorrect"
      );

      await communityGiftsInstance.updateGiftee(
        userAccount1,
        startDate2,
        expireDate2,
        {
          from: dataManager,
        }
      );

      const gifteeAfterUpdate = await communityGiftsInstance.giftees.call(
        userAccount1
      );

      assert.equal(Number(gifteeAfterUpdate.status), 1, "status is incorrect");

      assert.equal(
        Number(gifteeAfterUpdate.expireDate),
        expireDate2,
        "expire date is incorrect"
      );

      assert.equal(
        Number(gifteeAfterUpdate.startDate),
        startDate2,
        "start date is incorrect"
      );
    });
  });


  describe("reserveSymbol and freeReservedSymbol", () => {
    beforeEach(async () => {
      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [arInstance.address, initialPlanterFund, initialReferralFund],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        { from: deployerAccount }
      );
    });

    it("should reserve symbol", async () => {
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );

      const symbolsArray = [];
      for (let i = 0; i < 5; i++) {
        let rand = parseInt(Math.random() * 10e10);
        while (symbolsArray.includes(rand)) {
          rand = parseInt(Math.random() * 10e10);
        }
        symbolsArray[i] = rand;
      }

      await communityGiftsInstance
        .reserveSymbol(symbolsArray[0], { from: userAccount1 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      for (i = 0; i < symbolsArray.length; i++) {
        await communityGiftsInstance.reserveSymbol(symbolsArray[i], {
          from: dataManager,
        });
      }

      for (let i = 0; i < symbolsArray.length; i++) {
        const symbolsResult = await communityGiftsInstance.symbols.call(i);
        const usedResult = await communityGiftsInstance.used.call(i);
        assert.equal(
          Number(symbolsResult),
          symbolsArray[i],
          "symbol result is incorrect"
        );
        assert.equal(usedResult, false, "used result is incorrect");
        const uniqueSymbol = await treeAttributeInstance.uniqueSymbol.call(
          symbolsArray[i]
        );

        assert.equal(
          Number(uniqueSymbol.status),
          1,
          "uniqueSymbol status is incorrect"
        );
      }
      const lastSymbolValue = web3.utils.toBN("12345678987654321");
      await communityGiftsInstance.reserveSymbol(lastSymbolValue, {
        from: dataManager,
      });

      const lastSymbolsResult = await communityGiftsInstance.symbols.call(
        symbolsArray.length
      );
      const lastUsedResult = await communityGiftsInstance.used.call(
        symbolsArray.length
      );

      assert.equal(
        Number(lastSymbolsResult),
        Number(lastSymbolValue),
        "last symbol result is incorrect"
      );
      assert.equal(lastUsedResult, false, "last used result is incorrect");
    });

    it("removeReservedSymbol should work successfully", async () => {
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );

      const symbolsArray = [];
      for (let i = 0; i < 5; i++) {
        let rand = parseInt(Math.random() * 10e10);
        while (symbolsArray.includes(rand)) {
          rand = parseInt(Math.random() * 10e10);
        }
        symbolsArray[i] = rand;
      }

      for (i = 0; i < symbolsArray.length; i++) {
        await communityGiftsInstance.reserveSymbol(symbolsArray[i], {
          from: dataManager,
        });
      }

      for (let i = 0; i < symbolsArray.length; i++) {
        const symbolsResult = await communityGiftsInstance.symbols.call(i);
        const usedResult = await communityGiftsInstance.used.call(i);
        assert.equal(
          Number(symbolsResult),
          symbolsArray[i],
          "symbol result is incorrect"
        );
        assert.equal(usedResult, false, "used result is incorrect");
        const uniqueSymbol = await treeAttributeInstance.uniqueSymbol.call(
          symbolsArray[i]
        );

        assert.equal(
          Number(uniqueSymbol.status),
          1,
          "uniqueSymbol status is incorrect"
        );
      }

      await communityGiftsInstance
        .removeReservedSymbol({ from: userAccount1 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      await communityGiftsInstance.removeReservedSymbol({ from: dataManager });

      for (let i = 0; i < symbolsArray.length; i++) {
        await communityGiftsInstance.symbols.call(i).should.be.rejected;
        await communityGiftsInstance.used.call(i).should.be.rejected;
        const uniqueSymbol = await treeAttributeInstance.uniqueSymbol.call(
          symbolsArray[i]
        );
        assert.equal(
          Number(uniqueSymbol.status),
          0,
          "uniqueSymbol status is incorrect"
        );
      }
    });

    it("removeReservedSymbol should work successfully (some symbols are used and some symbols are setted by admin)", async () => {
      /////////////  -------------- deploy contracts

      let testCommunityGiftsInstance = await TestCommunityGifts.new({
        from: deployerAccount,
      });

      await testCommunityGiftsInstance.initialize(
        arInstance.address,
        initialPlanterFund,
        initialReferralFund,
        {
          from: deployerAccount,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      /////////////////// ------------ handle roles
      await Common.addTreejerContractRole(
        arInstance,
        testCommunityGiftsInstance.address,
        deployerAccount
      );

      await Common.addTreejerContractRole(
        arInstance,
        treeAttributeInstance.address,
        deployerAccount
      );

      //////////////// ----------------- set addresses
      await testCommunityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        { from: deployerAccount }
      );

      await treeAttributeInstance.setTreeTokenAddress(
        treeTokenInstance.address,
        { from: deployerAccount }
      );

      //////////// ------------------- reserve symbols
      const symbolsArray = [];
      for (let i = 0; i < 5; i++) {
        let rand = parseInt(Math.random() * 10e10);
        while (symbolsArray.includes(rand)) {
          rand = parseInt(Math.random() * 10e10);
        }
        symbolsArray[i] = rand;
      }

      for (i = 0; i < symbolsArray.length; i++) {
        await testCommunityGiftsInstance.reserveSymbol(symbolsArray[i], {
          from: dataManager,
        });
      }

      for (let i = 0; i < symbolsArray.length; i++) {
        const symbolsResult = await testCommunityGiftsInstance.symbols.call(i);
        const usedResult = await testCommunityGiftsInstance.used.call(i);
        assert.equal(
          Number(symbolsResult),
          symbolsArray[i],
          "symbol result is incorrect"
        );
        assert.equal(usedResult, false, "used result is incorrect");
        const uniqueSymbol = await treeAttributeInstance.uniqueSymbol.call(
          symbolsArray[i]
        );

        assert.equal(
          Number(uniqueSymbol.status),
          1,
          "uniqueSymbol status is incorrect"
        );
      }

      ///////////////// --------------- change some data to test
      await testCommunityGiftsInstance.updateClaimedCount(3);
      await testCommunityGiftsInstance.updateUsed(1);

      await treeAttributeInstance.setTreeAttributesByAdmin(
        101,
        123456789,
        symbolsArray[3],
        18,
        { from: dataManager }
      );

      assert.equal(
        Number(await testCommunityGiftsInstance.claimedCount.call()),
        3,
        "claimed count is incorrect before free"
      );

      await testCommunityGiftsInstance.removeReservedSymbol({
        from: dataManager,
      });

      assert.equal(
        Number(await testCommunityGiftsInstance.claimedCount.call()),
        0,
        "claimed count is incorrect after free"
      );

      for (let i = 0; i < symbolsArray.length; i++) {
        await testCommunityGiftsInstance.symbols.call(i).should.be.rejected;
        await testCommunityGiftsInstance.used.call(i).should.be.rejected;
        const uniqueSymbol = await treeAttributeInstance.uniqueSymbol.call(
          symbolsArray[i]
        );

        ////////// ---------- used is true and dont update status
        if (i == 1) {
          assert.equal(
            Number(uniqueSymbol.status),
            1,
            "uniqueSymbol status is incorrect"
          );
          ////////// ---------- this symbol is setted by admin and status is 3 and dont update status
        } else if (i == 3) {
          assert.equal(
            Number(uniqueSymbol.status),
            3,
            "uniqueSymbol status is incorrect"
          );
        } else {
          assert.equal(
            Number(uniqueSymbol.status),
            0,
            "uniqueSymbol status is incorrect"
          );
        }
      }
    });
  });
  */

  describe("update giftees", () => {
    beforeEach(async () => {
      //------------------ deploy contracts

      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [arInstance.address, initialPlanterFund, initialReferralFund],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });

      //----------------- set cntract addresses

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
        from: deployerAccount,
      });

      //----------------add role to treejer contract role to treeFactoryInstance address
      await Common.addTreejerContractRole(
        arInstance,
        treeFactoryInstance.address,
        deployerAccount
      );

      //----------------add role to treejer contract role to communityGiftsInstance address
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );
    });
    it("should setGiftRange  and freeGiftRange succussfully", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 21;

      const newStartTRee = 31;
      const newEndTree = 41;

      const transferAmount = web3.utils.toWei("70");
      const adminWallet = userAccount8;

      //////////////// set price

      await communityGiftsInstance.setPrice(
        await web3.utils.toWei("5"),
        await web3.utils.toWei("2"),
        {
          from: dataManager,
        }
      );

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      const eventTx = await communityGiftsInstance.setGiftRange(
        adminWallet,
        startTree,
        endTree,
        {
          from: dataManager,
        }
      );

      truffleAssert.eventEmitted(eventTx, "CommuintyGiftSet");
      for (let i = 11; i < 21; i++) {
        assert.equal(
          Number((await treeFactoryInstance.trees.call(i)).saleType),
          5,
          `saleType is not correct for tree ${i}`
        );
      }

      assert.equal(
        Number(startTree),
        Number(await communityGiftsInstance.currentTree.call()),
        "toClaim is not correct"
      );

      assert.equal(
        Number(endTree),
        Number(await communityGiftsInstance.upTo.call()),
        "upTo is not correct"
      );
      //////////////////// ---------------- check planterFund balance
      assert.equal(
        Number(await daiInstance.balanceOf(planterFundsInstnce.address)),
        math.mul(10, web3.utils.toWei("7")),
        "planter balance is inccorect in range 1 set"
      );

      await communityGiftsInstance
        .setGiftRange(adminWallet, newStartTRee, newEndTree, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CANT_SET_RANGE);

      await communityGiftsInstance
        .freeGiftRange({ from: userAccount1 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);
      const countBefore = await communityGiftsInstance.count.call();
      const diffrence =
        Number(await communityGiftsInstance.upTo.call()) -
        Number(await communityGiftsInstance.currentTree.call());
      assert.equal(Number(countBefore), 0, "count is incorrect");

      await communityGiftsInstance.freeGiftRange({ from: dataManager });

      for (let i = 11; i < 21; i++) {
        assert.equal(
          Number((await treeFactoryInstance.trees.call(i)).saleType),
          0,
          `saleType is not correct for tree ${i}`
        );
      }

      assert.equal(
        Number(await communityGiftsInstance.upTo.call()),
        0,
        "upTo after free reserve is inccorect"
      );
      assert.equal(
        Number(await communityGiftsInstance.currentTree.call()),
        0,
        "currentTree after free reserve is inccorect"
      );

      const countAfter = await communityGiftsInstance.count.call();

      assert.equal(Number(countAfter), diffrence, "count after is incorrect");

      await communityGiftsInstance.setGiftRange(
        adminWallet,
        newStartTRee,
        newEndTree,
        {
          from: dataManager,
        }
      );

      for (let i = 31; i < 41; i++) {
        assert.equal(
          Number((await treeFactoryInstance.trees.call(i)).saleType),
          5,
          `saleType is not correct for tree ${i}`
        );
      }

      assert.equal(
        Number(newStartTRee),
        Number(await communityGiftsInstance.currentTree.call()),
        "toClaim is not correct"
      );

      assert.equal(
        Number(newEndTree),
        Number(await communityGiftsInstance.upTo.call()),
        "upTo is not correct"
      );
    });

    it("should range complex (some trees claimed,first set smaller and then set bigger range)", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 21;

      const newStartTRee = 31;
      const newEndTree = 41;
      const startDate = await Common.timeInitial(TimeEnumes.seconds, 0);
      const expireDate = await Common.timeInitial(TimeEnumes.hours, 5);

      const transferAmount = web3.utils.toWei("70");
      const adminWallet = userAccount8;

      ////////////// deploy contract
      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      ////////////////// handle role
      await Common.addTreejerContractRole(
        arInstance,
        treeAttributeInstance.address,
        deployerAccount
      );

      ///////////// set address
      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      await treeAttributeInstance.setTreeTokenAddress(
        treeTokenInstance.address,
        { from: deployerAccount }
      );

      //////////////// set price

      await communityGiftsInstance.setPrice(
        await web3.utils.toWei("5"),
        await web3.utils.toWei("2"),
        {
          from: dataManager,
        }
      );

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftRange(
        adminWallet,
        startTree,
        endTree,
        {
          from: dataManager,
        }
      );

      const symbolsArray = [];
      for (let i = 0; i < 10; i++) {
        let rand = parseInt(Math.random() * 10e10);
        while (symbolsArray.includes(rand)) {
          rand = parseInt(Math.random() * 10e10);
        }
        symbolsArray[i] = rand;
        await communityGiftsInstance.reserveSymbol(rand, {
          from: dataManager,
        });
      }
      //////////////// --------------- add giftees
      await communityGiftsInstance.addGiftee(
        userAccount1,
        startDate,
        expireDate,
        { from: dataManager }
      );
      await communityGiftsInstance.addGiftee(
        userAccount2,
        startDate,
        expireDate,
        {
          from: dataManager,
        }
      );
      await communityGiftsInstance.addGiftee(
        userAccount3,
        startDate,
        expireDate,
        {
          from: dataManager,
        }
      );
      ////////////// claim gift

      await communityGiftsInstance.claimGift({ from: userAccount1 });
      await communityGiftsInstance.claimGift({ from: userAccount2 });
      await communityGiftsInstance.claimGift({ from: userAccount3 });

      /////////////////////////// check data

      assert.equal(
        Number(await communityGiftsInstance.currentTree.call()),
        14,
        "current tree is incorrect"
      );
    });

    it("fail to set gift range", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 101;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("630");
      const insufficientTransferAmount = web3.utils.toWei("629.9");
      const addminWalletWithInsufficientTransferAmount = userAccount6;
      const insufficientApprovalAmount = web3.utils.toWei("629");
      const adminWallet = userAccount8;
      const treeIdInAuction = 16;

      //////////////// set price

      await communityGiftsInstance.setPrice(planterShare, referralShare, {
        from: dataManager,
      });

      ///////////////// ---------------------- fail because caller is not data manager
      await communityGiftsInstance
        .setGiftRange(adminWallet, startTree, endTree, {
          from: userAccount1,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////----------------- fail because of invalid range
      await communityGiftsInstance
        .setGiftRange(adminWallet, endTree, startTree, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.INVALID_RANGE);

      /////////////// fail because of insufficient approval amount

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        insufficientApprovalAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance
        .setGiftRange(
          adminWallet,
          startTree,
          endTree,

          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.APPROVAL_ISSUE);

      //////////// fail because of insufficient admin account balance
      await daiInstance.setMint(
        addminWalletWithInsufficientTransferAmount,
        insufficientTransferAmount
      );

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: addminWalletWithInsufficientTransferAmount,
        }
      );

      await communityGiftsInstance
        .setGiftRange(
          addminWalletWithInsufficientTransferAmount,
          startTree,
          endTree,

          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.INSUFFICIENT_BALANCE);

      //////////////----------------- fail because of invalid admin account
      await communityGiftsInstance
        .setGiftRange(zeroAddress, startTree, endTree, {
          from: dataManager,
        })
        .should.be.rejectedWith(erc20ErrorMsg.ZERO_ADDRESS);

      //----------------- fail setGiftRange because a tree is not free

      await treeFactoryInstance.listTree(treeIdInAuction, "some ipfs hash", {
        from: dataManager,
      });

      await Common.addTreejerContractRole(
        arInstance,
        userAccount7,
        deployerAccount
      );

      await treeFactoryInstance.manageSaleTypeBatch(
        treeIdInAuction,
        treeIdInAuction + 1,
        5,
        { from: userAccount7 }
      );

      await communityGiftsInstance
        .setGiftRange(adminWallet, startTree, endTree, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREES_ARE_NOT_AVAILABLE);
    });
  });

  /*

  describe("update giftees", () => {
    beforeEach(async () => {
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30); //one month after now

      //------------------ deploy contracts

      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [
          arInstance.address,
          expireDate,
          initialPlanterFund,
          initialReferralFund,
        ],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });

      //----------------- set cntract addresses

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
        from: deployerAccount,
      });

      //----------------add role to treejer contract role to treeFactoryInstance address
      await Common.addTreejerContractRole(
        arInstance,
        treeFactoryInstance.address,
        deployerAccount
      );

      //----------------add role to treejer contract role to communityGiftsInstance address
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );
    });

    /////////////////---------------------------------set gift range--------------------------------------------------------

    it("set gift range successfully and check data", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 101;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("630");
      const adminWallet = userAccount8;
      let now = await Common.timeInitial(TimeEnumes.seconds, 0);
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      const eventTx = await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      truffleAssert.eventEmitted(eventTx, "CommuintyGiftSet");

      const treeId11 = await treeFactoryInstance.trees.call(11);
      const treeId21 = await treeFactoryInstance.trees.call(21);
      const treeId41 = await treeFactoryInstance.trees.call(41);
      const treeId51 = await treeFactoryInstance.trees.call(51);
      const treeId100 = await treeFactoryInstance.trees.call(100);

      assert.equal(Number(treeId11.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId21.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId41.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId51.saleType), 5, "saleType is not correct");
      assert.equal(Number(treeId100.saleType), 5, "saleType is not correct");

      assert.equal(
        Number(planterShare),
        Number(await communityGiftsInstance.planterFund.call()),
        "planter share is not correct"
      );

      assert.equal(
        Number(referralShare),
        Number(await communityGiftsInstance.referralFund.call()),
        "referral share is not correct"
      );

      assert.equal(
        Number(endTree - startTree),
        Number(await communityGiftsInstance.maxGiftCount.call()),
        "max gift count is not correct"
      );

      assert.equal(
        Number(startTree),
        Number(await communityGiftsInstance.toClaim.call()),
        "toClaim is not correct"
      );

      assert.equal(
        Number(endTree),
        Number(await communityGiftsInstance.upTo.call()),
        "upTo is not correct"
      );
      assert.equal(
        Number(await communityGiftsInstance.expireDate.call()),
        Math.add(Number(now), 86400),
        "expire date is not correct"
      );
    });

    it("fail to set gift range", async () => {
      //------------------initial data

      const startTree = 11;
      const endTree = 101;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("630");
      const insufficientTransferAmount = web3.utils.toWei("629.9");
      const addminWalletWithInsufficientTransferAmount = userAccount6;
      const insufficientApprovalAmount = web3.utils.toWei("629");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);
      const treeIdInAuction = 16;
      const startTime = await Common.timeInitial(TimeEnumes.seconds, 0);
      const endTime = await Common.timeInitial(TimeEnumes.hours, 1);

      ///////////////// ---------------------- fail because caller is not data manager
      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: userAccount1,
          }
        )
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////----------------- fail because of invalid range
      await communityGiftsInstance
        .setGiftsRange(
          endTree,
          startTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(CommunityGiftErrorMsg.INVALID_RANGE);

      /////////////// fail because of insufficient approval amount

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        insufficientApprovalAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.APPROVAL_ISSUE);

      //////////// fail because of insufficient admin account balance
      await daiInstance.setMint(
        addminWalletWithInsufficientTransferAmount,
        insufficientTransferAmount
      );

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: addminWalletWithInsufficientTransferAmount,
        }
      );

      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          addminWalletWithInsufficientTransferAmount,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.INSUFFICIENT_BALANCE);

      //////////////----------------- fail because of invalid admin account
      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          zeroAddress,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(erc20ErrorMsg.ZERO_ADDRESS);

      //----------------- fail setGiftsRange because a tree is not free

      await treeFactoryInstance.listTree(treeIdInAuction, "some ipfs hash", {
        from: dataManager,
      });

      await Common.addTreejerContractRole(
        arInstance,
        userAccount7,
        deployerAccount
      );

      await treeFactoryInstance.manageSaleTypeBatch(
        treeIdInAuction,
        treeIdInAuction + 1,
        5,
        { from: userAccount7 }
      );

      await communityGiftsInstance
        .setGiftsRange(
          startTree,
          endTree,
          planterShare,
          referralShare,
          Number(expireDate),
          adminWallet,
          {
            from: dataManager,
          }
        )
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREES_ARE_NOT_AVAILABLE);
    });

    ////////////////////// -------------------------------- update giftees ----------------------------------------

    it("should update giftees succesfully and check data to be ok", async () => {
      //////// -------------------- set gifts range

      const startTree = 10;
      const endTree = 20;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("70");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      /////////////////////////////////////////////////////////////////

      const giftee1 = userAccount1;
      const giftee2 = userAccount2;
      const symbol1 = 1234554321;
      const symbol2 = 1357997531;

      const giftCountBefore = await communityGiftsInstance.giftCount.call();

      //////////---------------------- give symbol1 to giftee1

      const eventTx1 = await communityGiftsInstance.updateGiftees(
        giftee1,
        symbol1,
        {
          from: dataManager,
        }
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "GifteeUpdated", (ev) => {
        return ev.giftee == giftee1;
      });

      //////////---------------- check communityGift data

      const communityGift1 = await communityGiftsInstance.communityGifts.call(
        giftee1
      );

      assert.equal(
        Number(communityGift1.symbol),
        symbol1,
        "symbol is not correct"
      );

      assert.equal(communityGift1.exist, true, "exist is not correct");

      assert.equal(communityGift1.claimed, false, "claimed is not correct");

      //////////-------------- check gift count

      const giftCountAfter1 = await communityGiftsInstance.giftCount.call();

      assert.equal(
        Number(giftCountBefore),
        0,
        "gift count before update giftee is not correct"
      );

      assert.equal(
        Number(giftCountAfter1),
        1,
        "gift count after update giftee is not correct"
      );

      ///////////---------------- check attribute code

      const generatedAttr1Symbol1 =
        await treeAttributeInstance.generatedAttributes.call(symbol1);

      const reservedAttr1Symbol1 =
        await treeAttributeInstance.reservedAttributes.call(symbol1);

      assert.equal(
        Number(generatedAttr1Symbol1),
        1,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr1Symbol1),
        1,
        "reserved code is not correct"
      );

      ///////////---------------------- give symbol2 to giftee1

      const eventTx2 = await communityGiftsInstance.updateGiftees(
        giftee1,
        symbol2,
        {
          from: dataManager,
        }
      );

      //-------------- check event emitted

      truffleAssert.eventEmitted(eventTx2, "GifteeUpdated", (ev) => {
        return ev.giftee == giftee1;
      });

      //////////---------------- check communityGift data

      const communityGift2 = await communityGiftsInstance.communityGifts.call(
        giftee1
      );

      assert.equal(
        Number(communityGift2.symbol),
        symbol2,
        "symbol is not correct"
      );

      assert.equal(communityGift2.exist, true, "exist is not correct");

      assert.equal(communityGift2.claimed, false, "claimed is not correct");

      //////////-------------- check gift count

      const giftCountAfter2 = await communityGiftsInstance.giftCount.call();

      assert.equal(
        Number(giftCountAfter2),
        1,
        "gift count after update giftee is not correct"
      );

      ///////////---------------- check attribute code for symbol 1 that must be free

      const generatedAttr2Symbol1 =
        await treeAttributeInstance.generatedAttributes.call(symbol1);

      const reservedAttr2Symbol1 =
        await treeAttributeInstance.reservedAttributes.call(symbol1);

      assert.equal(
        Number(generatedAttr2Symbol1),
        0,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr2Symbol1),
        0,
        "reserved code is not correct"
      );

      ///////////---------------- check attribute code for symbol 2 that must be reserved

      const generatedAttr1Symbol2 =
        await treeAttributeInstance.generatedAttributes.call(symbol2);

      const reservedAttr1Symbol2 =
        await treeAttributeInstance.reservedAttributes.call(symbol2);

      assert.equal(
        Number(generatedAttr1Symbol2),
        1,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr1Symbol2),
        1,
        "reserved code is not correct"
      );

      ///////------------------ give symbol1 to giftee2

      const eventTx3 = await communityGiftsInstance.updateGiftees(
        giftee2,
        symbol1,
        {
          from: dataManager,
        }
      );

      //-------------- check event emitted

      truffleAssert.eventEmitted(eventTx3, "GifteeUpdated", (ev) => {
        return ev.giftee == giftee2;
      });

      //////////---------------- check communityGift data

      const communityGift3 = await communityGiftsInstance.communityGifts.call(
        giftee2
      );

      assert.equal(
        Number(communityGift3.symbol),
        symbol1,
        "symbol is not correct"
      );

      assert.equal(communityGift3.exist, true, "exist is not correct");

      assert.equal(communityGift3.claimed, false, "claimed is not correct");

      //////////-------------- check gift count

      const giftCountAfter3 = await communityGiftsInstance.giftCount.call();

      assert.equal(
        Number(giftCountAfter3),
        2,
        "gift count after update giftee is not correct"
      );

      ///////////---------------- check attribute code for symbol 1 that must be reserved

      const generatedAttr3Symbol1 =
        await treeAttributeInstance.generatedAttributes.call(symbol1);

      const reservedAttr3Symbol1 =
        await treeAttributeInstance.reservedAttributes.call(symbol1);

      assert.equal(
        Number(generatedAttr3Symbol1),
        1,
        "generated code is not correct"
      );

      assert.equal(
        Number(reservedAttr3Symbol1),
        1,
        "reserved code is not correct"
      );
    });

    it("should fail to update giftees", async () => {
      //////// -------------------- set gifts range

      const startTree = 10;
      const endTree = 20;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("70");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 10);

      const symbol0 = 123456789;

      //////////----------------- fail because community gift does not set

      await communityGiftsInstance
        .updateGiftees(userAccount1, symbol0, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.MAX_GIFT_AMOUNT_REACHED);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      /////////////////////////////////////////////////////////////////

      const giftee1 = userAccount1;
      const giftee2 = userAccount2;
      const symbol1 = 1234554321;
      const symbol2 = 1357997531;

      /////// ---------------should fail admin access
      await communityGiftsInstance
        .updateGiftees(giftee1, symbol1, { from: userAccount3 })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////////// ------------ should fail becuse giftee claimed before
      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      await communityGiftsInstance
        .updateGiftees(giftee1, symbol2, { from: dataManager })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CLAIMED_BEFORE);

      /////////------------------------- should fail because of duplicate symbol

      await communityGiftsInstance
        .updateGiftees(giftee2, symbol1, { from: dataManager })
        .should.be.rejectedWith(
          TreeAttributeErrorMsg.DUPLICATE_TREE_ATTRIBUTES
        );
      ////////////////// --------------------- should fail because gift count is not less than maxGiftCount

      const startTree2 = 20;
      const endTree2 = 30;

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      await communityGiftsInstance.setGiftsRange(
        startTree2,
        endTree2,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      /////////////////////////////////////////////////////////////////
      //TODO: aliad010 FIX_THIS_BUG
      // const symbol3 = 123456789;

      // for (i = 0; i < 10; i++) {
      //   let address = await Common.getNewAccountPublicKey();
      //   await communityGiftsInstance.updateGiftees(address, i, {
      //     from: dataManager,
      //   });
      // }

      // await communityGiftsInstance
      //   .updateGiftees(userAccount1, symbol3, {
      //     from: dataManager,
      //   })
      //   .should.be.rejectedWith(CommunityGiftErrorMsg.MAX_GIFT_AMOUNT_REACHED);
    });
  });

  describe("claim tree and transfer tree", () => {
    beforeEach(async () => {
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30); //one month after now

      //------------------ deploy contracts

      communityGiftsInstance = await deployProxy(
        CommunityGifts,
        [
          arInstance.address,
          expireDate,
          initialPlanterFund,
          initialReferralFund,
        ],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeAttributeInstance = await deployProxy(
        TreeAttribute,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      planterFundsInstnce = await deployProxy(
        PlanterFund,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      allocationInstance = await deployProxy(Allocation, [arInstance.address], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      treeFactoryInstance = await deployProxy(
        TreeFactory,
        [arInstance.address],
        {
          initializer: "initialize",
          from: deployerAccount,
          unsafeAllowCustomTypes: true,
        }
      );

      treeTokenInstance = await deployProxy(Tree, [arInstance.address, ""], {
        initializer: "initialize",
        from: deployerAccount,
        unsafeAllowCustomTypes: true,
      });

      daiInstance = await Dai.new("DAI", "dai", { from: deployerAccount });

      //----------------- set cntract addresses

      await communityGiftsInstance.setTreeFactoryAddress(
        treeFactoryInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setTreeAttributesAddress(
        treeAttributeInstance.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setPlanterFundAddress(
        planterFundsInstnce.address,
        {
          from: deployerAccount,
        }
      );

      await communityGiftsInstance.setDaiTokenAddress(daiInstance.address, {
        from: deployerAccount,
      });

      await treeFactoryInstance.setTreeTokenAddress(treeTokenInstance.address, {
        from: deployerAccount,
      });

      //----------------add role to treejer contract role to treeFactoryInstance address
      await Common.addTreejerContractRole(
        arInstance,
        treeFactoryInstance.address,
        deployerAccount
      );

      //----------------add role to treejer contract role to communityGiftsInstance address
      await Common.addTreejerContractRole(
        arInstance,
        communityGiftsInstance.address,
        deployerAccount
      );
    });

    ////////////////////// -------------------------------- claim tree ----------------------------------------

    it("1-should claimTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      const treeId = startTree; //id of tree to be claimed

      //////// ----------------- check plnter fund before

      const pFundBefore =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundBefore =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(Number(pFundBefore), 0, "planter fund is not ok");

      assert.equal(Number(rFundBefore), 0, "referral fund is not ok");

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------claim tree by giftee1

      let eventTx1 = await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      let toClaimAfter = await communityGiftsInstance.toClaim.call();

      let giftee = await communityGiftsInstance.communityGifts(giftee1);

      assert.equal(Number(giftee.symbol), symbol1, "1.symbol not true updated");

      assert.equal(giftee.claimed, true, "1.claimed not true updated");

      assert.equal(
        Number(toClaimAfter),
        Number(toClaimBefore) + 1,
        "1.toClaim not true updated"
      );

      assert.equal(
        Number(toClaimAfter),
        treeId + 1,
        "1.toClaim not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken = await treeTokenInstance.ownerOf(treeId);

      assert.equal(addressGetToken, giftee1, "1.mint not true");

      //////////--------------check provide status

      let genTree = await treeFactoryInstance.trees.call(treeId);

      assert.equal(Number(genTree.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute = await treeAttributeInstance.treeAttributes(treeId);

      assert.equal(treeAttribute.exists, 1, "treeAttribute is not true update");

      //////////////// ---------------- check planter fund values after claim

      const pFundAfter =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundAfter =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(
        Number(pFundAfter),
        Number(planterShareOfTree),
        "planter fund is not ok"
      );

      assert.equal(
        Number(rFundAfter),
        Number(referralShareOfTree),
        "referral fund is not ok"
      );

      const pfTotalFundAfter = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfter.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeClaimed", (ev) => {
        return Number(ev.treeId) == treeId;
      });
    });

    it("2-should claimTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234554322;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      const treeId1 = startTree; // first tree to be claimed
      const treeId2 = startTree + 1; //2nd tree to be claimed

      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////// ----------------- check plnter fund before

      const pFundBeforeTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundBeforeTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundBeforeTree1),
        0,
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundBeforeTree1),
        0,
        "referral fund is not ok for tree1"
      );

      const pFundBeforeTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundBeforeTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundBeforeTree2),
        0,
        "planter fund is not ok for tree2"
      );

      assert.equal(
        Number(rFundBeforeTree2),
        0,
        "referral fund is not ok for tree 2"
      );

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------claim tree by giftee1

      let eventTx1 = await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      //////// ----------------- check plnter fund after claim

      const pFundAfterTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundAfterTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundAfterTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundAfterTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pfTotalFundAfterTree1 =
        await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfterTree1.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------claim tree by giftee2
      let eventTx2 = await communityGiftsInstance.claimTree({
        from: giftee2,
      });

      let toClaimAfter = await communityGiftsInstance.toClaim.call();

      //////////-------------- check claimed tree data
      let giftee1Data = await communityGiftsInstance.communityGifts(giftee1);

      let giftee2Data = await communityGiftsInstance.communityGifts(giftee2);

      assert.equal(
        Number(giftee1Data.symbol),
        symbol1,
        "1.symbol not true updated"
      );

      assert.equal(giftee1Data.claimed, true, "1.claimed not true updated");

      assert.equal(
        Number(giftee2Data.symbol),
        symbol2,
        "2.symbol not true updated"
      );

      assert.equal(giftee2Data.claimed, true, "2.claimed not true updated");

      assert.equal(
        Number(toClaimAfter),
        Number(toClaimBefore) + 2,
        "toClaim not true updated"
      );

      assert.equal(
        Number(toClaimAfter),
        treeId1 + 2,
        "toClaim not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken = await treeTokenInstance.ownerOf(11);

      assert.equal(addressGetToken, giftee1, "1.mint not true");

      let addressGetToken2 = await treeTokenInstance.ownerOf(12);

      assert.equal(addressGetToken2, giftee2, "2.mint not true");

      //////////--------------check provide status

      let genTree = await treeFactoryInstance.trees.call(11);

      assert.equal(Number(genTree.saleType), 0, "saleType is not correct");

      let genTree2 = await treeFactoryInstance.trees.call(12);

      assert.equal(Number(genTree2.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute = await treeAttributeInstance.treeAttributes(11);
      assert.equal(treeAttribute.exists, 1, "treeAttribute is not true update");

      let treeAttribute2 = await treeAttributeInstance.treeAttributes(12);
      assert.equal(
        treeAttribute2.exists,
        1,
        "treeAttribute is not true update"
      );

      //////// ----------------- check plnter fund after final claim

      const pFundFinalTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundFinalTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundFinalTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundFinalTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pFundFinalTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundFinalTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundFinalTree2),
        Number(planterShareOfTree),
        "planter fund is not ok for tree 2"
      );

      assert.equal(
        Number(rFundFinalTree2),
        Number(referralShareOfTree),
        "referral fund is not ok for tree2"
      );

      const pfTotalFundFinal = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundFinal.planter),
        Math.mul(Number(planterShareOfTree), 2),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundFinal.ambassador),
        Math.mul(Number(referralShareOfTree), 2),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundFinal.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeClaimed", (ev) => {
        return Number(ev.treeId) == treeId1;
      });

      truffleAssert.eventEmitted(eventTx2, "TreeClaimed", (ev) => {
        return Number(ev.treeId) == treeId2;
      });
    });

    it("Should claimTree reject(expireDate reach)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234587543;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      //////////-------------- fail because user not exist
      await communityGiftsInstance
        .claimTree({
          from: userAccount3,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.USER_NOT_EXIST);

      //////////--------------claim tree by giftee1 for first time and it's not problem

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      //////////-------------- fail becuase claimed before
      await communityGiftsInstance
        .claimTree({
          from: giftee1,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CLAIMED_BEFORE);

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////--------------claim with expire date error

      await communityGiftsInstance
        .claimTree({
          from: giftee2,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.EXPIREDATE_REACHED);
    });

    ////////////////////// -------------------------------- transfer tree ----------------------------------------

    it("1-should transferTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      const treeId = startTree; //tree to be claimed

      ////////////// check planter fund values before claim
      const pFundBefore =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundBefore =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(Number(pFundBefore), 0, "planter fund is not ok");

      assert.equal(Number(rFundBefore), 0, "referral fund is not ok");

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------call transferTree by admin(owner=>userAccount3)

      let eventTx1 = await communityGiftsInstance.transferTree(
        userAccount3,
        1234554321,
        {
          from: dataManager,
        }
      );

      let toClaimAfter = await communityGiftsInstance.toClaim.call();

      assert.equal(
        Number(toClaimAfter),
        Number(toClaimBefore) + 1,
        "1.claimedCount not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken = await treeTokenInstance.ownerOf(treeId);

      assert.equal(addressGetToken, userAccount3, "1.mint not true");

      //////////--------------check provide status

      let genTree = await treeFactoryInstance.trees.call(treeId);

      assert.equal(Number(genTree.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute = await treeAttributeInstance.treeAttributes(treeId);
      assert.equal(treeAttribute.exists, 1, "treeAttribute is not true update");

      ////////////// check planter fund values after transfer
      const pFundAfter =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId);

      const rFundAfter =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(treeId);

      assert.equal(
        Number(pFundAfter),
        Number(planterShareOfTree),
        "planter fund is not ok"
      );

      assert.equal(
        Number(rFundAfter),
        Number(referralShareOfTree),
        "referral fund is not ok"
      );

      const pfTotalFundAfter = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfter.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfter.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeTransfered", (ev) => {
        return Number(ev.treeId) == 11;
      });
    });

    it("2-should transferTree succesfully and check data to be ok", async () => {
      const giftee1 = userAccount1;
      const giftee2 = userAccount2;
      const symbol1 = 1234554321;
      const symbol2 = 1234567890;

      const startTree = 11;
      const endTree = 15;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("28");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.minutes, 1440);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      let toClaimBefore = await communityGiftsInstance.toClaim.call();

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      const treeId1 = startTree;
      const treeId2 = startTree + 1;

      //////// ----------------- check plnter fund before transfer

      const pFundBeforeTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundBeforeTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundBeforeTree1),
        0,
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundBeforeTree1),
        0,
        "referral fund is not ok for tree1"
      );

      const pFundBeforeTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundBeforeTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundBeforeTree2),
        0,
        "planter fund is not ok for tree2"
      );

      assert.equal(
        Number(rFundBeforeTree2),
        0,
        "referral fund is not ok for tree 2"
      );

      const pfTotalFundBefore = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundBefore.planter),
        0,
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.ambassador),
        0,
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------call transferTree by admin(owner=>userAccount3)

      const eventTx1 = await communityGiftsInstance.transferTree(
        userAccount3,
        symbol1,
        {
          from: dataManager,
        }
      );

      const toClaimAfter1 = await communityGiftsInstance.toClaim.call();

      //////// ----------------- check plnter fund after transfer11

      const pFundAfterTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundAfterTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundAfterTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundAfterTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pfTotalFundAfterTree1 =
        await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundAfterTree1.planter),
        Number(planterShareOfTree),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.ambassador),
        Number(referralShareOfTree),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundAfterTree1.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////--------------call transferTree by admin(owner=>userAccount4)

      const eventTx2 = await communityGiftsInstance.transferTree(
        userAccount4,
        symbol2,
        {
          from: dataManager,
        }
      );
      const toClaimAfter2 = await communityGiftsInstance.toClaim.call();

      assert.equal(
        Number(toClaimAfter1),
        Number(toClaimBefore) + 1,
        "1.claimedCount not true updated"
      );

      assert.equal(
        Number(toClaimAfter2),
        Number(toClaimBefore) + 2,
        "1.claimedCount not true updated"
      );

      //////////--------------check tree owner
      let addressGetToken1 = await treeTokenInstance.ownerOf(treeId1);
      let addressGetToken2 = await treeTokenInstance.ownerOf(treeId2);

      assert.equal(addressGetToken1, userAccount3, "1.mint not true");

      assert.equal(addressGetToken2, userAccount4, "1.mint not true");

      //////////--------------check provide status

      let genTree1 = await treeFactoryInstance.trees.call(treeId1);
      let genTree2 = await treeFactoryInstance.trees.call(treeId2);

      assert.equal(Number(genTree1.saleType), 0, "saleType is not correct");

      assert.equal(Number(genTree2.saleType), 0, "saleType is not correct");

      //////////--------------check treeAttribute
      let treeAttribute1 = await treeAttributeInstance.treeAttributes(treeId1);
      let treeAttribute2 = await treeAttributeInstance.treeAttributes(treeId2);

      assert.equal(
        treeAttribute1.exists,
        1,
        "treeAttribute is not true update"
      );
      assert.equal(
        treeAttribute2.exists,
        1,
        "treeAttribute is not true update"
      );

      //////// ----------------- check plnter fund after both transfer

      const pFundFinalTree1 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId1);

      const rFundFinalTree1 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId1
        );

      assert.equal(
        Number(pFundFinalTree1),
        Number(planterShareOfTree),
        "planter fund is not ok for tree1"
      );

      assert.equal(
        Number(rFundFinalTree1),
        Number(referralShareOfTree),
        "referral fund is not ok for tree1"
      );

      const pFundFinalTree2 =
        await planterFundsInstnce.treeToPlanterProjectedEarning.call(treeId2);

      const rFundFinalTree2 =
        await planterFundsInstnce.treeToAmbassadorProjectedEarning.call(
          treeId2
        );

      assert.equal(
        Number(pFundFinalTree2),
        Number(planterShareOfTree),
        "planter fund is not ok for tree2"
      );

      assert.equal(
        Number(rFundFinalTree2),
        Number(referralShareOfTree),
        "referral fund is not ok for tree 2"
      );

      const pfTotalFundFinal = await planterFundsInstnce.totalBalances.call();

      assert.equal(
        Number(pfTotalFundFinal.planter),
        Math.mul(Number(planterShareOfTree), 2),
        "planter total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundFinal.ambassador),
        Math.mul(Number(referralShareOfTree), 2),
        "ambassador total fund is not ok"
      );

      assert.equal(
        Number(pfTotalFundBefore.localDevelopment),
        0,
        "local develop total fund is not ok"
      );

      //////////-------------- check event emitted

      truffleAssert.eventEmitted(eventTx1, "TreeTransfered", (ev) => {
        return Number(ev.treeId) == treeId1;
      });

      truffleAssert.eventEmitted(eventTx2, "TreeTransfered", (ev) => {
        return Number(ev.treeId) == treeId2;
      });
    });

    it("Should transferTree succuss (symbol not assigned to anyone)", async () => {
      //////////--------------add giftee by admin
      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////--------------call transferTree by user
      await communityGiftsInstance.transferTree(userAccount3, 1234554321, {
        from: dataManager,
      });
    });

    it("Should transferTree success (symbol assinged but not claimed)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////--------------call transferTree by admin(owner=>userAccount3)

      await communityGiftsInstance.transferTree(userAccount3, 1234554321, {
        from: dataManager,
      });
    });

    // it("Should transferTree reject (only admin call)", async () => {
    //   const giftee1 = userAccount1;
    //   const symbol1 = 1234554321;
    //   const startTree = 11;
    //   const endTree = 13;
    //   const planterShare = web3.utils.toWei("5");
    //   const referralShare = web3.utils.toWei("2");
    //   const transferAmount = web3.utils.toWei("14");
    //   const adminWallet = userAccount8;
    //   const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

    //   ///////---------------- handle admin walllet

    //   await daiInstance.setMint(adminWallet, transferAmount);

    //   await daiInstance.approve(
    //     communityGiftsInstance.address,
    //     transferAmount,
    //     {
    //       from: adminWallet,
    //     }
    //   );

    //   //////////--------------add giftee by admin

    //   await communityGiftsInstance.setGiftsRange(
    //     startTree,
    //     endTree,
    //     planterShare,
    //     referralShare,
    //     Number(expireDate),
    //     adminWallet,
    //     {
    //       from: dataManager,
    //     }
    //   );

    //   await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
    //     from: dataManager,
    //   });

    //   //////////--------------time travel
    //   await Common.travelTime(TimeEnumes.days, 31);

    //   ////////////// ----------- prepare for transfer
    //   const planterShareOfTree = web3.utils.toWei("4.9");
    //   const referralShareOfTree = web3.utils.toWei("2.1");

    //   await communityGiftsInstance.setPrice(
    //     planterShareOfTree,
    //     referralShareOfTree,
    //     { from: dataManager }
    //   );

    // });

    it("Should transferTree reject (expireDate not reach)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////////--------------expire time does not reach
      await communityGiftsInstance
        .transferTree(userAccount3, 1234554321, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.EXPIREDATE_NOT_REACHED);
    });

    it("1-Should transferTree reject (maximum reached)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234554322;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      //////////-------------- transfer tree faild caller is not data manager
      await communityGiftsInstance
        .transferTree(userAccount3, symbol1, {
          from: userAccount3,
        })
        .should.be.rejectedWith(CommonErrorMsg.CHECK_DATA_MANAGER);

      ///////////// ----------------- fail expire time dont reach

      await communityGiftsInstance
        .transferTree(userAccount3, symbol1, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.EXPIREDATE_NOT_REACHED);

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      await communityGiftsInstance.claimTree({
        from: giftee2,
      });

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      let now = new Date().getTime();

      await communityGiftsInstance
        .setExpireDate(now, { from: dataManager })
        .should.be.rejectedWith(CommunityGiftErrorMsg.CANT_UPDATE_EXPIRE_DATE);

      //////////--------------call transferTree by admin(owner=>userAccount3)

      await communityGiftsInstance
        .transferTree(userAccount3, 322, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREE_IS_NOT_FOR_GIFT);
    });

    it("2-Should transferTree reject (maximum reached)", async () => {
      const giftee1 = userAccount1;
      const symbol1 = 1234554321;

      const giftee2 = userAccount2;
      const symbol2 = 1234554322;

      const startTree = 11;
      const endTree = 13;
      const planterShare = web3.utils.toWei("5");
      const referralShare = web3.utils.toWei("2");
      const transferAmount = web3.utils.toWei("14");
      const adminWallet = userAccount8;
      const expireDate = await Common.timeInitial(TimeEnumes.days, 30);

      ///////---------------- handle admin walllet

      await daiInstance.setMint(adminWallet, transferAmount);

      await daiInstance.approve(
        communityGiftsInstance.address,
        transferAmount,
        {
          from: adminWallet,
        }
      );

      //////////--------------add giftee by admin

      await communityGiftsInstance.setGiftsRange(
        startTree,
        endTree,
        planterShare,
        referralShare,
        Number(expireDate),
        adminWallet,
        {
          from: dataManager,
        }
      );

      await communityGiftsInstance.updateGiftees(giftee1, symbol1, {
        from: dataManager,
      });

      await communityGiftsInstance.updateGiftees(giftee2, symbol2, {
        from: dataManager,
      });

      ////////////// ----------- prepare for transfer
      const planterShareOfTree = web3.utils.toWei("4.9");
      const referralShareOfTree = web3.utils.toWei("2.1");

      await communityGiftsInstance.setPrice(
        planterShareOfTree,
        referralShareOfTree,
        { from: dataManager }
      );

      await communityGiftsInstance.claimTree({
        from: giftee1,
      });

      //////////--------------time travel
      await Common.travelTime(TimeEnumes.days, 31);

      //////////// ---------------- fail symbol claimed before
      await communityGiftsInstance
        .transferTree(userAccount3, symbol1, {
          from: dataManager,
        })
        .should.be.rejectedWith(TreeAttributeErrorMsg.ATTRIBUTE_TAKEN);

      await communityGiftsInstance.transferTree(giftee2, symbol2, {
        from: dataManager,
      });

      //////////--------------call transferTree by admin(owner=>userAccount3)

      await communityGiftsInstance
        .transferTree(userAccount3, 322, {
          from: dataManager,
        })
        .should.be.rejectedWith(CommunityGiftErrorMsg.TREE_IS_NOT_FOR_GIFT);
    });
  });
  */
});
