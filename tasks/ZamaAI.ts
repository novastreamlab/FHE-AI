import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:address", "Prints the ZamaAI contract address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const deployment = await hre.deployments.get("ZamaAI");
  console.log(`ZamaAI address is ${deployment.address}`);
});

task("task:total-messages", "Reads total message count from ZamaAI")
  .addOptionalParam("contract", "Optional ZamaAI contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { contract: contractAddressFromArgs } = taskArguments;
    const deployment = contractAddressFromArgs
      ? { address: contractAddressFromArgs }
      : await hre.deployments.get("ZamaAI");

    const zamaAI = await hre.ethers.getContractAt("ZamaAI", deployment.address);
    const total = await zamaAI.totalMessages();
    console.log(`ZamaAI(${deployment.address}) total messages: ${total}`);
  });

task("task:submit-message", "Submits an encrypted message to ZamaAI")
  .addParam("ciphertext", "Ciphertext produced client-side")
  .addParam("key", "Plain address used for XOR encryption")
  .addParam("model", "Numeric identifier of the AI model")
  .addOptionalParam("contract", "Optional ZamaAI contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const modelId = parseInt(taskArguments.model, 10);
    if (!Number.isInteger(modelId) || modelId < 0) {
      throw new Error("--model must be a non-negative integer");
    }

    const { ciphertext, key } = taskArguments;
    if (!hre.ethers.isAddress(key)) {
      throw new Error("--key must be a valid address");
    }

    await hre.fhevm.initializeCLIApi();

    const deployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await hre.deployments.get("ZamaAI");

    const signers = await hre.ethers.getSigners();
    const encryptedKey = await hre.fhevm
      .createEncryptedInput(deployment.address, signers[0].address)
      .addAddress(key)
      .encrypt();

    const zamaAI = await hre.ethers.getContractAt("ZamaAI", deployment.address);

    const tx = await zamaAI
      .connect(signers[0])
      .submitMessage(ciphertext, encryptedKey.handles[0], encryptedKey.inputProof, modelId);
    console.log(`Submit tx: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Status: ${receipt?.status}`);
  });

task("task:get-message", "Reads message details")
  .addParam("id", "Message identifier")
  .addOptionalParam("contract", "Optional ZamaAI contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const messageId = parseInt(taskArguments.id, 10);
    if (!Number.isInteger(messageId) || messageId < 0) {
      throw new Error("--id must be a non-negative integer");
    }

    const deployment = taskArguments.contract
      ? { address: taskArguments.contract }
      : await hre.deployments.get("ZamaAI");

    const zamaAI = await hre.ethers.getContractAt("ZamaAI", deployment.address);
    const message = await zamaAI.getMessage(messageId);

    console.log(`Message ${messageId} data:`);
    console.log(`  user: ${message[0]}`);
    console.log(`  ciphertext: ${message[1]}`);
    console.log(`  encrypted key handle: ${message[2]}`);
    console.log(`  model id: ${message[3]}`);
    console.log(`  timestamp: ${message[4]}`);
  });
