const HDwalletProvider = require('@truffle/hdwallet-provider');
var Web3 = require("web3");
privateKey = '0x23eb4fcdaf0e777d818e96f8e1ffea034dfd881f24ed745db52b5f4c86a3b765';
module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // for more about customizing your Truffle configuration!
    networks: {
    //   development: {
    //     host: "127.0.0.1",
    //     port: 8545,
    //     network_id: "*", // Match any network id
    //     gas: 6000000
    //   },
      rinkeby: {
        provider: () => new HDwalletProvider(
          privateKey,
          'https://ropsten.infura.io/v3/24b49cc800a04404ae669233b6931097'
        ),
      }

      // develop: {
      //   port: 7545
      //}
    },
    
  };

  