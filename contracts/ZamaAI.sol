// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, externalEaddress} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ZamaAI is ZamaEthereumConfig {
    struct Message {
        address user;
        string encryptedMessage;
        eaddress encryptedAddress;
        uint256 modelId;
        uint256 timestamp;
    }

    address public owner;
    address public botAddress;
    address public responsePlainAddress;

    Message[] private messages;
    mapping(address => uint256[]) private userMessages;

    event MessageSubmitted(uint256 indexed messageId, address indexed user, uint256 modelId, string ciphertext);
    event ResponseRequested(uint256 indexed messageId, address indexed user);
    event BotAddressUpdated(address indexed newBotAddress);
    event ResponseAddressUpdated(address indexed newPlainAddress);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address initialBotAddress, address plainResponseAddress) {
        require(initialBotAddress != address(0), "Invalid bot");
        require(plainResponseAddress != address(0), "Invalid response");

        owner = msg.sender;
        botAddress = initialBotAddress;
        responsePlainAddress = plainResponseAddress;

        emit OwnershipTransferred(address(0), msg.sender);
        emit BotAddressUpdated(initialBotAddress);
        emit ResponseAddressUpdated(plainResponseAddress);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function updateBotAddress(address newBotAddress) external onlyOwner {
        require(newBotAddress != address(0), "Invalid bot");

        botAddress = newBotAddress;

        emit BotAddressUpdated(newBotAddress);
    }

    function updateResponsePlainAddress(address newPlainResponseAddress) external onlyOwner {
        require(newPlainResponseAddress != address(0), "Invalid response");

        responsePlainAddress = newPlainResponseAddress;

        emit ResponseAddressUpdated(newPlainResponseAddress);
    }

    function submitMessage(
        string calldata encryptedMessage,
        externalEaddress encryptedAddressHandle,
        bytes calldata inputProof,
        uint256 modelId
    ) external returns (uint256) {
        require(bytes(encryptedMessage).length > 0, "Empty message");

        eaddress encryptedAddress = FHE.fromExternal(encryptedAddressHandle, inputProof);

        uint256 messageId = messages.length;
        Message storage storedMessage = messages.push();
        storedMessage.user = msg.sender;
        storedMessage.encryptedMessage = encryptedMessage;
        storedMessage.encryptedAddress = encryptedAddress;
        storedMessage.modelId = modelId;
        storedMessage.timestamp = block.timestamp;

        userMessages[msg.sender].push(messageId);

        FHE.allowThis(encryptedAddress);
        FHE.allow(encryptedAddress, msg.sender);
        FHE.allow(encryptedAddress, botAddress);

        emit MessageSubmitted(messageId, msg.sender, modelId, encryptedMessage);

        return messageId;
    }

    function requestResponse(uint256 messageId) external returns (eaddress) {
        require(messageId < messages.length, "Invalid message");

        Message storage storedMessage = messages[messageId];
        require(storedMessage.user == msg.sender, "Unauthorized");

        eaddress responseAddress = FHE.asEaddress(responsePlainAddress);

        FHE.allowThis(responseAddress);
        FHE.allow(responseAddress, botAddress);
        FHE.allow(responseAddress, msg.sender);

        emit ResponseRequested(messageId, msg.sender);

        return responseAddress;
    }

    function totalMessages() external view returns (uint256) {
        return messages.length;
    }

    function getUserMessageIds(address user) external view returns (uint256[] memory) {
        return userMessages[user];
    }

    function getMessage(uint256 messageId)
        external
        view
        returns (address, string memory, eaddress, uint256, uint256)
    {
        require(messageId < messages.length, "Invalid message");

        Message storage storedMessage = messages[messageId];
        return (
            storedMessage.user,
            storedMessage.encryptedMessage,
            storedMessage.encryptedAddress,
            storedMessage.modelId,
            storedMessage.timestamp
        );
    }
}
