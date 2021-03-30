import {deedAbi, deedAddr} from './delegationConnector.js';

class Claimer {
    constructor(socket, metamaskInstance) {
        this.socket = socket;
        this.metamaskInstance = metamaskInstance;
        this.deedContract = new this.metamaskInstance.w3.eth.Contract(deedAbi,deedAddr);
        this.socket.on("claimTx", this.runClaim.bind(this));
    }

    buf2hex(buffer) {
        return "0x"+Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    runClaim(msg)
    {
        msg.forEach((async (claim) => {
            let nonce = claim.nonce;
            let r = this.buf2hex(claim.r);
            let s = this.buf2hex(claim.s);
	    let addr = await this.metamaskInstance.getMainAccount();
	    this.deedContract.methods.claimLandTokens(
                addr,
                claim.plotIds,
                nonce,
                claim.v,
                r,
                s
            ).send({from: addr});
        }).bind(this))
    }
}

export {Claimer};
