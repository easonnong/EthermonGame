//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

error Ethermon__OnlyGameOwner();
error Ethermon__OnlyMonsterOwner();

contract Ethermon is ERC721 {
    struct Monster {
        string name;
        uint level;
    }

    Monster[] private s_monsters;
    address private immutable i_gameOwner;

    constructor() ERC721("Monster", "MST") {
        i_gameOwner = msg.sender;
    }

    modifier onlyOwnerOf(uint _monsterId) {
        if (ownerOf(_monsterId) != msg.sender) {
            revert Ethermon__OnlyMonsterOwner();
        }
        _;
    }

    function createNewMonster(string memory _name, address _to) public {
        if (msg.sender != i_gameOwner) {
            revert Ethermon__OnlyGameOwner();
        }
        uint id = s_monsters.length;
        s_monsters.push(Monster(_name, 1));
        _safeMint(_to, id);
    }

    function battle(uint _attackingMonster, uint _defendingMonster)
        public
        onlyOwnerOf(_attackingMonster)
    {
        Monster storage attacker = s_monsters[_attackingMonster];
        Monster storage defender = s_monsters[_defendingMonster];
        if (attacker.level >= defender.level) {
            attacker.level += 2;
            defender.level += 1;
        } else {
            attacker.level += 1;
            defender.level += 2;
        }
    }

    function getMonsterName(uint _monsterId)
        public
        view
        returns (string memory)
    {
        return s_monsters[_monsterId].name;
    }

    function getMonsterLevel(uint _monsterId) public view returns (uint) {
        return s_monsters[_monsterId].level;
    }

    function getMonsterNumber() public view returns (uint) {
        return s_monsters.length;
    }

    function getGameOwner() public view returns (address) {
        return i_gameOwner;
    }
}
