let Quiz = artifacts.require("Quiz");

let expect = require('expect');
let BigNumber = require('bignumber.js');
let BN = require('bn.js');
keccak256 = require('js-sha3').keccak256;


function numStringToBytes32(num) { 
    var bn = new BN(num).toTwos(256);
   return padToBytes32(bn.toString(16));
}


function bytes32ToNumString(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
}


function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function encrypt(data){
	return "0x" + keccak256(data)
}

ten_eth = 10000000000000000000;
one_eth = 1000000000000000000;




contract('Quiz', function(accounts) {

    quizmaster = accounts[1]
    player1 = accounts[2]
    player2 = accounts[3]

    it("should test the quiz", async function() {
        this.timeout(7000000)
        let QUIZ = await Quiz.deployed();
        response = await QUIZ.createQuiz(one_eth, {from: quizmaster, value: ten_eth});
        QUIZID = response.logs[0].args.tokenId.toNumber()
        assert.equal(QUIZID, 1)
 
        response = await QUIZ.postQuestion(QUIZID, 1, "What color is the sky?", encrypt("blue"), {from: quizmaster})

        response = await QUIZ.submitGuess(1, 1, "blue", {from: player1})
        console.log(JSON.stringify(response))

        response = await QUIZ.submitGuess(1, 1, "red", {from: player2})
        console.log(JSON.stringify(response))

        response = await QUIZ.postAnswer(1, 1, "blue", {from: quizmaster})

        response = await QUIZ.postQuestion(QUIZID, 2, "What is five plus two?", encrypt("seven"), {from: quizmaster})
        response = await QUIZ.submitGuess(1, 2, "seven", {from: player1})
        response = await QUIZ.postQuestion(QUIZID, 3, "What is two plus two?", encrypt("four"), {from: quizmaster})
        response = await QUIZ.submitGuess(1, 3, "four", {from: player1})
        response = await QUIZ.postQuestion(QUIZID, 4, "What is two plus one?", encrypt("three"), {from: quizmaster})
        response = await QUIZ.submitGuess(1, 4, "three", {from: player1})        
        response = await QUIZ.postQuestion(QUIZID, 5, "What is two minus one?", encrypt("one"), {from: quizmaster})
        response = await QUIZ.submitGuess(1, 5, "one", {from: player1})        

        response = await QUIZ.payMe(1, {from: player1})
        response = await QUIZ.payMe(1, {from: player2})

        await QUIZ.revert();

    });
});


