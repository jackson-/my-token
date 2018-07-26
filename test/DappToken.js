var DappToken = artifacts.require("./DappToken.sol");
contract('DappToken', function(accounts){
    var tokenInstance;
    
    it('initializes the contract with the correct values', function() {
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, "DappToken")
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, "DAPP")
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, "DappToken 1.0")
        })
    })
    
    it('allocated the initial supply upon deployment', function() {
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total number to 1 Mil')
            return tokenInstance.balanceOf(accounts[0])
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates initial supply to admin account')
        })
    })

    it('transfers ownership', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 999999999999999999)
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert')
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0] })
        }).then(function(success){
            assert.equal(success, true, 'it returns true')
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]})
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event')
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the sender account')
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the receiver account')
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount')
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'adds the amount to to the receiving account')
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance, 750000, 'deducts the amount from the sender account')
        })
    })
})