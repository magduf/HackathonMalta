
//create a callback for truffle
module.exports = function(callback) {

    //player's address on the Ethereum blockchain
    playerAddress = "0xf17f52151ebef6c7334fad080c5704d77216b732";
    var readline = require('readline');

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

	var mqtt = require('mqtt');
	var HOST = '10.51.0.56';

	  contract.deployed().then(async function(QUIZ) {

		var quizId = 0;
		var quizQuestionIndex = 0;


		/**
		 * @return integer quizId of the newly started quiz
		 */
		function quizStartTransaction() { 
            var Q_ID;
			console.log("Welcome to Quizbox.");

			var rl = readline.createInterface({
    			input: process.stdin,
    			output: process.stdout
    		});
            
            rl.question("Please enter the ID of the Quiz you'd like to participate in: ", (response) => {
            	Q_ID = response.toNumber();
            	rl.close()
            	return Q_ID;
            });


		}

		/**
		 * @return string question text or null if there are no more questions
		 */
    const quizGetQuestion = function(quizId, quizQuestionIndex) {
        return new Promise(function(resolve, reject) {
            watchQuestions = QUIZ.QuestionPosted({},{fromBlock: 0, toBlock: 'latest'}).watch(async function(error, result) {
  
                if (((String(result.args.tokenID) == String(quizId)) && (String(result.args.questionNumber) == String(quizQuestionIndex + 1))) {
                    console.log("Quizmaster has published question #" + (quizQuestionIndex + 1))
                    console.log(result.args.question)
                    resolve(result.args.question)
                }
          });        
        });
      };

		/**
		 * @return boolean whether the answer is correct or not
		 */
		async function quizSubmitAnswer(quizId, quizQuestionIndex, answer) {    
            response = await QUIZ.submitGuess(quizId, quizQuestionIndex + 1, answer, {from: playerAccount});
            console.log(JSON.stringify(response))
            if (response.logs[0].event == "RightAnswer") {
            	console.log("That's right.");
            	return true;
            }
            if (response.logs[0].event == "WrongAnswer") {
            	console.log("That's wrong.");
            	return false;
            }
		}



	    /**
	     * @return boolean wheter the user won or not
	     */
	    async function quizEndTransaction(quizId) {
	          response = await QUIZ.payMe(quizId, {from: playerAccount})
	          if (response.logs[0].event == "WINNER") {
	              console.log("YOU WON.");
	              return true;
	          }
	          else {
	              console.log("You didn't win.");
	              return false;
	          }
	    }

		function quizStart(parsedMessage) {
			quizId = quizStartTransaction();
			quizQuestionIndex = 0;
			var question = quizGetQuestion(quizId, quizQuestionIndex);
			var text = "Starting a quiz. The first question is " + question;
			var payload = JSON.stringify({"text": text, "intentFilter": ["quizbox:Number", "quizbox:Ordinal", "quizbox:Letter", "quizbox:EndQuiz"], 'sessionId': parsedMessage.sessionId});
			client.publish('hermes/dialogueManager/continueSession', payload);
		}

		function quizProcessAnswer(parsedMessage) {
			var answer = parsedMessage.slots[0].value.value;
			var correct = quizSubmitAnwer(quizId, quizQuestionIndex, answer);
			var text = "Your ansfer is: "+answer +". Your answer is "+(correct?"correct. ":"not correct. ");
			quizQuestionIndex++;
			var question = quizGetQuestion(quizId, quizQuestionIndex);
			if(question) {
				text += "The next question is "+ question;
				var payload = JSON.stringify({"text": text, "intentFilter": ["quizbox:Number", "quizbox:Ordinal", "quizbox:Letter", "quizbox:EndQuiz"], 'sessionId': parsedMessage.sessionId});
				client.publish('hermes/dialogueManager/continueSession', payload);
			} else {
				var win = quizEndTransaction(quizId);
				quizId = 0;
				text += win ? "Congratulations, you won the quiz." : "Unfortunately you loose the quiz.";
				var payload = JSON.stringify({'text': text, 'siteId': 'default', 'sessionId': parsedMessage.sessionId});
				client.publish('hermes/tts/say', payload);
				client.publish('hermes/tts/sayFinished');
			}
		}

		function quizEnd(parsedMessage) {
			var win = quizEndTransaction(quizId);
			quizId = 0;
			var text = win ? "Congratulations, you won the quiz." : "Unfortunately you loose the quiz.";
			var payload = JSON.stringify({'text': text, 'siteId': 'default', 'sessionId': parsedMessage.sessionId});
			client.publish('hermes/tts/say', payload);
			client.publish('hermes/tts/sayFinished');
		}


		
		var client  = mqtt.connect('mqtt://' + HOST, { port: 1883 });

		client.on('connect', function () {
			console.log("Connected to " + HOST);
			client.subscribe('hermes/hotword/default/detected');
			client.subscribe('hermes/intent/quizbox:StartQuiz');
			client.subscribe('hermes/intent/quizbox:EndQuiz');
			client.subscribe('hermes/intent/quizbox:StartDice');
			client.subscribe('hermes/intent/quizbox:EndDice');
			client.subscribe('hermes/intent/quizbox:Number');
			client.subscribe('hermes/intent/quizbox:Ordinal');
			client.subscribe('hermes/intent/quizbox:Letter');
		});

		client.on('message', function (topic, message) {
			console.log("Topic " + topic);
			console.log("Message: " + message);
			if (topic == 'hermes/intent/quizbox:StartQuiz') {
				quizStart(JSON.parse(message));
			}
			if (topic == 'hermes/intent/quizbox:Number') {
				if(quizId != 0) quizProcessAnswer(JSON.parse(message));
				else client.publish('hermes/tts/sayFinished');
			}
			if (topic == 'hermes/intent/quizbox:Ordinal') {
				if(quizId != 0) quizProcessAnswer(JSON.parse(message));
				else client.publish('hermes/tts/sayFinished');
			}
			if (topic == 'hermes/intent/quizbox:Letter') {
				if(quizId != 0) quizProcessAnswer(JSON.parse(message));
				else client.publish('hermes/tts/sayFinished');
			}
			if (topic == 'hermes/intent/quizbox:EndQuiz') {
				if(quizId != 0) quizEnd(JSON.parse(message));
				else client.publish('hermes/tts/sayFinished');
			} 

});
