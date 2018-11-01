var mqtt = require('mqtt');
var HOST = '10.51.0.56';

var quizId = 0;
var quizQuestionIndex = 0;
var dice = false;


/**
 * @return integer quizId of the newly started quiz
 */
function quizStartTransaction() {
	return 1;
}

/**
 * @return string question text or null if there are no more questions
 */
function quizGetQuestion(quizId, quizQuestionIndex) {
	if(quizQuestionIndex > 4) return null;
	var questions = ["question one", "question two", "question three", "question four", "question five"];
	return questions[quizQuestionIndex];
}

/**
 * @return boolean whether the answer is correct or not
 */
function quizSubmitAnwer(quizId, quizQuestionIndex, answer) {
	return true;
}

/**
 * @return boolean wheter the user won or not
 */
function quizEndTransaction(quizId) {
	return true;
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

async function diceStart(parsedMessage) {
	dice = true;
	var text = "Starting the game, please wait";
	var payload = JSON.stringify({'text': text, 'siteId': 'default', 'sessionId': parsedMessage.sessionId});
	client.publish('hermes/tts/say', payload);
	client.publish('hermes/tts/sayFinished');
	await sleep();
	var text = "The game is ready, tell your number";
	console.log(text);
	var payload = JSON.stringify({"text": text, "intentFilter": ["quizbox:Number", "quizbox:Ordinal", "quizbox:EndDice"], 'sessionId': parsedMessage.sessionId});
	client.publish('hermes/dialogueManager/continueSession', payload);
}

async function dicePlay(parsedMessage) {
	var text = "dice play";
	var payload = JSON.stringify({"text": text, "intentFilter": ["quizbox:Number", "quizbox:Ordinal", "quizbox:EndDice"], 'sessionId': parsedMessage.sessionId});
	client.publish('hermes/dialogueManager/continueSession', payload);
}

async function diceEnd(parsedMessage) {
	dice = false;
	var text = "Finishing the game";
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
	if (topic == 'hermes/intent/quizbox:StartDice') {
		diceStart(JSON.parse(message)).then((result) => {console.log(result);});
	}
	if (topic == 'hermes/intent/quizbox:Number') {
		if(quizId != 0) quizProcessAnswer(JSON.parse(message));
		else if(dice) dicePlay(JSON.parse(message)).then((result) => {console.log(result);});
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
	if (topic == 'hermes/intent/quizbox:EndDice') {
		diceEnd(JSON.parse(message)).then((result) => {console.log(result);});
	}

});

function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
  }, 10000);
  });
}
