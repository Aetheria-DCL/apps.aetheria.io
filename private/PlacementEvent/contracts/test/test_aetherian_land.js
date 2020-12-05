// accounts[0] owner, accounts[1] delegate, accounts[2] basic user, accounts[3]: basic user 2
const TestAetherianLand = artifacts.require("AetherianLand");
const TestDummyEstate = artifacts.require("LAND/DummyEstate")
const util = require("ethereumjs-util")

const idealDelegateKey = '0x45a6cd707e8c42b4b534e84456978164d41df8669a96bbd60d77b8eff5c05465';

contract("TestAetherianLand", function(accounts) {
    it("should be able to update delegate", (done) => {
        TestAetherianLand.deployed().then(async (contract) => {
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
        TestAetherianLand.deployed().then(async (contract) => {
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
        TestAetherianLand.deployed().then(async (contract) => {
            let authorizedCaller = accounts[0];
            let idealDelegate = accounts[1];
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

            await contract.claimLandTokens(normalUser, plotIds, nonce, sig.v, sig.r, sig.s, {from: normalUser})

            done();
        });
    })

    it("cannot claim already claimed land", (done) => {
        TestAetherianLand.deployed().then(async (contract) => {
            let authorizedCaller = accounts[0];
            let idealDelegate = accounts[1];
            let normalUser = accounts[2];
            let plotIds = [4, 5, 6, 7];

            let tryClaim = async (nonce) => {
                let packedMsg = web3.eth.abi.encodeParameters(["address", "uint256[]", "uint256"], [normalUser, plotIds, nonce]);
                let msgHash = web3.utils.keccak256(packedMsg);
                let generatedMsgHash = await contract.getMessageHash.call(normalUser, plotIds, nonce);

                assert.equal(
                    msgHash,
                    generatedMsgHash
                ) //check if the message hash stays the same.

                let sig = web3.eth.accounts.sign(msgHash, idealDelegateKey);

                await contract.claimLandTokens(normalUser, plotIds, nonce, sig.v, sig.r, sig.s, {from: normalUser})
            };

            await contract.setDelegatedSigner(idealDelegate, {from: authorizedCaller});
            await tryClaim(1);
            try {
                await tryClaim(2);
            } catch (error) {
                if(error.reason == "A plot is already claimed")
                    done();
            }
        });
    })

    it("an invalid signature cannot update land opperators", (done) => {
        TestAetherianLand.deployed().then(async (contract) => {
            let normalUser = accounts[2];
            let plotIds = [0, 1, 2, 3];
            let v = 0, r = "0x0", s = "0x0";
            let nonce = 1;
            try {
                await contract.claimLandTokens(normalUser, plotIds, nonce, v, r, s, {from: normalUser});
            } catch (error) {
                if(error.reason == "Invalid Sig")
                    done();
            }
        });
    })

    it("a transfer should update underlying land ownership", (done) => {
        TestDummyEstate.deployed().then(async (estate) => {
            TestAetherianLand.deployed().then(async (contract) => {
                await contract.transferFrom(accounts[2], accounts[3], 0, {from: accounts[2]});
                let currentOwner = await estate.operatorOf.call(0);

                assert(currentOwner == accounts[3]);

                done();
            });
        });
    });


    it("owner should be able to use contingency burn", (done) => {
        TestDummyEstate.deployed().then(async (estate) => {
            TestAetherianLand.deployed().then(async (contract) => {
                await contract.deleteTokens([0], {from : accounts[0]});
                let currentOwner = await estate.operatorOf.call(0);

                assert(currentOwner != accounts[3]);

                done();
            });
        });
    });

    it("non-owner shouldn't be able to use contingency burn", (done) => {
        TestAetherianLand.deployed().then(async (contract) => {
            try {
                await contract.deleteTokens([0], {from : accounts[1]});
            } catch {
                done();
            }
        });
    });
});
