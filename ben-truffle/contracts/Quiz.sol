pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';


contract Quiz is ERC721 {
    //An ERC-721 implemention of a Quiz that pays out real money to players.

    uint idCounter = 1;

    mapping (uint256 => uint256) pots; // The total pot for each quiz ID
    mapping (uint256 => uint256) totalsPaidOut;
    mapping (uint256 => uint256) prizes;
    mapping (uint256 => mapping (uint256 => bytes32)) encryptedAnswers; //tokenID=>questionNumber=>encryptedAnswer
    mapping (uint256 => mapping (address => mapping (uint8 => uint8))) scorecards; //tokenID=>player=>questionNumber=>right/wrong (0=noanswer, 1=right, 2=wrong)



    event QuestionPosted(uint tokenID, uint8 questionNumber, string question);
    event AnswerPosted(uint tokenID, uint8 questionNumber, string answer);
    event QuizCreated(uint tokenID);
    event debug(bytes32 message);

    function createQuiz (uint _prize) payable {
        _mint(msg.sender, idCounter);
        pots[idCounter] = msg.value;
        prizes[idCounter] = _prize; //pay out a finite prize for each participant. TODO implement pot splitting.
        QuizCreated(idCounter);
        idCounter = idCounter + 1;
    }


    function depositToGateway(address gatewayAddress, uint256 tokenID) public {
        safeTransferFrom(msg.sender, gatewayAddress, tokenID);
    }

    function postQuestion(uint tokenID, uint8 questionNumber, string question, bytes32 encryptedAnswer) {    
        require(msg.sender == ownerOf(tokenID));
        encryptedAnswers[tokenID][questionNumber] = encryptedAnswer;
        QuestionPosted(tokenID, questionNumber, question);

    }

    event RightAnswer(address player, uint tokenID, uint questionNumber);
    event WrongAnswer(address player, uint tokenID, uint questionNumber);

    function submitGuess(uint tokenID, uint8 questionNumber, string guess) returns (bool){
        //TODO implement protection for users to stop them from submitting if there are already more players than the pot can support.
        require(scorecards[tokenID][msg.sender][questionNumber] == 0);
        if (keccak256(guess) == encryptedAnswers[tokenID][questionNumber]) {
            scorecards[tokenID][msg.sender][questionNumber] = 1;
            RightAnswer(msg.sender, tokenID, questionNumber);
        }

        else {
            scorecards[tokenID][msg.sender][questionNumber] = 2;
            WrongAnswer(msg.sender, tokenID, questionNumber);
        }

    }


    function postAnswer(uint tokenID, uint8 questionNumber, string answer) {
      require(msg.sender == ownerOf(tokenID));
      require(keccak256(answer) == encryptedAnswers[tokenID][questionNumber]);
      AnswerPosted(tokenID, questionNumber, answer);
    }

    event WINNER(address player, uint payout);

    function payMe(uint tokenID) {
        for (uint8 question = 1; question <= 5; question++) {
            require(scorecards[tokenID][msg.sender][question] == 1);
        }
        require(totalsPaidOut[tokenID] + prizes[tokenID] <= pots[tokenID]);
        WINNER(msg.sender, prizes[tokenID]);
        msg.sender.transfer(prizes[tokenID]);
    }


    function depositToGateway(address _gateway, uint256 _uid) public {
      safeTransferFrom(msg.)
    }


}
