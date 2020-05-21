const Election = artifacts.require("./Election.sol");
//artifacts respresents the contract abstarction that is specific to truffle
module.exports = function(deployer, _, accounts) {
  deployer.deploy(Election);
  web3.eth.sendTransaction({
    from: accounts[0],
    to : '0x87BE41c278BD2489691c66Cf149A42d627592190',
    value: web3.utils.toWei('1', 'ether')
  });
};
