//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./QuizGame.sol";

contract QuizFactory {
    QuizGame[] public quizzes;
    event QuizCreated(QuizGame indexed quiz);

    constructor() payable {}

    function createQuiz(string memory question, bytes32 hashedAnswer)
        public
        payable
    {
        QuizGame quiz = new QuizGame{value: msg.value}(question, hashedAnswer);
        quizzes.push(quiz);
        emit QuizCreated(quiz);
    }

    function getQuizzes() public view returns (QuizGame[] memory) {
        return quizzes;
    }
}
