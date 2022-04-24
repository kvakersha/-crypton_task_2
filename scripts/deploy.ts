// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy("0x7b21d7aac197e93bfd2d5f88ed618bcef57e707b", "0x579aa33bb469B6FF5051aA84754a5cF099A93DB1");

  await staking.deployed();

  console.log("Staking deployed to:", staking.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
