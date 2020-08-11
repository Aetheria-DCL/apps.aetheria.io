import {delegationAbi, delegationAddress} from './delegationConnector.js';

class Claimer {
    constructor(socket, metamaskInstance) {
        this.socket = socket;
        this.metamaskInstance = metamaskInstance;
        this.delegationContract = this.metamaskInstance.w3.eth.contract(delegationAbi).at(delegationAddress);
        this.socket.on("claimTx", this.runClaim.bind(this));
    }

    buf2hex(buffer) {
        return "0x"+Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    runClaim(msg)
    {
        msg.forEach(((claim) => {
            let nonce = parseInt(claim.nonce._hex);
            let r = this.buf2hex(claim.r);
            let s = this.buf2hex(claim.s);
            this.delegationContract.updatePlot(
                this.metamaskInstance.w3.eth.accounts[0],
                claim.plotIds,
                nonce,
                claim.v,
                r,
                s,
                ()=>{}
            );
        }).bind(this))
    }
}

export {Claimer};
