const { expect } = require('chai');

describe('PollFactory contract', function () {
  let hardhatPollFactory;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    const factory = await ethers.getContractFactory('PollFactory');
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    hardhatPollFactory = await factory.deploy();
  });

  describe('Tests', function () {
    it('Should set the right owner', async function () {
      expect(await hardhatPollFactory.owner()).to.equal(owner.address);
    });

    it('Should return empty polls array ', async function () {
      expect(await hardhatPollFactory.getPolls()).to.empty;
    });

    it('Should create a new poll', async function () {
      await hardhatPollFactory.createPoll();
      const pollsArray = await hardhatPollFactory.getPolls();
      expect(pollsArray.length).to.equal(1);
    });

    it('Should create a new poll with custom duration', async function () {
      await hardhatPollFactory.createPollWithCustomDuration(1);
      const pollsArray = await hardhatPollFactory.getPolls();
      expect(pollsArray.length).to.equal(1);
    });

    it('Should throw an exception if non-owner address try to create a new poll', async function () {
      try {
        expect(await hardhatPollFactory.connect(addr2).createPoll()).to.throw();
      } catch (error) {
        expect(error.toString()).to.have.string(
          'Only the owner of the contract can perform this operation'
        );
      }
    });
  });
});
