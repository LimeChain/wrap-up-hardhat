import { ethers } from "hardhat";

export async function main() {
  const QuizFactory = await ethers.getContractFactory("QuizFactory");
  const quizfactory = await QuizFactory.deploy({ value: 1 });

  await quizfactory.deployed();

  console.log("Quiz Factory Contract deployed to:", quizfactory.address);
}
