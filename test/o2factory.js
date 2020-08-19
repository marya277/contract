const AccessRestriction = artifacts.require("AccessRestriction");

const O2Factory = artifacts.require("O2Factory");
const GBFactory = artifacts.require("GBFactory");
const TreeType = artifacts.require("TreeType");
const TreeFactory = artifacts.require("TreeFactory");
const UpdateFactory = artifacts.require("UpdateFactory");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
const Units = require('ethereumjs-units');
const Common = require("./common");


contract('O2Factory', (accounts) => {
    let arInstance;

    let o2Instance;
    let gbInstance;
    let treeInstance;
    let updateInstance;
    const ownerAccount = accounts[0];
    const deployerAccount = accounts[1];
    const ambassadorAccount = accounts[2];
    const planter1Account = accounts[3];
    const planter2Account = accounts[4];
    const planter3Account = accounts[5];
    const planter4Account = accounts[6];
    const planter5Account = accounts[7];
    const adminAccount = accounts[7];

    beforeEach(async () => {
        arInstance = await AccessRestriction.new({ from: deployerAccount });

        treeTypeInstance = await TreeType.new(arInstance.address, { from: deployerAccount });
        gbInstance = await GBFactory.new(arInstance.address, { from: deployerAccount });
        treeInstance = await TreeFactory.new(arInstance.address, { from: deployerAccount });
        updateInstance = await UpdateFactory.new(arInstance.address, { from: deployerAccount });
        o2Instance = await O2Factory.new(arInstance.address, { from: deployerAccount });

        await o2Instance.setTreeTypeAddress(treeTypeInstance.address, { from: deployerAccount });
        await o2Instance.setTreeFactoryAddress(treeInstance.address, { from: deployerAccount });
        await o2Instance.setUpdateFactoryAddress(updateInstance.address, { from: deployerAccount });
    });

    afterEach(async () => {
        // await o2Instance.kill({ from: ownerAccount });
    });

    async function addTree(name = null) {
        Common.addType(treeTypeInstance, deployerAccount);

        Common.addPlanter(arInstance, planter1Account, deployerAccount);
        Common.addTree(treeInstance, planter1Account);
        await Common.sleep(1000);
        
        Common.addUpdate(updateInstance, planter1Account);
        Common.acceptUpdate(updateInstance, deployerAccount);
    }

    async function addTree2Update(name = null) {
        Common.addType(treeTypeInstance, deployerAccount);

        Common.addPlanter(arInstance, planter1Account, deployerAccount);
        Common.addTree(treeInstance, planter1Account);

        await Common.sleep(1000);
        Common.addUpdate(updateInstance, planter1Account);
        Common.acceptUpdate(updateInstance, deployerAccount);
        await Common.sleep(1000);
        Common.addUpdate(updateInstance, planter1Account);
        Common.acceptUpdate(updateInstance, deployerAccount, 1);
    }


    async function add2Tree2Update(name = null) {
        Common.addType(treeTypeInstance, deployerAccount);

        Common.addPlanter(arInstance, planter1Account, deployerAccount);
        Common.addTree(treeInstance, planter1Account);
        Common.addTree(treeInstance, planter1Account);

        await Common.sleep(1000);
        Common.addUpdate(updateInstance, planter1Account, 0);
        Common.addUpdate(updateInstance, planter1Account, 1);

        Common.acceptUpdate(updateInstance, deployerAccount, 0);
        Common.acceptUpdate(updateInstance, deployerAccount, 1);

        await Common.sleep(1000);
        Common.addUpdate(updateInstance, planter1Account, 0);
        Common.addUpdate(updateInstance, planter1Account, 1);

        Common.acceptUpdate(updateInstance, deployerAccount, 2);
        Common.acceptUpdate(updateInstance, deployerAccount, 3);

    }


    it("should mint o2", async () => {
        let titleTree = 'firstTree';

        await addTree(titleTree);

        let tx = await o2Instance.mint({ from: planter1Account });

        truffleAssert.eventEmitted(tx, 'O2Minted', (ev) => {
            return ev.owner.toString() === planter1Account && ev.totalO2.toString() === '100';
        });
    });

    it("should not mint o2 second time", async () => {
        let titleTree = 'firstTree';

        await addTree(titleTree);

        await o2Instance.mint({ from: planter1Account });


        await o2Instance.mint({ from: planter1Account })
            .then(assert.fail)
            .catch(error => {
                console.log(error.message);

                assert.include(
                    error.message,
                    'MintableO2 is zero',
                    'second mint should throw an exception.'
                )
            });
    });


    it("should mint o2 twice", async () => {
        let titleTree = 'secondTree';

        await addTree2Update(titleTree);

        let tx = await o2Instance.mint({ from: planter1Account });

        truffleAssert.eventEmitted(tx, 'O2Minted', (ev) => {
            return ev.owner.toString() === planter1Account && ev.totalO2.toString() === '200';
        });
    });


    it("should mint o2 with 2 tree and 2 update", async () => {
        let titleTree = 'secondTree';

        await add2Tree2Update(titleTree);

        let tx = await o2Instance.mint({ from: planter1Account });

        truffleAssert.eventEmitted(tx, 'O2Minted', (ev) => {
            return ev.owner.toString() === planter1Account && ev.totalO2.toString() === '400';
        });
    });


    it('should return balance of planter', async () => {

        let titleTree = 'firstTree';
        await addTree(titleTree);

        await o2Instance.mint({ from: planter1Account });

        return await o2Instance.balanceOf(planter1Account, { from: planter1Account })
            .then((balance) => {
                assert.equal(
                    '100',
                    balance,
                    "Balance of planter: " + balance
                );
            }).catch((error) => {
                console.log(error);
            });
    });

});