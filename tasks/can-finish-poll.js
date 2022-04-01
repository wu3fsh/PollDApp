task('can-finish-poll', 'Can finish the poll?')
  .addParam('account', "The account's address")
  .addParam('poll', "The poll's address")
  .setAction(async (taskArgs) => {
    const MyContract = await ethers.getContractFactory('Poll');
    const contract = await MyContract.attach(taskArgs.poll);
    await contract.connect(taskArgs.account);
    console.log('Can finish the poll?', await contract.canFinishPoll());
  });
