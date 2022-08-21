import express, { response } from 'express';
import dot from 'dotenv';
import Web3 from 'web3';
import Contract from 'web3-eth-contract';
import { beerTokenABI } from './ABI.js';

dot.config();

const app = express();
const port = process.env.PORT;
const polygonInfuraUrl = process.env.POLYGON_INFURA_URL;
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
const underlyingdecimals = process.env.UNDERLYING_DECIMALS;
console.log(polygonInfuraUrl,walletPrivateKey)

const web3 = new Web3(new Web3.providers.HttpProvider(polygonInfuraUrl));

let contract = new Contract(
	beerTokenABI,
	'0x25A580558292aAeD2043bD3BAef0f43A6e2a49c2'
);

contract.setProvider(polygonInfuraUrl);
web3.eth.accounts.wallet.add(walletPrivateKey);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

app.get('/create-wallet', () => {
	let newWallet = web3.eth.accounts.create();
	// console.log(newWallet);
});

app.get('/balance',async (req,res) => {
	let walletAddress = req.query.walletAddress
	let balance = await contract.methods.balanceOf(walletAddress).call();
	return res.json({balance:balance});
})


