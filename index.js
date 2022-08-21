import express from 'express';
import dot from 'dotenv';
import Web3 from 'web3';
import Contract from 'web3-eth-contract';
import { beerTokenABI } from './ABI.js';

dot.config();

const app = express();
const port = process.env.PORT;
const polygonInfuraUrl = process.env.POLYGON_INFURA_URL;
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;

const web3 = new Web3(new Web3.providers.HttpProvider(polygonInfuraUrl));

const setUp = () => {
	Contract.setProvider(polygonInfuraUrl);
	const contract = new Contract(
		beerTokenABI,
		'0x25A580558292aAeD2043bD3BAef0f43A6e2a49c2'
	);
	web3.eth.accounts.wallet.add(walletPrivateKey);
};

setUp();

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

app.get('/create-wallet', () => {
	let newWallet = web3.eth.accounts.create();
	// console.log(newWallet);
});
