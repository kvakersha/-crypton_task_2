import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

task("stake", "amount")
  .addParam("amount")
  .addParam("contract")
  .setAction(async (args, hre) => {
    const Contract = await hre.ethers.getContractFactory("Staking")
    const contract = await Contract.attach(args.contract)

    return await contract.stake(args.amount)
  });


task("unstake", "amount")
  .addParam("amount")
  .addParam("contract")
  .setAction(async (args, hre) => {
    const Contract = await hre.ethers.getContractFactory("Staking")
    const contract = await Contract.attach(args.contract)

    return await contract.unstake(args.amount)
  });

  task("claim", "amount")
  .addParam("contract")
  .setAction(async (args, hre) => {
    const Contract = await hre.ethers.getContractFactory("Staking")
    const contract = await Contract.attach(args.contract)

    return await contract.claim()
  });