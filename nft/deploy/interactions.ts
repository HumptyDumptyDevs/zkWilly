import hre from "hardhat";

// const callDonateFunds = async () => {
export default async function main() {
  try {
    // Get the ContractFactory of your ZKWillyNFT
    const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");

    // Connect to the deployed contract
    const contractAddress = "0xF195384460f2BBE4442863f4D9Bf10E6Acb5fEff"; // Replace with your deployed contract address
    const contract = await ZKWillyNFT.attach(contractAddress);

    // Call donateFunds in the contract
    await contract.donateFunds({ gasLimit: 2000000000 });

    // Retrieve the updated message
    console.log("donateFunds called");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
