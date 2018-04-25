pragma solidity ^0.4.17;

contract Lotto {
    address public manager;
    address[] public players;
    
    function Lotto() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        // requires minimum ether to participate
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        // pseudo random number 
        return uint(keccak256(block.difficulty, now, players));   
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        // transfers all the money to the indexed address
        players[index].transfer(this.balance);
        players = new address[](0);
    }
    
    // modifier used to make sure we don't duplicate code (not required in this case)
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    // view means that it doesn't attempt to change any information
    function getPlayers() public view returns (address[]) {
        return players;
    }
}