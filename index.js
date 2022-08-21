import express, { response } from "express";
import dot from "dotenv";
import Web3 from "web3";
import bodyParser from "body-parser";
import Contract from "web3-eth-contract";
import { beerTokenABI } from "./ABI.js";
import cors from "cors";

dot.config();

const app = express();
app.use(bodyParser.json());
app.options('*', cors());
const port = process.env.PORT;
const polygonInfuraUrl = process.env.POLYGON_INFURA_URL;
const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
const underlyingdecimals = process.env.UNDERLYING_DECIMALS;
const srcWalletAddress = process.env.SRC_WALLET_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(polygonInfuraUrl));

let contract = new Contract(
  beerTokenABI,
  "0x25A580558292aAeD2043bD3BAef0f43A6e2a49c2"
);

let corsOptions = {
	origin:'*',
	optionsSuccessStatus:200
}

contract.setProvider(polygonInfuraUrl);
web3.eth.accounts.wallet.add(walletPrivateKey);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/create-wallet", (req, res) => {
  try {
    let newWallet = web3.eth.accounts.create();
    return res.json({
      status: 200,
      addres: newWallet.address,
      privateKey: newWallet.privateKey,
    });
  } catch (err) {
    return res.json({ status: 500, message: err.message });
  }
});

app.get("/balance", async (req, res) => {
  if (!req.query.walletAddress) {
    return res.json({ status: 400, message: "walletAddress is required" });
  }
  let walletAddress = req.query.walletAddress;
  try {
    let balance = await contract.methods.balanceOf(walletAddress).call();
    return res.json({ balance: balance });
  } catch (err) {
    return res.json({ status: 500, message: err.message });
  }
});

app.post("/deposit", async (req, res) => {
  if (!req.body.address || !req.body.amount) {
    return res.json({
      status: 400,
      message: "Address and amount are required",
    });
  }
  let walletAddress = req.body.walletAddress;
  let amount = req.body.amount;
  let value = 0;

  var tx = {
    from: srcWalletAddress,
    //TODO: change to dynamic gas calculation
    gas: 215840,
    to: walletAddress,
    value: amount * underlyingdecimals,
    data: contract.methods.transfer(walletAddress, value).encodeABI(),
  };
  const signPromise = web3.eth.accounts.signTransaction(tx, walletPrivateKey);

  try {
    await signPromise
      .then((signedTx) => {
        const sentTx = web3.eth.sendSignedTransaction(
          signedTx.raw || signedTx.rawTransaction
        );
        sentTx.on("receipt", (receipt) => {
          //console.log(receipt);
          return res.json({ status: 200, receipt: receipt });
        });
        sentTx.on("error", (err) => {
          console.log(err);
		  return res.json({ status: 500, message: err.message });
        });
      })
      .catch((err) => {
        console.log(err);
        return res.json({ status: 500, message: "something went wrong" });
      });
  } catch (err) {
    return res.json({ status: 500, message: err.message });
  }
});
