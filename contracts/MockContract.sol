//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface CallInterface {
    function guess(string memory answer) external;
}

contract MockContract {
    function callOtherContract(address _target, string memory _answer) public {
        CallInterface(_target).guess(_answer);
    }

    fallback() external payable {
        revert("Fallback revert");
    }

    receive() external payable {
        revert("Receive revert");
    }
}
