import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ZamaAI, ZamaAI__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture(bot: string, response: string) {
  const factory = (await ethers.getContractFactory("ZamaAI")) as ZamaAI__factory;
  const contract = (await factory.deploy(bot, response)) as ZamaAI;
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  return { contract, address };
}

describe("ZamaAI", function () {
  let signers: Signers;
  let zamaAI: ZamaAI;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("Skipping tests outside mock FHEVM environment");
      this.skip();
    }

    ({ contract: zamaAI, address: contractAddress } = await deployFixture(
      signers.bob.address,
      signers.deployer.address,
    ));
  });

  it("stores metadata when submitting a message", async function () {
    const ciphertext = "0xdeadbeef";
    const modelId = 3;
    const encryptionKey = ethers.Wallet.createRandom().address;

    const encryptedKey = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(encryptionKey)
      .encrypt();

    const tx = await zamaAI
      .connect(signers.alice)
      .submitMessage(ciphertext, encryptedKey.handles[0], encryptedKey.inputProof, modelId);
    await tx.wait();

    const total = await zamaAI.totalMessages();
    expect(total).to.eq(1n);

    const message = await zamaAI.getMessage(0);
    expect(message[0]).to.eq(signers.alice.address);
    expect(message[1]).to.eq(ciphertext);
    expect(message[2]).to.not.eq(ethers.ZeroHash);
    expect(message[3]).to.eq(BigInt(modelId));
    expect(message[4]).to.be.gt(0n);

    const userIds = await zamaAI.getUserMessageIds(signers.alice.address);
    expect(userIds.length).to.eq(1);
    expect(userIds[0]).to.eq(0n);
  });

  it("returns the same encrypted response for the message owner", async function () {
    const ciphertext = "0x1234";
    const keyAddress = ethers.Wallet.createRandom().address;

    const encryptedKey = await fhevm
      .createEncryptedInput(contractAddress, signers.alice.address)
      .addAddress(keyAddress)
      .encrypt();

    const tx = await zamaAI
      .connect(signers.alice)
      .submitMessage(ciphertext, encryptedKey.handles[0], encryptedKey.inputProof, 1);
    await tx.wait();

    const preview = await zamaAI.connect(signers.alice).requestResponse.staticCall(0);

    const responseTx = await zamaAI.connect(signers.alice).requestResponse(0);
    await responseTx.wait();

    const previewAgain = await zamaAI.connect(signers.alice).requestResponse.staticCall(0);

    expect(previewAgain).to.eq(preview);

    await expect(zamaAI.connect(signers.bob).requestResponse(0)).to.be.revertedWith("Unauthorized");
  });

  it("allows only the owner to update configuration", async function () {
    await expect(zamaAI.connect(signers.alice).updateBotAddress(signers.alice.address)).to.be.revertedWith(
      "Not owner",
    );

    await expect(
      zamaAI.connect(signers.alice).updateResponsePlainAddress(signers.alice.address),
    ).to.be.revertedWith("Not owner");

    await expect(zamaAI.connect(signers.alice).transferOwnership(signers.alice.address)).to.be.revertedWith(
      "Not owner",
    );

    await zamaAI.connect(signers.deployer).updateBotAddress(signers.alice.address);
    expect(await zamaAI.botAddress()).to.eq(signers.alice.address);

    await zamaAI.connect(signers.deployer).updateResponsePlainAddress(signers.bob.address);
    expect(await zamaAI.responsePlainAddress()).to.eq(signers.bob.address);

    await zamaAI.connect(signers.deployer).transferOwnership(signers.alice.address);
    expect(await zamaAI.owner()).to.eq(signers.alice.address);

    await expect(zamaAI.connect(signers.deployer).updateBotAddress(signers.deployer.address)).to.be.revertedWith(
      "Not owner",
    );
  });
});
