const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
developmentChains.includes(network.name)
  ? describe("FundMe", async () => {
      let fundMe;
      let deployerFromNetwork;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        deployerFromNetwork = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployerFromNetwork);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployerFromNetwork
        );
      });

      describe("constructor", async () => {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("should fail if not enough ETH send", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });

        it("should update data when valid fund send", async () => {
          await fundMe.fund({ value: sendValue });
          const fundValue = await fundMe.getAddressToAmountFunded(
            deployerFromNetwork
          );
          const funder = await fundMe.getFunder(0);
          assert.equal(fundValue.toString(), sendValue.toString());
          assert.equal(funder, deployerFromNetwork);
        });
      });

      describe("withdraw", async function () {
        this.beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single funder", async () => {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingFunderBalance = await fundMe.provider.getBalance(
            deployerFromNetwork
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const enddingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const enddingFunderBalance = await fundMe.provider.getBalance(
            deployerFromNetwork
          );

          console.log(`GasCost = ${gasCost}`);
          assert(enddingFundMeBalance, 0);
          assert(
            startingFundMeBalance.add(startingFunderBalance).toString(),
            enddingFunderBalance.add(gasCost).toString()
          );
        });

        it("is allows us to withdraw with multiple s_funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners();
          for (i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployerFromNetwork
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          // Let's comapre gas costs :)
          // const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait();
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const withdrawGasCost = gasUsed.mul(effectiveGasPrice);
          console.log(`GasCost: ${withdrawGasCost}`);
          console.log(`GasUsed: ${gasUsed}`);
          console.log(`GasPrice: ${effectiveGasPrice}`);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployerFromNetwork
          );
          // Assert
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(withdrawGasCost).toString()
          );
          // Make a getter for storage variables
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("should throw error when non-owner user tries to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const fundMeConnectedContract = await fundMe.connect(accounts[1]);
          await expect(
            fundMeConnectedContract.cheaperWithdraw()
          ).to.be.revertedWithCustomError(
            fundMeConnectedContract,
            "FundMe_NotOwner"
          );
        });
      });
    })
  : describe.skip;