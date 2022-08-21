import express, { response } from 'express';
import dot from 'dotenv';
import Web3 from 'web3';
import bodyParser from 'body-parser';
import Contract from 'web3-eth-contract';
import { beerTokenABI } from './ABI.js';

dot.config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT;
const polygonInfuraUrl = process.env.POLYGON_INFURA_URL;
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
const underlyingdecimals = process.env.UNDERLYING_DECIMALS;
const srcWalletAddress = process.env.SRC_WALLET_ADDRESS;

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

app.post('/deposit',async (req,res)=> {

	let walletAddress = req.body.walletAddress;
	let amount = req.body.amount;
    let value = 0

    var tx = {
        from : srcWalletAddress,
		//Todo: change to dynamic gas calculation
        gas: 215840,
        to : walletAddress,
        value: amount* underlyingdecimals,
        data: contract.methods.transfer(walletAddress,value).encodeABI()
    }
      const signPromise = web3.eth.accounts.signTransaction(tx, walletPrivateKey);

      await signPromise.then((signedTx) => {
        const sentTx = web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
        sentTx.on("receipt", receipt => {
            //console.log(receipt);
			return res.json({status:200,
							receipt:receipt});
        });
        sentTx.on("error", err => {
            console.log(err);
        });
      }).catch((err) => {
        console.log(err);
		return res.json({status:500,
			message:'something went wrong'});
      });
	}
);
