class MMInterface
{
    constructor()
    {
        this.w3 = null;

        if (window.ethereum) {
            this.w3 = new Web3(ethereum);
            try {
                // Request account access if needed
                ethereum.enable();
            } catch (error) {
                window.history.back();
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            this.w3 = new Web3(web3.currentProvider);
        }
    }

    requestSigning(chal, addr)
    {
        return new Promise((res) => {
            this.w3.personal.sign(chal, addr, "", (err, sig)=>{
                res(sig);
            });
        });
    }

    async getMainAccount()
    {
        return await this.w3.eth.accounts[0];
    }
}

export {MMInterface}
