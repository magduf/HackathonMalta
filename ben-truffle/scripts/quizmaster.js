function encrypt(data){
	return "0x" + keccak256(data)
}

const Q1 = "What color is the sky?"
const Q2 = "How big is the moon?"
const Q3 = "What is the depth of the ocean?"
const Q4 = "What keeps you up at night?"
const Q5 = "What do you live for?"

const A1 = "blue"
const A2 = "pretty big"
const A3 = "depends which ocean"
const A4 = "whatevers cheapest"
const A5 = "a shot at petting the fancy horses"

console.log("Creating Quiz.")

module.exports = function(callback) {

	keccak256 = require('js-sha3').keccak256;
	ten_eth = 10000000000000000000;
	one_eth = 1000000000000000000;
	var readline = require('readline');

      quizmasterAddress = "0x627306090abab3a6e1400e9345bc60c78a8bef57";

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

	    response = await QUIZ.createQuiz(one_eth, {from: quizmasterAddress, value: ten_eth, gas:3000000});
	    quizID = JSON.stringify(response.logs[0].args.tokenId.toNumber())
      console.log("Deploying DAO.CASINO developer knowledge quiz.")
      console.log("Test your knowledge of the DAO.CASINO SDK and win 1 ETH!")


      async function publishQuestion(quizID, questionNumber, question, answer) {
          console.log("Publishing Question " + questionNumber + ".")
        	response = await QUIZ.postQuestion(quizID, questionNumber, question, encrypt(answer), {from: quizmasterAddress})
          console.log(JSON.stringify(response.logs[0].args.question))
      }

      async function publishAnswer(quizID, questionNumber, answer) {
      	console.log("Publishing Answer")
      	response = await QUIZ.postAnswer(quizID, questionNumber, answer, {from: quizmasterAddress})
      	console.log(JSON.stringify(response.logs[0].args.answer))
      }

  		var rl = readline.createInterface({
		  	input: process.stdin,
			  output: process.stdout
	   	});

      rl.question("Press enter to publish the first prewritten question...", async (response) => {
        await publishQuestion(quizID, 1, Q1, A1);
        rl.question("Press enter to publish the answer to the first question...", async (response) => {
            await publishAnswer(quizID, 1, A1);
            rl.question("Press enter to publish the second prewritten question...", async (response) => {
	            await publishQuestion(quizID, 2, Q2, A2);
		            rl.question("Press enter to publish the second prewritten answer...", async (response) => {
		  	          await publishAnswer(quizID, 2, A2);
	     	            rl.question("Press enter to publish the third prewritten answer...", async (response) => {
		   	              await publishQuestion(quizID, 3, Q3, A3);
            		     	  rl.question("Press enter to publish the third prewritten answer...", async (response) => {
              			   	  await publishAnswer(quizID, 3, A3);
              		     	  rl.question("Press enter to publish the forth prewritten answer...", async (response) => {
              			   	    await publishQuestion(quizID, 4, Q4, A4);
              		          rl.question("Press enter to publish the forth prewritten answer...", async (response) => {
              				        await publishAnswer(quizID, 4, A4);
              		   	        rl.question("Press enter to publish the fifth prewritten answer...", async (response) => {
              		   	          await publishQuestion(quizID, 5, Q5, A5);      
              	     	          rl.question("Press enter to publish the fifth prewritten answer...", async (response) => {
            			   	            await publishAnswer(quizID, 5, A5);
            			   	            rl.close()
          	            		    });
          	            	    });
        	                  });
                          });
                        });
                       });
                    });
                  });
                });
              });

    });
  }

