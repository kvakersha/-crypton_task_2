//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract Staking is Ownable {
    uint256 public unstakePeriod = 1200; //seconds
    uint256 public claimPeriod = 600; //seconds
    uint256 public rewardPercentagePerClaimPeriod = 20;

    mapping(address => uint256) public alreadyWithdrawn;
    mapping(address => uint256) public earned;
    mapping(address => uint256) public staked;
    mapping(address => uint256) public lastUpdate;

    IERC20 public token;
    IERC20 public rewardToken;

    event tokensStaked(address from, uint256 amount);
    event TokensUnstaked(address to, uint256 amount);

    constructor(IERC20 _token, IERC20 _rewardToken) {
        token = _token;
        rewardToken = _rewardToken;
    }

    function stake(uint256 _amount) external {
        require(_amount <= token.balanceOf(msg.sender), "You don't have that many tokens");

        token.transferFrom(msg.sender, address(this), _amount);

        if(lastUpdate[msg.sender] > 0) {
            earned[msg.sender] = earned[msg.sender] + staked[msg.sender] * ((block.timestamp - lastUpdate[msg.sender]) / claimPeriod) * rewardPercentagePerClaimPeriod / 100;
        }
        
        lastUpdate[msg.sender] = block.timestamp;
        staked[msg.sender] = staked[msg.sender] + _amount;

        emit tokensStaked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external {
        require(staked[msg.sender] >= _amount, "Insufficient tokens staked");

        if (block.timestamp >= lastUpdate[msg.sender] + unstakePeriod) {
            token.transfer(msg.sender, _amount);
            earned[msg.sender] = earned[msg.sender] + staked[msg.sender] * ((block.timestamp - lastUpdate[msg.sender]) / claimPeriod) * rewardPercentagePerClaimPeriod / 100;
            staked[msg.sender] = staked[msg.sender] - _amount;
            lastUpdate[msg.sender] = block.timestamp;

            emit TokensUnstaked(msg.sender, _amount);
        } else {
            revert("Tokens are only available after correct time period has elapsed");
        }
    }

    function claim() external {
        uint256 _amount = checkEarned(msg.sender);
        earned[msg.sender] = _amount;
        rewardToken.transfer(msg.sender, _amount - alreadyWithdrawn[msg.sender]);
        lastUpdate[msg.sender] += (block.timestamp - lastUpdate[msg.sender]) / claimPeriod * claimPeriod;
        alreadyWithdrawn[msg.sender] = _amount;
    }

    function setClaimPeriod(uint256 _newValue) onlyOwner external {
        claimPeriod = _newValue;
    }

    function setUnstakePeriod(uint256 _newValue) onlyOwner external {
        unstakePeriod = _newValue;
    }

    function setRewardPercentagePerClaimPeriod(uint256 _newValue) onlyOwner external {
        require(_newValue <= 100, "Max 100%");
        rewardPercentagePerClaimPeriod = _newValue;
    }

    function checkEarned(address _addr) public view returns (uint256){
        return earned[_addr] + staked[_addr] * ((block.timestamp - lastUpdate[_addr]) / claimPeriod) * rewardPercentagePerClaimPeriod / 100 - alreadyWithdrawn[_addr];
    }
}
