task('vote', 'Vote for a participant')
  .addParam('account', "The account's address")
  .addParam('poll', "The poll's address")
  .addParam('participant', "The participant's address")
  .setAction(async (taskArgs) => {
    const MyContract = await ethers.getContractFactory('Poll');
    const contract = await MyContract.attach(taskArgs.poll);
    await contract.connect(taskArgs.account);
    console.log('participant', taskArgs.participant);
    await contract.vote(taskArgs.participant, {
      value: ethers.utils.parseEther('0.01'),
    });
    console.log('Done');
  });
