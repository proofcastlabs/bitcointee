// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Verify is Ownable {
  event Step(bytes);
  event NewTeeSigner(bytes, bytes);

  address public teeAddress;
  bytes public lastBlockHash;
  bytes public attestation;

  constructor(bytes memory genesisBlockHash)
    Ownable(msg.sender) {

    lastBlockHash = genesisBlockHash;
  }

  function setTeeSigner(bytes calldata pubKey, bytes memory attestation_) public onlyOwner {
    teeAddress = _getAddressFromPublicKey(pubKey);
    attestation = attestation_;

    emit NewTeeSigner(pubKey, attestation);
  }

  function step(bytes calldata statement, bytes calldata signature) public {
    require(statement.length == 128, "Invalid statement");
    require(teeAddress != address(0), "Invalid tee address");

    bytes calldata firstBlock = statement[:64];
    bytes calldata lastBlock = statement[64:];

    require(keccak256(firstBlock) == keccak256(lastBlockHash), "Invalid first block");
    require(ECDSA.recover(sha256(statement), signature) == teeAddress, "Invalid signature");

    lastBlockHash = lastBlock;

    emit Step(lastBlockHash);
  }

  function _getAddressFromPublicKey(bytes calldata pubKey) internal pure returns (address) {
    return address(uint160(uint256(keccak256(pubKey[1:]))));
  }
}
