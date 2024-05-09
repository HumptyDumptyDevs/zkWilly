import { task } from "hardhat/config";

interface ContractInteractions {
  contractName: string;
  address: string;
}

const contracts: ContractInteractions[] = [
  {
    contractName: "ZKWillyNFT",
    address: "0x3914723e2b745Bd5407042603EEf52d0A4216CEB",
  },
];

task("startMint", "Calls startMint on the ZKWillyNFT contract").setAction(
  async (args, hre) => {
    const contractConfig = contracts.find(
      (c) => c.contractName === "ZKWillyNFT"
    );
    if (!contractConfig) {
      console.error("Contract not found: ZKWillyNFT");
      return;
    }

    const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");
    const contract = ZKWillyNFT.attach(contractConfig.address);

    try {
      await contract.startMint({ gasLimit: 2000000000 });
      console.log("startMint called");
    } catch (error) {
      console.error(error);
    }
  }
);

task("withdraw", "Calls withdraw on the ZKWillyNFT contract").setAction(
  async (args, hre) => {
    const contractConfig = contracts.find(
      (c) => c.contractName === "ZKWillyNFT"
    );
    if (!contractConfig) {
      console.error("Contract not found: ZKWillyNFT");
      return;
    }

    const ZKWillyNFT = await hre.ethers.getContractFactory("ZKWillyNFT");
    const contract = ZKWillyNFT.attach(contractConfig.address);

    try {
      await contract.withdraw({ gasLimit: 2000000000 });
      console.log("withdraw called");
    } catch (error) {
      console.error(error);
    }
  }
);
