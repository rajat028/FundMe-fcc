const { run } = require("hardhat");
async function verify(contractAddress, args) {
  console.log("Verify contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.messge.toLowerCase().includes("already verified")) {
      console.log("Already Verifed");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };
