const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

// create the file paths
const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

// create variables
let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    // get a list of available accounts
    accounts = await web3.eth.getAccounts();
    
    // deploy the factory contract from the first account 
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ from: accounts[0], gas: '1000000' });
    
    // creates a campaign by calling the createCampaign function in the factory contract    
    await factory.methods.createCampaign('100').send({ 
        from: accounts[0], 
        gas: '1000000' 
    });
    
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call(); // takes the first element out of the array
    
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
    
});

describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });
    
    it('marks caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });
    
    it('allows people to contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributor = await campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });
    
    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '5',
                from: accounts[1]
            });
        } catch (err) {
            assert(err);
            return;
        }
        assert(false);
    });
    
    it('allows a manager to make a payment request', async () => {
        await campaign.methods
            .createRequest('Buy batteries', '100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy batteries', request.description);
    });
    
    it('processes requests', async () => {
        // contribute to the campaign
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });
        
        // create a request for funds
        await campaign.methods
            .createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({ from: accounts[0], gas: '1000000'});
        
        // approve the request
        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });
        
        // finalize request
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });
        
        // check that funds have gone to account 1
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        console.log(balance);
        assert(balance > 104);
    });
});