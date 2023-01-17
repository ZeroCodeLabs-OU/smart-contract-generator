const express = require('express');
const bodyParser = require('body-parser');
const ethers =require('ethers')
const db = require('./db'); // import your database connection

const app = express();
app.use(bodyParser.json());

// Private key for signing messages, this should be kept secret
const privateKey = '0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12';
const signer = new ethers.Wallet(privateKey);

app.post('/mint/:tier', async (req, res) => {
  const {walletAddress} = req.body;
  const { tier } = req.params;

  // Check if address is allowlisted in the specified whitelist tier
  const whitelistedAddresses = await getAddressesByWhitelistTier(tier);
  if (!whitelistedAddresses.has(walletAddress)) {
    return res.status(400).send({error: `Address not allowlisted in the ${tier} whitelist tier`});
  }

  // Get the presale mint price for the specified whitelist tier
  const presaleMintPrice = await getPresaleMintPriceByWhitelistTier(tier);

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

  res.send({ signature, presaleMintPrice });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

async function getAddressesByWhitelistTier(tier) {
    // query the database to get the addresses in the specified whitelist tier
    const addresses = await db.query(`SELECT address FROM whitelist WHERE tier = '${tier}'`);
    return new Set(addresses.map(address => address.address));
  }
  
  async function getPresaleMintPriceByWhitelistTier(tier) {
    // query the database to get the presale mint price for the specified whitelist tier
    const price = await db.query(`SELECT price FROM whitelist WHERE tier = '${tier}'`);
    return price[0].price;
  }
  

//   function presaleMint(uint256 amount,bytes32 hash, bytes memory signature, uint256 _presaleMintPrice)
//     external
//     payable
//     paymentProvided(amount * _presaleMintPrice)
// {
//     require(presaleActive(), "Presale has not started yet");
//     require(whitelistTiers[recoverSigner(hash, signature)] != "", "Address is not allowlisted");
//     require(!signatureUsed[signature], "Signature has already been used.");

//     _presaleMinted[msg.sender] = true;
//     _mintTokens(msg.sender, amount);
// }