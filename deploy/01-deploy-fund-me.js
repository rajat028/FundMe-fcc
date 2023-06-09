
const { networkConfig, developmentChains } = require("../helper-hardhat-config");
const { network, deployments } = require("hardhat");
const { verify } = require("../utils/verify");

// hre is hardhat run time envoirnment
module.exports = async({hre}) => {
    const {deploy, log} = deployments
    const {deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress 
    if(developmentChains.includes(network.name)) {
      const ethUsdAggregator = await deployments.get("MockV3Aggregator")
      ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
      ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
       await verify(fundMe.address, args);
    }

    log("-----------------------------")
}
module.exports.tags = ["all", "fundme"]