require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-web3');
require('@nomiclabs/hardhat-ethers');
require('solidity-coverage');
require('./tasks/create-poll');
require('./tasks/get-info');
require('./tasks/vote');
require('./tasks/finish-poll');
require('./tasks/withdraw-commission');
require('./tasks/create-poll-custom-duration');
require('./tasks/get-polls');
require('dotenv').config();

module.exports = {
  solidity: '0.7.3',
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`],
    },
  },
};
