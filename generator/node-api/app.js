const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs-extra');
const solc = require('solc');
const cors = require('cors');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require("keccak256");
const bodyparser = require("body-parser");
const ethers = require('ethers');
const parse = require('csv-parse');




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


// const allowlistedAddresses = new Set(['0xf4ecdAfc258507E840D741772ce8Ef9db2235962', '0x05C7426804A63fCB4aD4019F0EDFBc2666b297d1']);
// Private key for signing messages, this should be kept secret
const privateKey = '0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12';


const signer = new ethers.Wallet(privateKey);
// const owner='0xf4ecdAfc258507E840D741772ce8Ef9db2235962';
// app.post('/signature', async (req, res) => {
//     const { walletAddress } = req.body;
//   const { allowlistedAddresses } = req.body;

//     // Check if address is allowlisted
//     let isAllowlisted = false;
//     let address = [];
//     if (allowlistedAddresses) {
//         address = allowlistedAddresses;
//         for (let i = 0; i < address.length; i++) {
//             if (address[i] == walletAddress) {
//                 isAllowlisted = true;
//                 break;
//             }
//         }
//         if (!isAllowlisted) {
//             return res.status(400).send({ error: 'Address not allowlisted' });
//         }
//     }
    

//     // Sign message with private key
//     let messageHash = ethers.utils.id(walletAddress);
//     let messageBytes = ethers.utils.arrayify(messageHash);

//     let signature;
//     try {
//         signature = await signer.signMessage(messageBytes);
//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({ error: 'Error signing message' });
//     }
//     const signedData = {
//         walletAddress: walletAddress,
//         signature: signature
//     };

  

//     res.send(signedData);

//     // check signature
// });
app.post('/signature', async (req, res) => {
    const { walletAddress, allowlistedAddresses } = req.body;
  
    // Check if address is allowlisted
    if (!allowlistedAddresses || !allowlistedAddresses.includes(walletAddress)) {
      return res.status(400).send({ error: 'Address not allowlisted' });
    }
  
    // Sign message with private key
    const messageHash = ethers.utils.id(walletAddress);
    const messageBytes = ethers.utils.arrayify(messageHash);
  
    let signature;
    try {
      signature = await signer.signMessage(messageBytes);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error: 'Error signing message' });
    }
  
    const signedData = {
        messageHash,
      signature
    };
  
    res.send(signedData);
  });

  app.post('/allowlist', async (req, res) => {
    const file = req.body.file; // assume the CSV file is sent in the request body with key "file"

    // Read the file and parse the CSV data
    const csvData = await fs.promises.readFile(file, 'utf8');
    const records = parse(csvData, {columns: true, skip_empty_lines: true});
    // Add addresses to allowlistedAddresses set
    records.forEach((record) => {
        allowlistedAddresses.add(record.address); // assuming "address" is the header of the column containing addresses in the CSV file
    });
    res.send({ message: 'Allowlisted addresses added successfully' });
});


let airdropAddresses = new Set(); // set to store airdrop addresses

app.post('/airdroplist', async (req, res) => {
    const file = req.body.file; // assume the CSV file is sent in the request body with key "file"

    // Read the file and parse the CSV data
    const csvData = await fs.promises.readFile(file, 'utf8');
    const records = parse(csvData, {columns: true, skip_empty_lines: true});
    // Add addresses to airdropAddresses set
    records.forEach((record) => {
        airdropAddresses.add(record.address); // assuming "address" is the header of the column containing addresses in the CSV file
    });
    res.send({ message: 'Airdrop addresses added successfully' });
});

app.post('/airdrop', async (req, res) => {
    const {addresses,senderAddress} = req.body;
    
    // Check if addresses are valid
    for (const address of addresses) {
      if (!web3.utils.isAddress(address)) {
        return res.status(400).send({ error: 'Invalid address' });
      }
    }
    
    // Call the airdropNFTs function
    try {
      const tx = await contract.methods.airdropNFTs(addresses).send({ from: senderAddress });
      res.send({ transactionHash: tx.transactionHash });
    } catch (error) {
      res.status(500).send({ error });
    }
  });




app.get('/', (req, res) => {
    res.status(200).send({ success: true, msg: "API is working" });
});

