// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./employee.sol";

contract ManagementContract {
    address public manager;
    mapping(address => EmployeeContract) public employeeContracts;

    event EmployeeContractCreated(address employee, address contractAddress);
    event EmployeeContractRemoved(address employee);

    modifier onlyManager() {
        require(msg.sender == manager, "Not authorized");
        _;
    }

    constructor() {
        manager = msg.sender;
    }

    function createEmployeeContract(address _employee) public onlyManager {
        require(address(employeeContracts[_employee]) == address(0), "Contract already exists");

        EmployeeContract newContract = new EmployeeContract(_employee);
        employeeContracts[_employee] = newContract;
        emit EmployeeContractCreated(_employee, address(newContract));
    }

    function removeEmployeeContract(address _employee) public onlyManager {
        require(address(employeeContracts[_employee]) != address(0), "Contract does not exist");

        delete employeeContracts[_employee];
        emit EmployeeContractRemoved(_employee);
    }

    function getEmployeeContractAddress(address _employee) public view returns (address) {
        return address(employeeContracts[_employee]);
    }

    function isTaskCompleted(address _employee) public view returns (bool) {
        require(address(employeeContracts[_employee]) != address(0), "Contract does not exist");

        return employeeContracts[_employee].taskCompleted();
    }
}
