//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract QuizGame {
    string public question;
    bytes32 hashedAnswer;
    string salt = "this is my salt";

    event QuizContractFunded(string method, uint256 amount, address sender);
    event AnswerGuessed(address sender, string answer);

    constructor(string memory _question, bytes32 _hashedAnswer) payable {
        question = _question;
        hashedAnswer = _hashedAnswer;
    }

    function guess(string memory answer) public {
        require(
            keccak256(abi.encodePacked(salt, answer)) == hashedAnswer,
            "Wrong answer"
        );
        if (address(this).balance > 0) {
            emit AnswerGuessed(msg.sender, answer);
            (bool sent, ) = payable(msg.sender).call{
                value: address(this).balance
            }("");
            require(sent, "Sending funds failed");
        }
    }

    fallback() external payable {
        emit QuizContractFunded("fallback", msg.value, msg.sender);
    }

    receive() external payable {
        emit QuizContractFunded("receive", msg.value, msg.sender);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
