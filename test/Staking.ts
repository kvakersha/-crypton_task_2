import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { Staking, TokenTest } from "../typechain";

describe("Greeter", function () {

  let tokenLP: TokenTest
  let tokenReward: TokenTest
  let staking: Staking

  beforeEach(async () => {
    const TestToken = await ethers.getContractFactory("TokenTest");
    tokenLP = await TestToken.deploy("Token", "LP") as TokenTest
    await tokenLP.deployed();
    tokenReward = await TestToken.deploy("Token", "Reward") as TokenTest
    await tokenReward.deployed();

    const Staking = await ethers.getContractFactory("Staking");
    staking = await Staking.deploy(tokenLP.address, tokenReward.address) as Staking
    await staking.deployed()
  })

  it("Earning function works", async function () {
    await tokenReward.transfer(staking.address, "1000000000000000000000")

    await tokenLP.approve(staking.address, "300000000000000000000")
    await staking.stake("100000000000000000000") //100 tokens

    expect(await staking.checkEarned((await ethers.getSigners())[0].address)).to.be.equal("0")
    await sleep(1200)
    expect(await staking.checkEarned((await ethers.getSigners())[0].address)).to.be.equal("40000000000000000000")
    await staking.stake("100000000000000000000")
    await sleep(600)
    expect(await staking.checkEarned((await ethers.getSigners())[0].address)).to.be.equal("80000000000000000000")
    await staking.stake("100000000000000000000")
    await sleep(1200)
    expect(await staking.checkEarned((await ethers.getSigners())[0].address)).to.be.equal("200000000000000000000")
    await staking.unstake("300000000000000000000")
    await sleep(6000)
    expect(await staking.checkEarned((await ethers.getSigners())[0].address)).to.be.equal("200000000000000000000")
    
    await staking.claim()
    expect(await staking.checkEarned((await ethers.getSigners())[0].address)).to.be.equal("0")

    expect(await tokenReward.balanceOf((await ethers.getSigners())[0].address)).to.be.equal("200000000000000000000")
  });

  it("Can't unstake earlier", async() => {
    await tokenLP.approve(staking.address, "300000000000000000000")
    
    await staking.stake("100000000000000000000")
    await sleep(500)
    await expect(staking.unstake("100000000000000000000")).to.be.reverted
    await sleep(100)
    await expect(staking.unstake("300000000000000000000")).to.be.reverted

  })

  it("Can't transfer more tokens than you have", async () => {
    await tokenLP.approve(staking.address, "10000000000000000000000")
    await expect(staking.stake("10000000000000000000000")).to.be.reverted
  })

  it("Setters work", async () => {
    await expect(staking.setRewardPercentagePerClaimPeriod(105)).to.be.reverted
    await staking.setClaimPeriod(5)  
    await staking.setUnstakePeriod(5)
    await staking.setRewardPercentagePerClaimPeriod(5)

    expect(await staking.claimPeriod()).to.be.equal(5)
    expect(await staking.unstakePeriod()).to.be.equal(5)
    expect(await staking.rewardPercentagePerClaimPeriod()).to.be.equal(5)
  })

  async function sleep(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds])
    await ethers.provider.send("evm_mine", [])
  }
});
