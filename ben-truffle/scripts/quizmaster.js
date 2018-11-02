function encrypt(data){
	return "0x" + keccak256(data)
}



const Q1 = "Dao casino is best suited for developing which of the following  1 Monopoly 2 Dice 3 Hangman or 4 Clue"
const Q2 = "To create rapid and exciting experiences Dao uses which of the following 1 multiple subchaining 2 centralized server 3 blocks only for start and stop records or 4 gatekeeper to local subchain"
const Q3 = "In case of dispute failure to provide evidence during the temporary window (n blocks) results in 1 escalation to off-chain dispute resolution 2 game end in favor of bank roller 3 game end in favor of player 4 game end in favor of deceived party"
const Q4 = "DAO stands for 1 developers affiliates casino operators 2 distributed-agreement-oracle 3 direct-affiliate-online gaming 4 Russian Da(Yes!)-Online."
const Q5 = "Dao.Casino General Game Session Life-Cycle selects the available bankroller 1 with the largest balance 2 with first response 3 based on queue 4 hardcoded into configuration"

const A1 = "2"
const A2 = "1"
const A3 = "4"
const A4 = "1"
const A5 = "1"

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
      console.log("Quiz Token ID is " + quizID)


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


    const quizGetQuestion = function(quizId, quizQuestionIndex) {
        return new Promise(function(resolve, reject) {
            watchQuestions = QUIZ.QuestionPosted({},{fromBlock: 0, toBlock: 'latest'}).watch(async function(error, result) {
  
                if (((String(result.args.tokenID) == String(quizId)) && (String(result.args.questionNumber) == String(quizQuestionIndex + 1)))) {
                    console.log("Quizmaster has published question #" + (quizQuestionIndex + 1))
                    console.log(result.args.question)
                    resolve(result.args.question)
                }
          });        
        });
      };

      rl.question("Press enter to publish the first prewritten question...", async (response) => {
        await publishQuestion(quizID, 1, Q1, A1);
        response = await quizGetQuestion(quizID, 0)
        console.log(response)
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

