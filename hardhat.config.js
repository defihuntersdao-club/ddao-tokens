require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');

const path = require('path');
const envPath = path.join(__dirname, './.env');
require('dotenv').config({ path: envPath });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: "0.8.3",

  networks: {
    hardhat: {
      forking: {
        url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY_RINKEBY}`,
        accounts: [process.env.PRIVATE_KEY],
      }
    },
    rinkeby: {
        url: `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_KEY_RINKEBY}`,
        accounts: [process.env.PRIVATE_KEY],
    },
    ropsten: {
        url: `https://eth-kovan.alchemyapi.io/v2/${process.env.ALCHEMY_KEY_ROPSTEN}`,
        accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY_RINKEBY,
  }
};