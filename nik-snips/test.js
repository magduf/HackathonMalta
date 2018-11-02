var mqtt = require('mqtt');
var HOST = '10.51.0.56';

let userBet = 1
const OS = require('os')
const http = require('http')
const DCWebapi = require('dc-webapi').default

// const platformId = OS.hostname()
const platformId = 'f355dff16f6e'
// const platformId = 'mysuperplatformid'

const dappManifest = require('./mydappconf/dapp.manifest.js')
const dappLogic = require('./mydappconf/dapp.logic.js')

const serverPort = process.env.serverPort || 7777
const playerPrivateKey = '0x89e1b52d6d26ee602f43af49d398e27b54efdd7df0dc783084b6055e76f9e7db'
const walletPass = 1234

/*
  Simple DappWrap )) class
 */
const Dapp = new class myDapp {
  async init (callback) {
    const webapi = await new DCWebapi({
      platformId: platformId,
      blockchainNetwork: 'ropsten'
    }).start()

    webapi.account.init(walletPass, playerPrivateKey)

    this.game = webapi.createGame({
      name: dappManifest.slug,
      contract: dappManifest.getContract(),
      rules: dappManifest.rules,
      gameLogicFunction: dappLogic
    })

    // this.game.on('webapi::status', data => {
    //   console.log('webapi::status', data)
    // })
  }

  async startGame (deposit = 10) {
    try {
      await this.game.start()
      return await this.game.connect({
        playerDeposit: deposit,
        gameData: [0, 0]
      })
    } catch (err) {
      console.error(err)
      console.warn(" ¯\_(ツ)_/¯ Can't connect, please repeat...")
    }
  }

  async play (userBet, userNum) {
    const result = await this.game.play({
      userBet: userBet,
      gameData: [userNum],
      rndOpts: [[1, 3]] // random from 1 to 3
    })

    return result
  }

  async endGame () {
    try {
      return await this.game.disconnect()
    } catch (err) {
      console.error(err)
      console.info('Disconnect result:', 'error')
    }
  }
}()




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
	//client.publish('hermes/tts/sayFinished');

	// Open Channel , find bankroller and send open TX with deposit
	console.log(`

	-------------------------------------------
	(⌐■_■) FIND BANKROLLER AND OPEN CHANNEL
	-------------------------------------------

	`)
	let userDeposit = 10
	await Dapp.startGame(userDeposit)



	var text = "The game is ready, tell your number";
	console.log(text);
	var payload = JSON.stringify({"text": text, "intentFilter": ["quizbox:Number", "quizbox:Ordinal", "quizbox:EndDice"], 'sessionId': parsedMessage.sessionId});
	client.publish('hermes/dialogueManager/continueSession', payload);
}

async function dicePlay(parsedMessage) {
	console.log(`

	-------------------------------
	  Start PLAY  (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
	-------------------------------

	`)
	var answer = parseInt(parsedMessage.slots[0].value.value);
	const res = await Dapp.play(userBet, answer)
	console.log('Play', res); console.log('\n\n\n')

	var text = "dice play, your number is "+answer+", winning number is ";
	var payload = JSON.stringify({"text": text, "intentFilter": ["quizbox:Number", "quizbox:Ordinal", "quizbox:EndDice"], 'sessionId': parsedMessage.sessionId});
	client.publish('hermes/dialogueManager/continueSession', payload);
}

async function diceEnd(parsedMessage) {
	console.log(`

	--------------------------
	  Close CHANNEL (▰˘◡˘▰)
	--------------------------

	`)
	const end = await Dapp.endGame(userBet * 0.5, 3)
	console.log('end game result:', end)

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

const init = async function () {
	console.log(`

	Init DApp

	ฅ^•ﻌ•^ฅ


	`)
	// Init dapp with logic and manifest
	// and init player account
	await Dapp.init()
}

init().then((result) => {console.log(result);});
