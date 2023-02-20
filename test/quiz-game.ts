import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { ethers } from "hardhat";

describe("QuizGame", function () {
  async function deployQuizGameFixture() {
    const ONE_GWEI = 1_000_000_000; // 1 ETH
    const amount = ONE_GWEI;
    const salt = "this is my salt";
    const question = "Who is the co-founder of Ethereum";
    const answer = "Vitalik Buterin";

    const hashedAnswer = ethers.utils.keccak256(
      ethers.utils.solidityPack(["string", "string"], [salt, answer])
    );

    const [owner] = await ethers.getSigners();

    const QuizGame = await ethers.getContractFactory("QuizGame");
    const quizGameContract = await QuizGame.deploy(question, hashedAnswer);

    return { quizGameContract, owner, amount, question, answer };
  }

  async function deployMockFixture() {
    const question = "Who is the co-founder of Ethereum";
    const answer = "Vitalik Buterin";

    const MockContract = await ethers.getContractFactory("MockContract");
    const mockcontract = await MockContract.deploy();

    return { mockcontract, question, answer };
  }

  describe("Quiz Game Deployment & usage", function () {
    it("Should deploy game quiz contract", async function () {
      const { quizGameContract } = await loadFixture(deployQuizGameFixture);

      expect(quizGameContract.address).to.not.equal(
        ethers.constants.AddressZero
      );
    });

    it("Should set the question correctly", async function () {
      const { quizGameContract, question } = await loadFixture(
        deployQuizGameFixture
      );

      expect(await quizGameContract.question()).to.be.equal(question);
    });

    it("Should receive ether and increase ballance", async function () {
      const { quizGameContract, owner, amount } = await loadFixture(
        deployQuizGameFixture
      );

      await owner.sendTransaction({
        to: quizGameContract.address,
        value: amount,
      });

      expect(await quizGameContract.getBalance()).to.equal(amount);
    });

    it("Should receive ether and emit event receive", async function () {
      const { quizGameContract, owner, amount } = await loadFixture(
        deployQuizGameFixture
      );

      await expect(
        owner.sendTransaction({
          to: quizGameContract.address,
          value: amount,
        })
      )
        .to.emit(quizGameContract, "QuizContractFunded")
        .withArgs("receive", amount, owner.address);
    });

    it("Should receive ether and emit event fallback", async function () {
      const { quizGameContract, owner, amount } = await loadFixture(
        deployQuizGameFixture
      );

      await expect(
        owner.sendTransaction({
          data: "0x123123123123",
          to: quizGameContract.address,
          value: amount,
        })
      )
        .to.emit(quizGameContract, "QuizContractFunded")
        .withArgs("fallback", amount, owner.address);
    });

    it("Should guess the right answer and receive the funds", async function () {
      const { quizGameContract, owner, amount, answer } = await loadFixture(
        deployQuizGameFixture
      );

      await owner.sendTransaction({
        to: quizGameContract.address,
        value: amount,
      });

      await expect(quizGameContract.guess(answer)).not.to.be.reverted;
      expect(
        await ethers.provider.getBalance(quizGameContract.address)
      ).to.be.equal(0);
    });

    it("Should guess the right answer but not receiving funds", async function () {
      const { quizGameContract, answer } = await loadFixture(
        deployQuizGameFixture
      );

      await expect(quizGameContract.guess(answer)).not.to.be.reverted;
    });

    it("Should revert on guessing the wrong answer", async function () {
      const { quizGameContract } = await loadFixture(deployQuizGameFixture);

      await expect(
        quizGameContract.guess("Vitalik Buterin1")
      ).to.be.revertedWith("Wrong answer");
    });

    it("Should revert on try to send ether with call", async function () {
      const { quizGameContract, owner, amount } = await loadFixture(
        deployQuizGameFixture
      );
      owner.sendTransaction({
        to: quizGameContract.address,
        value: amount,
      });

      const { mockcontract, answer } = await loadFixture(deployMockFixture);

      await expect(
        mockcontract.callOtherContract(quizGameContract.address, answer)
      ).to.be.revertedWith("Sending funds failed");
    });
  });
});
