pragma solidity ^0.7.0;

// ToDo: add openZeppelin SafeMath
contract PollFactory {
    address[] public polls;
    address public owner;
    uint256 public constant defaultPollDurationSeconds = 60 * 60 * 24 * 3;

    modifier restricted() {
        require(
            msg.sender == owner,
            "Only the owner of the contract can perform this operation"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createPoll() public restricted {
        address newPoll = address(
            new Poll(msg.sender, defaultPollDurationSeconds)
        );
        polls.push(newPoll);
    }

    function createPollWithCustomDuration(uint256 pollDurationSeconds)
        public
        restricted
    {
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
        require(
            msg.sender == manager,
            "Only the owner of the contract can perform this operation"
        );
        _;
    }

    constructor(address owner, uint256 durationSeconds) {
        manager = owner;
        startDate = block.timestamp;
        pollDurationSeconds = durationSeconds;
    }

    function vote(address to) public payable {
        require(
            block.timestamp <= (startDate + pollDurationSeconds),
            "The poll has already expired"
        );
        require(
            msg.value == 10000000000000000,
            "Donation must be equal to 0.01 eth"
        );
        require(voters[msg.sender] != true, "This address has already voted");

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
        require(
            block.timestamp > (startDate + pollDurationSeconds),
            "Poll time is not over yet"
        );
        require(!isCompleted, "The poll has already finished");

        uint256 balance = address(this).balance;
        if (balance > 0 && participantsList.length > 0) {
            // send 90% money to winner
            uint256 amountToSend = balance - balance / 10;
            payable(currentWinner).transfer(amountToSend);
        }

        isCompleted = true;
    }

    function withdrawCommission() public restricted {
        require(isCompleted, "The poll hasn't finished yet");
        require(address(this).balance > 0, "The poll balance is zero");

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
