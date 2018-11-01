var SimpleStore = artifacts.require("./SimpleStore.sol");
var Quiz = artifacts.require("./Quiz.sol");
module.exports = function(deployer, network) {
  if (network === 'rinkeby') {
    return
  }

  deployer.deploy(SimpleStore);
  deployer.deploy(Quiz);

};


 
