// deploy/01_deploy_Ethermon.js

const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  let ethermon;

  ethermon = await deploy("Ethermon", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (chainId != localChainId) {
    // verify on etherscan
    log("Verifying...");
    await verify(ethermon.address);
  }

  log("----------------------------------------------------------");
};

module.exports.tags = ["all", "ethermon"];
