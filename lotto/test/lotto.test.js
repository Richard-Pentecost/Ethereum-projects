const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lotto;
let accounts;

beforeEach(async () => {
    // Get list of all accounts
    accounts = await web3.eth.getAccounts();
    // Use the first account to deploy the contract
    lotto = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lotto Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lotto.options.address);
    });
    
    it('allows one account to enter', async () => {
        // enters the lottery
        await lotto.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        // getPlayers function called
        const players = await lotto.methods.getPlayers().call({
            from: accounts[0]
        });
        
        // checks that the correct address is stored in players array
        assert.equal(accounts[0], players[0]);
        // checks there is only 1 address in the players array
        assert.equal(1, players.length);
    });
    
    it('allows multiple accounts to enter', async () => {
        // enters the lottery
        await lotto.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        await lotto.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        await lotto.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });
        
        // getPlayers function called
        const players = await lotto.methods.getPlayers().call({
            from: accounts[0]
        });
        
        // checks that the correct addresses are stored in players array
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        // checks there is are 3 addresses in the players array
        assert.equal(3, players.length);
    });
    
    // to pass test the account shouldn't be entered
    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lotto.methods.enter().send({
                from: accounts[0],
                value: '200'        // 200 Wei which is less than 0.02 ether
            });
        } catch (err) {
            assert(err);
            return;
        }
        // fails the test if the above code doesn't produce an error
        assert(false);
    });
    
    // to pass test, the pickWinner function shouldn't be called
    it('only manager can call pick winner', async () => {
       try {
           await lotto.methods.pickWinner().send({
               from: accounts[1]
           });
           assert(false);
       } catch (err) {
           assert(err);
       }
    });
    
    it('sends money to the winner and resets players array', async () => {
        await lotto.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lotto.methods.pickWinner().send( {from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        
        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});