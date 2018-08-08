// Get private stuff from my .env file
// import {my_privkey} from '../.env'
var abi = require('./contracts/DappToken_sol_DappToken.json')
// Need access to my path and file system
var path = require('path')
var fs = require('fs');
var ethJsUtil = require('ethereumjs-util')
var sha256 = require('sha256')
// Ethereum javascript libraries needed
var Web3 = require('Web3')
var Tx = require('ethereumjs-tx');

// Rather than using a local copy of geth, interact with the ethereum blockchain via infura.io
const web3 = new Web3(Web3.givenProvider || `https://rinkeby.infura.io/v3/26eace22a63e4a069e14a5f70742fe83`)

// Create an async function so I can use the "await" keyword to wait for things to finish
const main = async () => {
  // This code was written and tested using web3 version 1.0.0-beta.26
  fs.readFile('/Users/devinjackson/Library/Ethereum/rinkeby/keystore/UTC--2018-07-30T16-46-47.042709534Z--8948fd4f2ce5ff6671c1173ef09ca271e9c7987f', 'utf8', async function(err, data) {
    console.log(`web3 version: ${web3.version}`)
    // Who holds the token now?
    var myAddress = "0x8948FD4f2Ce5ff6671c1173EF09Ca271e9C7987F";
  
    // Who are we trying to send this token to?
    var destAddress = "0x3Dd773fB1BA76c039Fa30b86a105C1b1B7a54061";
  
    // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
    var transferAmount = 1;
  
    // Determine the nonce
    var count = await web3.eth.getTransactionCount(myAddress);
    console.log(`num transactions so far: ${count}`);
  
    // This file is just JSON stolen from the contract page on etherscan.io under "Contract ABI"
  
    // This is the address of the contract which created the ERC20 token
    var contractAddress = "0x4940e5cf677a6ad0af76c1c789ed35660419dc48";
    var contract = new web3.eth.Contract(abi, contractAddress, { from: myAddress });
  
    // How many tokens do I have before sending?
    var balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance before send: ${balance}`);
  
    // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
    var rawTransaction = {
        "from": myAddress,
        "nonce": "0x" + count.toString(16),
        "gasPrice": "0x2dc6c0",
        "gasLimit": "21000",
        "to": contractAddress,
        "value": "0x0",
        "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
        "chainId": 4
    };
  
    // Example private key (do not use): 'e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109'
    // The private key must be for myAddress
    var privKey = ethJsUtil.toBuffer('0xafcf48ebad018da3471bcf16d41fd45857fc5abba506da6ea74ba12973c92b78')
    console.log("PRIVE KEY", privKey)
    var tx = new Tx(rawTransaction);
    tx.sign(privKey);
    var serializedTx = tx.serialize();
  
    // Comment out these three lines if you don't really want to send the TX right now
    console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}`);
    var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
  
    // The balance may not be updated yet, but let's check
    balance = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance after send: ${balance}`);
  })
}

main();
