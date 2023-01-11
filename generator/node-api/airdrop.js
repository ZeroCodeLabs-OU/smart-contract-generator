const Web3 = require('web3');
const { Transaction } = require('ethereumjs-tx');
const path = require('path');
const privateKey = '0xf98bc0cbb65a19d41f0ca3b5937bb08624b17a69e31b162689b924ed2970bc12';
const contractAddress = '0xf89a5730B77D02381860F0cBea356D30dc657eE4';
const contractAbiFilePath = path.join(__dirname, './build/NFTCollection.json');
const contractAbiFileData = require(contractAbiFilePath);
const contractABI = contractAbiFileData.abi;




const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.infura.io/v3/641feefe9682428ab1e3c5bcabee9ad8'));
const contract = new web3.eth.Contract(contractABI, contractAddress);

const addresses = ['0x19C28105ae71a79a68F79e3612eB4fAb8f9a75F1'];
const amount = 1;

web3.eth.getTransactionCount(web3.eth.accounts.privateKeyToAccount(privateKey).address, (err, nonce) => {
    const data = contract.methods.airdropNFTs(addresses, amount).encodeABI();
    const gasPrice = web3.utils.toWei('20', 'gwei');
    const gasLimit = 5000000;
    const chainId = 80001; // 
    const rawTransaction = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: contractAddress,
        data: data,
        chainId: chainId
    }
    const transaction = new Transaction(rawTransaction);
    transaction.sign(Buffer.from(privateKey.substring(2), 'hex'));
    const serializedTransaction = transaction.serialize();
    web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, transactionHash) => {
        if (err) {
            console.log(err);
        } else {
            console.log(transactionHash);
        }
    });
});
