import { expect } from "chai";
import { loadFixture } from "ethereum-waffle";
import { ethers } from "hardhat";

describe("QuizFactory", function () {
  async function deployQuizFactoryFixture() {
    const salt = "this is my salt";
    const question = "Who is the co-founder of Ethereum";
    const answer = "Vitalik Buterin";

    const hashedAnswer = ethers.utils.keccak256(
      ethers.utils.solidityPack(["string", "string"], [salt, answer])
    );

    const [owner] = await ethers.getSigners();

    const QuizFactory = await ethers.getContractFactory("QuizFactory");
    const gameFactory = await QuizFactory.deploy();

    return { gameFactory, owner, hashedAnswer, question };
  }

  describe("Quiz Factory Deployment & usage", function () {
    it("Should deploy game factory contract", async function () {
      const { gameFactory } = await loadFixture(deployQuizFactoryFixture);

      expect(gameFactory.address).to.not.equal(ethers.constants.AddressZero);
    });

    it("Should deploy game factory contract", async function () {
      const { gameFactory } = await loadFixture(deployQuizFactoryFixture);

      const quizzes = await gameFactory.getQuizzes();
      expect(quizzes.length).to.be.equal(0);
    });

    it("Should deploy game quiz contract", async function () {
      const { gameFactory, question, hashedAnswer } = await loadFixture(
        deployQuizFactoryFixture
      );

      await expect(gameFactory.createQuiz(question, hashedAnswer)).not.be
        .reverted;

      await expect(gameFactory.quizzes(0)).to.not.equal(
        ethers.constants.AddressZero
      );
    });
  });
});
