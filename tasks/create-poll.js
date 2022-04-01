task('create-poll', 'Create a new poll').setAction(async () => {
  const MyContract = await ethers.getContractFactory('PollFactory');
  const contract = await MyContract.attach(process.env.POLL_FACTORY_ADDRESS);
  await contract.connect(process.env.OWNER_ADDRESS);
  await contract.createPoll();
  console.log('Done');
});
