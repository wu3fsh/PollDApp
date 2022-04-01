task('create-poll-custom', 'Create a new poll with custom duration')
  .addParam('duration', "The poll's duration")
  .setAction(async (taskArgs) => {
    const MyContract = await ethers.getContractFactory('PollFactory');
    const contract = await MyContract.attach(process.env.POLL_FACTORY_ADDRESS);
    await contract.connect(process.env.OWNER_ADDRESS);
    await contract.createPollWithCustomDuration(taskArgs.duration);
    console.log('Done');
  });
