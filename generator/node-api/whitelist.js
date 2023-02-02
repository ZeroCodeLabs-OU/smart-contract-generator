const express = require('express');
const bodyParser = require('body-parser');
// const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.infura.io/v3/641feefe9682428ab1e3c5bcabee9ad8'));
const ethers =require('ethers')
const allowlistedAddresses = new Set(['0xf4ecdAfc258507E840D741772ce8Ef9db2235962', '0x05C7426804A63fCB4aD4019F0EDFBc2666b297d1']);

// Private key for signing messages, this should be kept secret
const privateKey = '0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12';

const signer = new ethers.Wallet(privateKey);

const app = express();
app.use(bodyParser.json());




app.post('/mint', async (req, res) => {
  const {walletAddress} = req.body;

  // Check if address is allowlisted
  console.log(walletAddress)
  if (!allowlistedAddresses.has(walletAddress)) {
    return res.status(400).send({error: 'Address not allowlisted'});
  }

  // Sign message with private key
  let messageHash = ethers.utils.id(walletAddress);
  let messageBytes = ethers.utils.arrayify(messageHash);

  let signature;
  try {
    signature = await signer.signMessage(messageBytes);
  } catch (error) {
    console.log(error);
    return res.status(400).send({error: 'Error signing message'});
  }
  
  res.send({signature: signature})
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
