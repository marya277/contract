require("dotenv").config();
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

const AccessRestriction = artifacts.require("AccessRestriction.sol");
const Tree = artifacts.require("Tree.sol");
const TreeAuction = artifacts.require("TreeAuction.sol");
const TreeFactory = artifacts.require("TreeFactory.sol");
const Treasury = artifacts.require("Treasury.sol");
const Planter = artifacts.require("Planter.sol");
const RegularSell = artifacts.require("RegularSell.sol");
const IncrementalSell = artifacts.require("IncrementalSell.sol");
const TreeAttribute = artifacts.require("TreeAttribute.sol");

//gsn
var WhitelistPaymaster = artifacts.require("WhitelistPaymaster.sol");

//role
const PLANTER_ROLE = web3.utils.soliditySha3("PLANTER_ROLE");
const AUCTION_ROLE = web3.utils.soliditySha3("AUCTION_ROLE");
const TREE_FACTORY_ROLE = web3.utils.soliditySha3("TREE_FACTORY_ROLE");
const TREASURY_ROLE = web3.utils.soliditySha3("TREASURY_ROLE");
const REGULAR_SELL_ROLE = web3.utils.soliditySha3("REGULAR_SELL_ROLE");
const INCREMENTAL_SELL_ROLE = web3.utils.soliditySha3("INCREMENTAL_SELL_ROLE");

module.exports = async function (deployer, network, accounts) {
  const isLocal = network === "development";

  let accessRestrictionAddress = AccessRestriction.address;
  let treeAddressAddress = Tree.address;
  let treeAuctionAddress = TreeAuction.address;
  let treeFactoryAddress = TreeFactory.address;
  let treasuryAddress = Treasury.address;
  let planterAddress = Planter.address;
  let regularSellAddress = RegularSell.address;
  let incrementalSellAddress = IncrementalSell.address;
  let treeAttributeAddress = TreeAttribute.address;

  //gsn
  let trustedForwarder;
  let relayHub;
  let paymasterAddress = WhitelistPaymaster.address;

  if (isLocal) {
    trustedForwarder = require("../build/gsn/Forwarder.json").address;
    relayHub = require("../build/gsn/RelayHub.json").address;
  } else {
    trustedForwarder = process.env.GSN_FORWARDER;
    relayHub = process.env.GSN_RELAY_HUB;
  }

  console.log("Call AccessRestriction Methods...");
  await AccessRestriction.deployed().then(async (instance) => {
    await instance.grantRole(PLANTER_ROLE, planterAddress);
    await instance.grantRole(AUCTION_ROLE, treeAuctionAddress);
    await instance.grantRole(TREE_FACTORY_ROLE, treeFactoryAddress);
    await instance.grantRole(TREASURY_ROLE, treasuryAddress);
    await instance.grantRole(REGULAR_SELL_ROLE, regularSellAddress);
    await instance.grantRole(INCREMENTAL_SELL_ROLE, incrementalSellAddress);
  });

  console.log("Call WhitelistPaymaster Methods...");
  await WhitelistPaymaster.deployed().then(async (instance) => {
    await instance.setWhitelistTarget(planterAddress);
    await instance.setWhitelistTarget(treasuryAddress);
    await instance.setWhitelistTarget(treeFactoryAddress);
    await instance.setRelayHub(relayHub);
    await instance.setTrustedForwarder(trustedForwarder);
  });
};