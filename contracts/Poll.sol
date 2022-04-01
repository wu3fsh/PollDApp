pragma solidity ^0.7.0;

import "hardhat/console.sol"; // for debug

// ToDo: add openZeppelin SafeMath
contract PollFactory {
    address[] public polls;
    address public owner;
    uint256 public constant defaultPollDurationSeconds = 60 * 60 * 24 * 3;

    constructor() {
        owner = msg.sender;
    }

    function createPoll() public {
        require(msg.sender == owner);

        address newPoll = address(
            new Poll(msg.sender, defaultPollDurationSeconds)
        );
        polls.push(newPoll);
    }

    function createPollWithCustomDuration(uint256 pollDurationSeconds) public {
        require(msg.sender == owner);

        address newPoll = address(new Poll(msg.sender, pollDurationSeconds));
        polls.push(newPoll);
    }

    function getPolls() public view returns (address[] memory) {
        return polls;
    }
}

contract Poll {
    address public manager;
    address public currentWinner;
    mapping(address => uint256) public participants;
    address[] public participantsList;
    mapping(address => bool) public voters;
    uint256 public startDate;
    uint256 public pollDurationSeconds;
    bool public isCompleted;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(address owner, uint256 durationSeconds) {
        manager = owner;
        startDate = block.timestamp;
        pollDurationSeconds = durationSeconds;
    }

    function vote(address to) public payable {
        require(block.timestamp <= (startDate + pollDurationSeconds));
        require(msg.value == 10000000000000000);
        require(voters[msg.sender] != true);

        voters[msg.sender] = true;
        uint256 votesCount = participants[to];

        if (votesCount == 0) {
            participantsList.push(to);
        }

        participants[to] = ++votesCount;

        if (participants[currentWinner] < votesCount) {
            currentWinner = to;
        }
    }

    function finishPoll() public {
        require(block.timestamp > (startDate + pollDurationSeconds));
        require(!isCompleted);

        uint256 balance = address(this).balance;
        if (balance > 0 && participantsList.length > 0) {
            // send 90% money to winner
            uint256 amountToSend = balance - balance / 10;
            payable(currentWinner).transfer(amountToSend);
        }

        isCompleted = true;
    }

    function withdrawCommission() public restricted {
        require(isCompleted);
        require(address(this).balance > 0, "Balance is zero");

        // send money to manager
        payable(manager).transfer(address(this).balance);
    }

    function getInfo()
        public
        view
        returns (
            address,
            uint256,
            bool,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            currentWinner,
            address(this).balance,
            isCompleted,
            startDate,
            pollDurationSeconds,
            participantsList.length,
            manager
        );
    }

    function getLeader() public view returns (address, uint256) {
        return (currentWinner, participants[currentWinner]);
    }

    function hasVoted(address source) public view returns (bool) {
        return voters[source];
    }

    function getParticipantsCount() public view returns (uint256) {
        return participantsList.length;
    }

    function canFinishPoll() public view returns (bool) {
        return
            !isCompleted &&
            (block.timestamp > (startDate + pollDurationSeconds));
    }
}
