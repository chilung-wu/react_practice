// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Transcript is Ownable {
    struct Scores {
        uint math;
        uint science;
        uint literature;
        uint total;
    }

    // 將所需的引數傳遞給 Ownable 的建構子
    constructor(address initialOwner) Ownable(initialOwner){}
    // constructor(address msg.sender) Ownable(initialOwner) {};
    // constructor() Ownable() {}
    // constructor(address msg.sender,) {}

    mapping(address => Scores) private studentScores;
    mapping(address => bool) public students;

    function addStudent(address _student) public onlyOwner {
        students[_student] = true;
    }

    function updateScores(address _student, uint _math, uint _science, uint _literature) public onlyOwner {
        require(students[_student], "Student not registered");
        studentScores[_student] = Scores(_math, _science, _literature, _math + _science + _literature);
    }

    function viewScores(address _student) public view returns (Scores memory) {
        require(students[_student], "Student not registered");
        return studentScores[_student];
    }
}
