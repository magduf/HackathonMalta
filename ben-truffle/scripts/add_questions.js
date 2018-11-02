module.exports = function(callback) {

	keccak256 = require('js-sha3').keccak256;
	ten_eth = 10000000000000000000;
	one_eth = 1000000000000000000;

	function encrypt(data){
		return "0x" + keccak256(data)
	}

    player1Address = "0xf17f52151ebef6c7334fad080c5704d77216b732"


	  let Web3 = require('web3');
	  const truffleContract = require('truffle-contract')
	  let contract = truffleContract(require('../build/contracts/Quiz.json'));
	  var provider = new Web3.providers.HttpProvider("http://localhost:8545");
	  var web3 = new Web3(provider);
	  contract.setProvider(web3.currentProvider);

	  //workaround: https://github.com/trufflesuite/truffle-contract/issues/57
	  if (typeof contract.currentProvider.sendAsync !== "function") {
	    contract.currentProvider.sendAsync = function() {
	      return contract.currentProvider.send.apply(
	        contract.currentProvider, arguments
	      );
	    };
	  }

	  contract.deployed().then(async function(QUIZ) {
        response = await QUIZ.postQuestion(1, 1, "What color is the sky?", encrypt("blue"), {from: player1Adddress})
        console.log("Added Question " + JSON.stringify(response))

	  });
	

}