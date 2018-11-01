var mqtt = require('mqtt');
var HOST = '10.51.0.56';
//var HOST = 'localhost';

var client  = mqtt.connect('mqtt://' + HOST, { port: 1883 });

var quiz = false;

function startQuiz(parsedMessage) {
	quiz = true;
	var text = "Starting a quiz. The first question is: what's 5 x 9 ?";
	var payload = JSON.stringify({"text": text,"intentFilter": ["nikitatikh:Number"], 'sessionId': parsedMessage.sessionId});
	client.publish('hermes/dialogueManager/continueSession', payload);
}

function quizAnswerNumber(parsedMessage) {
	if(!quiz) {
		client.publish('hermes/tts/sayFinished');
		return;
	}
	console.log("Num: " + parsedMessage.slots[0].value.value);
	if(parseInt(parsedMessage.slots[0].value.value) == 2018) {
		var text = "Your ansfer is: "+parsedMessage.slots[0].value.value+". Thank you for taking the quiz, you won ten billion dollars !";
		var payload = JSON.stringify({'text': text, 'siteId': 'default', 'sessionId': parsedMessage.sessionId});
		client.publish('hermes/tts/say', payload);
		client.publish('hermes/tts/sayFinished');
		quiz = false;
	} else {
		var text = "Your ansfer is: "+parsedMessage.slots[0].value.value+". The next question is: what year it is now ?";
		var payload = JSON.stringify({"text": text,"intentFilter": ["nikitatikh:Number"], 'sessionId': parsedMessage.sessionId});
		client.publish('hermes/dialogueManager/continueSession', payload);
	}
}

client.on('connect', function () {
	console.log("Connected to " + HOST);
	client.subscribe('hermes/hotword/default/detected');
	client.subscribe('hermes/intent/nikitatikh:StartQuiz');
	client.subscribe('hermes/intent/nikitatikh:Number');
});

client.on('message', function (topic, message) {
	console.log("Topic " + topic);
	console.log("Message: " + message);
	if (topic == 'hermes/intent/nikitatikh:StartQuiz') {
		startQuiz(JSON.parse(message));
	}
	if (topic == 'hermes/intent/nikitatikh:Number') {
		quizAnswerNumber(JSON.parse(message));
	}
});
