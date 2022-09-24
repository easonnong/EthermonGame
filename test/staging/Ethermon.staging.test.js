const { assert, expect } = require("chai");
const { network, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Ethermon Staging Test", function () {
      let player1, player2, ethermon, monsterOneLevel, monsterTwoLevel;

      beforeEach(async function () {
        accounts = await ethers.getSigners();
        player1 = accounts[0];
        player2 = accounts[1];
        ethermon = await ethers.getContractAt(
          "Ethermon",
          "0x83a90e18feb78cde7f6a1d41ee2708dc9aadb23b"
        );
        await ethermon.deployed();

        console.log("player1=", player1.address);
        console.log("player2=", player2.address);

        /* await ethermon.createNewMonster("monsterOne", player1.address);
        await ethermon.createNewMonster("monsterTwo", player2.address); */
        monsterOneLevel = await ethermon.getMonsterLevel(0);
        monsterTwoLevel = await ethermon.getMonsterLevel(1);
        console.log("one=", monsterOneLevel.toString());
      });

      describe("battle", function () {
        it("must be owner of monster can enter battle", async () => {
          await expect(ethermon.battle(0, 1)).to.be.revertedWith(
            "Ethermon__OnlyMonsterOwner"
          );
        });

        it("all monster init for level 1", async () => {
          assert.equal(monsterOneLevel.toString(), "1");
          assert.equal(monsterTwoLevel.toString(), "1");
        });

        it("after battle, winner level add 2, loser level add 1", async () => {
          ethermon = ethermon.connect(player1);
          assert.equal(monsterOneLevel.toString(), monsterTwoLevel.toString());
          await ethermon.battle(0, 1);
          monsterOneLevel = await ethermon.getMonsterLevel(0);
          monsterTwoLevel = await ethermon.getMonsterLevel(1);
          assert.equal(monsterOneLevel.toString(), "3");
          assert.equal(monsterTwoLevel.toString(), "2");
        });
      });
    });
