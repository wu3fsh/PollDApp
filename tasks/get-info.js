task('get-info', 'Get info about the poll')
  .addParam('account', "The account's address")
  .addParam('poll', "The poll's address")
  .setAction(async (taskArgs) => {
    const MyContract = await ethers.getContractFactory('Poll');
    const contract = await MyContract.attach(taskArgs.poll);
    await contract.connect(taskArgs.account);
    console.log('info', await contract.getInfo());
  });
