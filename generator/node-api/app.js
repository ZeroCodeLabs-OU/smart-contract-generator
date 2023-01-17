const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs-extra');
const solc = require('solc');
const cors = require('cors');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require("keccak256");
const bodyparser = require("body-parser");

const request = require('request');

const bodyParser = require('body-parser');
// const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.infura.io/v3/641feefe9682428ab1e3c5bcabee9ad8'));
const ethers =require('ethers');
// const sig = require('eth-sig-util')

const Web3 = require('web3');


const contractAbiFilePath = path.join(__dirname, './build/NFTCollection.json');
  const contractAbiFileData = require(contractAbiFilePath);
  const contractABI = contractAbiFileData.abi;
  // const contractBytecode = contractAbiFileData.bytecode;

// console.log(contractABI)
const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.infura.io/v3/641feefe9682428ab1e3c5bcabee9ad8'));// Database for storing allowlisted addresses
// web3.eth.net.getId().then(console.log);





// Address of the deployed smart contract
const contractAddress = "0xf89a5730B77D02381860F0cBea356D30dc657eE4";

// Create a new contract instance
// const contract = new web3.eth.Contract(contractABI, contractAddress);
const contract = new web3.eth.Contract(contractABI, contractAddress);
owner='0xf4ecdAfc258507E840D741772ce8Ef9db2235962';

const allowlistedAddresses = new Set(['0xf4ecdAfc258507E840D741772ce8Ef9db2235962', '0x05C7426804A63fCB4aD4019F0EDFBc2666b297d1']);

// Private key for signing messages, this should be kept secret
const privateKey = '0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12';

const signer = new ethers.Wallet(privateKey);




const app = express();
app.use(cors({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
  }));
  
// const sslServer = https.createServer(
//     {
//       key: fs.readFileSync(path.join('ssl','private.key')),
//       cert: fs.readFileSync(path.join('ssl','certificate.crt')),
//     },
//     app
//   )

// support parsing of application/json type post data
app.use(bodyparser.json());
// parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }))

app.listen(5550,() => console.log('RUNING SSL NODE ON AWS ON PORT 443...'));
  

const getContractSource = contractFileName => {
    const contractPath = path.resolve(__dirname, 'contracts', contractFileName);
    return fs.readFileSync(contractPath, 'utf8');
};

async function compile(){
    const sourceFolderPath = path.resolve(__dirname, 'contract-files');
    const buildFolderPath = path.resolve(__dirname, 'build');
    let sources = {};

    var walk = function (dir) {
        var results = [];
        var list = fs.readdirSync(dir);
        list.forEach(function (file) {
            file = dir + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else {
                if (file.substr(file.length - 4, file.length) === ".sol") {
                    sources = {
                        ...sources,
                        [file]: {
                            content: getContractSource(file)
                        }
                    };
                }
                results.push(file);
            }
        });
        return results;
    };
    walk(sourceFolderPath);

    const input = {
        language: 'Solidity',
        sources,
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            

            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }

    console.log('\nCompiling contracts...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));


    let shouldBuild = true;

    if (output.errors) {
        console.error(output.errors);
        // throw '\nError in compilation please check the contract\n';
        for (error of output.errors) {
            if (error.severity === 'error') {
                shouldBuild = false;
                throw 'Error found';
                break;
            }
        }
    }

    if (shouldBuild) {
        fs.removeSync(buildFolderPath);
        fs.ensureDirSync(buildFolderPath);

        for (let contractFile in output.contracts) {
            for (let key in output.contracts[contractFile]) {
                fs.outputJsonSync(
                    path.resolve(buildFolderPath, `${key}.json`),
                    {
                        abi: output.contracts[contractFile][key]["abi"],
                        bytecode: output.contracts[contractFile][key]["evm"]["bytecode"]["object"]
                    },
                    {
                        spaces: 2,
                        EOL: "\n"
                    }
                );
            }
        }
        // res.status(200).send({success:true})
    } else {
        console.log('\nBuild failed\n');
    }
};
compile();

app.get('/getByteCode', async(req,res)=>{
    let fileName = req.query.file;
    let data = fs.readFileSync(`./build/${fileName}.json`, 'utf8');
    console.log(data);
    let data1 = JSON.parse(data);
    console.log(data1.abi)
    res.status(200).send({success:true, abi: data1.abi, bytecode:data1.bytecode})
});

app.get('/getMerkleRoot', async (req, res) => {
    let whitelist = req.query.data;
    let buildFolderPath = path.resolve(__dirname, 'whitelist');
    let leaves = JSON.parse(whitelist).map((addr) => keccak256(addr))
    let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    let rootHash = merkleTree.getHexRoot();
    fs.outputJsonSync(path.resolve(buildFolderPath, `${rootHash}.json`),JSON.parse(whitelist));
    res.status(200).send({ success: true, data: rootHash })
});




app.post('/signature', async (req, res) => {
    const {walletAddress} = req.body;
  
    // Check if address is allowlisted
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
    const signedData = {
      walletAddress: walletAddress,
      signature: signature
    };
    
    // export the object
    // module.exports = signedData;
  
    res.send(signedData);
  
    // check signature
    const checkSignature = async (address, signature) => {
      // Compute the message digest
      const messageHash = ethers.utils.id(address);
      console.log(messageHash);
      // Call the recoverSigner function on the smart contract
      const signerAddress = await contract.methods.recoverSigner(messageHash, signature).call();
      // Check if the signerAddress is the same as the address passed as an argument
      
      console.log(signerAddress)
      if(signerAddress ===owner ) {
          console.log("Signature is valid");
      } else {
          console.log("Signature is invalid");
      }
    }
  
    checkSignature(signedData.walletAddress,signedData.signature);
  });
app.post('/allowlist', async (req, res) => {
    const { addresses } = req.body;
    
    
    // Add addresses to allowlistedAddresses set
    for (let i = 0; i < addresses.length; i++) {
        allowlistedAddresses.add(addresses[i]);
    }
    
    res.send({ message: 'Allowlisted addresses added successfully' });
});



app.post("/airdrop", (req, res) => {
    const addresses = req.body.addresses;
    const account = "0xf4ecdAfc258507E840D741772ce8Ef9db2235962"; // Address of account that will send the transaction
    const privateKey = "0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12"; // Private key of account that will send the transaction
    let gasPrice;
    let gasLimit;

    request('https://ethgasstation.info/json/ethgasAPI.json', function (error, response, body) {
        const data = JSON.parse(body);
        gasPrice = web3.utils.toWei(data.fast.toString(), "gwei");
        gasLimit = data.fastest * 100000;
  
        const contractData = contract.methods.airdropNFTs(addresses).encodeABI();
        console.log(contractData) // check the value of contractData here

        web3.eth.getTransactionCount(account).then((nonce) => {
            const tx = {
                nonce: nonce,
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                data: contractData,
                to: contractAddress,
                from: account
            };
            const signedTx = web3.eth.accounts.signTransaction(tx, privateKey);
            web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                .on("transactionHash", (hash) => {
                    res.send({ message: "Airdrop transaction sent", hash: hash });
                });
        });
    });
});

app.get('/', (req, res) => {
    res.status(200).send({ success: true, msg: "API is working" });
});

