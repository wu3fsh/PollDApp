const { expect } = require('chai');

describe('Poll contract', function () {
  let Poll;
  let hardhatPoll;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    factory = await ethers.getContractFactory('PollFactory');
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    hardhatPoll = await factory.deploy();
    PollFactory = await ethers.getContractFactory('Poll'); // toDo: change a variable name
    await hardhatPoll.createPollWithCustomDuration(5);
    Poll = await PollFactory.attach(hardhatPoll.polls(0));
  });

  describe('Tests', function () {
    it('Should set the right owner', async function () {
      expect(await hardhatPoll.owner()).to.equal(owner.address);
    });

    it('Should vote for an address', async function () {
      await Poll.vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });

      const participantCount = await Poll.getParticipantsCount();
      const participantAddress = await Poll.participantsList(
        participantCount - 1
      );
      const votes = await Poll.participants(participantAddress);
      const provider = waffle.provider;

      expect(await provider.getBalance(hardhatPoll.polls(0))).to.equal(
        10000000000000000n
      );
      expect(await Poll.voters(owner.address)).to.true;
      expect(participantCount).to.equal(1);
      expect(participantAddress).to.equal(addr1.address);
      expect(votes).to.equal(1);
      expect(await Poll.currentWinner()).to.equal(addr1.address);
    });

    it('Should throw an exception if a poll is expired', async function () {
      try {
        await hardhatPoll.createPollWithCustomDuration(0);
        const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
        expect(
          await newPoll.vote(addr1.address, {
            value: ethers.utils.parseEther('0.01'),
          })
        ).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string('The poll has already expired');
      }
    });

    it("Should throw an exception if donation isn't equal to 0.01 eth", async function () {
      try {
        expect(
          await Poll.vote(addr1.address, {
            value: ethers.utils.parseEther('0.02'),
          })
        ).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string(
          'Donation must be equal to 0.01 eth'
        );
      }
    });

    it('Should throw an exception if an address has already voted', async function () {
      try {
        await Poll.vote(addr1.address, {
          value: ethers.utils.parseEther('0.01'),
        });
        expect(
          await Poll.vote(addr1.address, {
            value: ethers.utils.parseEther('0.01'),
          })
        ).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string(
          'This address has already voted'
        );
      }
    });

    it('Should return a current winner', async function () {
      await Poll.vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });
      await Poll.connect(addr1).vote(addr2.address, {
        value: ethers.utils.parseEther('0.01'),
      });
      await Poll.connect(addr2).vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });

      const participiantCount = await Poll.getParticipantsCount();
      const winnerAddress = await Poll.currentWinner();

      const winnerVotes = await Poll.participants(addr1.address);
      const provider = waffle.provider;

      expect(await provider.getBalance(hardhatPoll.polls(0))).to.equal(
        30000000000000000n
      );
      expect(participiantCount).to.equal(2);
      expect(winnerVotes).to.equal(2);
      expect(winnerAddress).to.equal(addr1.address);
    });

    it('Should finish a poll without participants', async function () {
      await hardhatPoll.createPollWithCustomDuration(0);
      const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
      await newPoll.finishPoll();
      expect(await newPoll.isCompleted()).to.true;
    });

    it('Should finish a poll', async function () {
      await hardhatPoll.createPollWithCustomDuration(1);
      const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
      await newPoll.vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });
      await timeout(1000);
      await newPoll.finishPoll();
      expect(await newPoll.isCompleted()).to.true;
      expect(await waffle.provider.getBalance(hardhatPoll.polls(1))).to.equal(
        1000000000000000
      );
    });

    it('Should throw an exception if the poll time is not over', async function () {
      try {
        await hardhatPoll.createPollWithCustomDuration(10);
        const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
        expect(await newPoll.finishPoll()).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string('Poll time is not over yet');
      }
    });

    it('Should throw an exception if the poll has already finished', async function () {
      try {
        await hardhatPoll.createPollWithCustomDuration(0);
        const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
        await newPoll.finishPoll();
        expect(await newPoll.finishPoll()).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string(
          'The poll has already finished'
        );
      }
    });

    it('Should withdraw a commission', async function () {
      await hardhatPoll.createPollWithCustomDuration(1);
      const pollAddress = hardhatPoll.polls(1);
      const newPoll = await PollFactory.attach(pollAddress);
      await newPoll.vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });
      await timeout(1000);
      await newPoll.finishPoll();
      expect(await newPoll.isCompleted()).to.true;
      expect(await waffle.provider.getBalance(pollAddress)).to.equal(
        1000000000000000
      );
      const ownerBalance = await waffle.provider.getBalance(
        hardhatPoll.owner()
      );
      await newPoll.withdrawCommission();
      expect(await waffle.provider.getBalance(pollAddress)).to.equal(0);
      expect(
        parseInt(await waffle.provider.getBalance(hardhatPoll.owner()))
      ).to.be.greaterThanOrEqual(
        parseInt(BigInt(ownerBalance) + 950000000000000n)
      );
    });

    it('Should throw an exception if non-owner address try to withdraw a commission', async function () {
      try {
        expect(await Poll.connect(addr2).withdrawCommission()).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string(
          'Only the owner of the contract can perform this operation'
        );
      }
    });

    it("Should throw an exception if the poll hasn't finished yet", async function () {
      try {
        await hardhatPoll.createPollWithCustomDuration(10);
        const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
        expect(await newPoll.withdrawCommission()).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string("The poll hasn't finished yet");
      }
    });

    it('Should throw an exception if the poll balance is zero', async function () {
      try {
        await hardhatPoll.createPollWithCustomDuration(0);
        const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
        await newPoll.finishPoll();
        expect(await newPoll.withdrawCommission()).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string('The poll balance is zero');
      }
    });

    it('Should return false', async function () {
      await hardhatPoll.createPollWithCustomDuration(10);
      const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
      expect(await newPoll.canFinishPoll()).to.false;
    });

    it('Should check if an address has already voted', async function () {
      await hardhatPoll.createPollWithCustomDuration(10);
      const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
      await newPoll.vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });
      expect(await newPoll.hasVoted(owner.address)).to.true;
    });

    it('Should return a poll info', async function () {
      const duration = 10;
      await hardhatPoll.createPollWithCustomDuration(duration);
      const newPoll = await PollFactory.attach(hardhatPoll.polls(1));
      const startDateExpected = await newPoll.startDate();
      await newPoll.vote(addr1.address, {
        value: ethers.utils.parseEther('0.01'),
      });
      const [
        currentWinner,
        balance,
        isCompleted,
        startDate,
        pollDurationSeconds,
        participantsListLength,
        ownerAddress,
      ] = await newPoll.getInfo();
      expect(currentWinner).to.equal(addr1.address);
      expect(balance).to.equal(10000000000000000n);
      expect(isCompleted).to.equal(false);
      expect(startDate).to.equal(startDateExpected);
      expect(pollDurationSeconds).to.equal(duration);
      expect(participantsListLength).to.equal(1);
      expect(ownerAddress).to.equal(owner.address);
    });
  });
});

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
