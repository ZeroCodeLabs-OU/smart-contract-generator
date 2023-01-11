const ethers =require('ethers');
// const sig = require('eth-sig-util')

const Web3 = require('web3');
const path = require('path');
const fs = require('fs');




  // Read the ABI file
  const contractAbiFilePath = path.join(__dirname, './build/NFTCollection.json');
  const contractAbiFileData = require(contractAbiFilePath);
  const contractABI = contractAbiFileData.abi;
  // const contractBytecode = contractAbiFileData.bytecode;

// console.log(contractABI)
const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.infura.io/v3/641feefe9682428ab1e3c5bcabee9ad8'));// Database for storing allowlisted addresses
// web3.eth.net.getId().then(console.log);


// // File path of the contract ABI
// const contractAbiFilePath = path.join(__dirname, './build/NFTCollection.json');

// // Import contract ABI
// const contractABI = require(contractAbiFilePath);

// Create a new instance of the web3.js library

const allowlistedAddresses = new Set(['0xf4ecdAfc258507E840D741772ce8Ef9db2235962', '0x05C7426804A63fCB4aD4019F0EDFBc2666b297d1']);

// Private key for signing messages, this should be kept secret
const privateKey = '0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12';


// Address of the deployed smart contract
const contractAddress = "0xf89a5730B77D02381860F0cBea356D30dc657eE4";

// Create a new contract instance
// const contract = new web3.eth.Contract(contractABI, contractAddress);
const contract = new web3.eth.Contract(contractABI, contractAddress);

const checkSignature = async (address, signature) => {
  // Compute the message digest
//   const message = web3.utils.asciiToHex(address);
//   const messageDigest = web3.utils.keccak256(message);
    const messageHash = ethers.utils.id(address);
    console.log(messageHash);
  // Call the recoverSigner function on the smart contract
  const signerAddress = await contract.methods.recoverSigner(messageHash, signature).call();
  // Check if the signerAddress is the same as the address passed as an argument
  console.log(signerAddress)
  if(signerAddress === address) {
      console.log("Signature is valid");
  } else {
      console.log("Signature is invalid");
  }
}

checkSignature("0xf4ecdAfc258507E840D741772ce8Ef9db2235962","0xc7603817f81d98d7a65ade10161da41881398b950db6933eb6c62e6486dff15018f1ec57ebbd4ac05f04aed2f58e391460981f8b72c255763abc9623a17388061b");
