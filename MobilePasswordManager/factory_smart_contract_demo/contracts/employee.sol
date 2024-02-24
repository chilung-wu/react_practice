// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeContract {
    address public employee;
    bool public taskCompleted;

    modifier onlyEmployee() {
        require(msg.sender == employee, "Not authorized");
        _;
    }

    constructor(address _employee) {
        employee = _employee;
        taskCompleted = false; // Initialize task as not completed
    }

    // Function to mark a task as completed
    function doSomething() public onlyEmployee {
        taskCompleted = true;
        // Additional logic can be added here
        // For example, emitting an event to notify the system of the task completion
        emit TaskCompleted(employee, block.timestamp);
    }

    // Event declaration for task completion
    event TaskCompleted(address employee, uint256 timestamp);
}
