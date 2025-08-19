//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Test{
    constructor(bytes memory signature) {
        address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(keccak256("wee")),signature);
        console.log(recovered);
    }
}