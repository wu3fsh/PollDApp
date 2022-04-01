const { expect } = require('chai');

describe('Poll contract', function () {
  let Poll;
  let hardhatPoll;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    PollFactory = await ethers.getContractFactory('PollFactory');
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    hardhatPoll = await PollFactory.deploy();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      console.log(hardhatPoll.address);
      console.log(hardhatPoll.resolvedAddress);
      expect(await hardhatPoll.owner()).to.equal(owner.address);
    });
  });
});
