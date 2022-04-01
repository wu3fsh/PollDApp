task('get-polls', 'Get polls').setAction(async (taskArgs) => {
  const MyContract = await ethers.getContractFactory('PollFactory');
  const contract = await MyContract.attach(process.env.POLL_FACTORY_ADDRESS);
  await contract.connect(process.env.OWNER_ADDRESS);
  const polls = await contract.getPolls();
  console.log('polls:', polls);
});
