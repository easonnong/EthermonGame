const { ethers, network, getNamedAccounts, deployments } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

use(solidity);

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Ethermon Uint Tests", function () {
      let ethermon,
        ethermonContract,
        player,
        player1,
        player2,
        deployer,
        monsterOneLevel,
        monsterTwoLevel;

      beforeEach(async function () {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        player1 = accounts[2];
        player2 = accounts[3];
        await deployments.fixture(["ethermon"]);
        ethermonContract = await ethers.getContract("Ethermon");
        ethermon = ethermonContract.connect(deployer);
      });

      describe("constructor", function () {
        it("deployer should equal game owner", async function () {
          const gameOwner = await ethermon.getGameOwner();
          assert.equal(gameOwner, deployer.address);
        });
      });

      describe("createNewMoster", function () {
        it("only game owner can create new moster", async () => {
          ethermon = ethermonContract.connect(player);
          await expect(
            ethermon.createNewMonster("monsterOne", player.address)
          ).to.be.revertedWith("Ethermon__OnlyGameOwner");
          const monsterNumber = await ethermon.getMonsterNumber();
          assert.equal(monsterNumber.toString(), "0");
        });

        it("add new monster sucess", async () => {
          await ethermon.createNewMonster("monsterOne", player1.address);
          await ethermon.createNewMonster("monsterTwo", player2.address);
          const monsterOne = await ethermon.getMonsterName(0);
          const monsterTwo = await ethermon.getMonsterName(1);
          const monsterNumber = await ethermon.getMonsterNumber();
          assert.equal(monsterNumber.toString(), "2");
          assert.equal(monsterOne, "monsterOne");
          assert.equal(monsterTwo, "monsterTwo");
        });
      });

      describe("battle", function () {
        beforeEach(async function () {
          await ethermon.createNewMonster("monsterOne", player1.address);
          await ethermon.createNewMonster("monsterTwo", player2.address);
          monsterOneLevel = await ethermon.getMonsterLevel(0);
          monsterTwoLevel = await ethermon.getMonsterLevel(1);
        });

        it("must be owner of monster can enter battle", async () => {
          //ethermon = ethermonContract.connect(player);
          await expect(ethermon.battle(0, 1)).to.be.revertedWith(
            "Ethermon__OnlyMonsterOwner"
          );
        });

        it("all monster init for level 1", async () => {
          assert.equal(monsterOneLevel.toString(), "1");
          assert.equal(monsterTwoLevel.toString(), "1");
        });

        it("after battle, winner level add 2, loser level add 1", async () => {
          ethermon = ethermonContract.connect(player1);
          assert.equal(monsterOneLevel.toString(), monsterTwoLevel.toString());
          await ethermon.battle(0, 1);
          monsterOneLevel = await ethermon.getMonsterLevel(0);
          monsterTwoLevel = await ethermon.getMonsterLevel(1);
          assert.equal(monsterOneLevel.toString(), "3");
          assert.equal(monsterTwoLevel.toString(), "2");
        });
      });
    });
