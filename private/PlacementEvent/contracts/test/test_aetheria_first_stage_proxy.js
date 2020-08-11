// accounts[0] owner, accounts[1] delegate, accounts[2] basic user, accounts[3]: dummy land
var TestAetheriaFirstStageProxy = artifacts.require("AetheriaFirstStageProxy");
var DummyLand = artifacts.require("LAND/DummyLand");
var util = require("ethereumjs-util")
contract("TestAetheriaFirstStageProxy", function(accounts) {
  it("should be able to update delegate", (done) => {
    TestAetheriaFirstStageProxy.deployed().then(async (contract) => {
      let idealDelegate = accounts[1];
      let authorizedCaller = accounts[0];
      await contract.setDelegatedSigner(idealDelegate, {from: authorizedCaller});
      let currentDelegate = await contract.getDelegatedSigner.call();
      assert.equal(
        currentDelegate,
        idealDelegate
      );
      done();
    });
  });
  
  it("unauthorized users cannot set update delegate", (done) => {
    TestAetheriaFirstStageProxy.deployed().then(async (contract) => {
      let eve = accounts[2];
      try {
        await contract.setDelegatedSigner(eve, {from: eve});
      } catch (error) {
        assert.include(
          error.message,
          "caller is not the owner",
          "Only the owner should be able to call this"
        );
        done();
      }
    });
});

  it("a signature from the delegate can set land opperators", (done) => {
    DummyLand.deployed().then(instance => {
      TestAetheriaFirstStageProxy.deployed(instance.address).then(async (contract) => {
        let authorizedCaller = accounts[0];
        let idealDelegate = accounts[1];
        let idealDelegateKey = '0x2c210f5e2021d27360b0cc17ef4218475f34ad36bba2ce74aef97e65546a2e0e';
        let normalUser = accounts[2];
        let plotIds = [0, 1, 2, 3];
        let nonce = 1;
        
        await contract.setDelegatedSigner(idealDelegate, {from: authorizedCaller});
  
        let packedMsg = web3.eth.abi.encodeParameters(["address", "uint256[]", "uint256"], [normalUser, plotIds, nonce]);
        let msgHash = web3.utils.keccak256(packedMsg);
        let generatedMsgHash = await contract.getMessageHash.call(normalUser, plotIds, nonce);
        
        assert.equal(
          msgHash,
          generatedMsgHash
        ) //check if the message hash stays the same.
  
        let sig = web3.eth.accounts.sign(msgHash, idealDelegateKey);
  
        await contract.updatePlot(normalUser, plotIds, nonce, sig.v, sig.r, sig.s)
        
        let newNonce = await contract.currentNonce();
        assert.equal(2, newNonce);

        done();
      });
    })
  });

  it("an invalid signature cannot update land opperators", (done) => {
    TestAetheriaFirstStageProxy.deployed().then(async (contract) => {
      let normalUser = accounts[2];
      let plotIds = [0, 1, 2, 3];
      let v = 0, r = "0x0", s = "0x0";
      let nonce = 1;
      try {
        await contract.updatePlot(normalUser, plotIds, nonce, v, r, s, {from: normalUser});
      } catch (error) {
        if(error.reason == "Invalid Sig")
          done();
      }
    });
  })
});
