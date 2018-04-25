import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
    JSON.parse(CampaignFactory.interface),
    '0x39Cfa8Af75e12C9E2dE73239109186e37b6D4498'
);

export default instance;