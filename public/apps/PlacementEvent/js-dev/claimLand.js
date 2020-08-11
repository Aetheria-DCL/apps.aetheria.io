import {delegationAbi, delegationAddress} from './delegationConnector.js';

class ClaimLandUI {
    constructor (socket, web3Interface) {
        this.web3Instance = web3Interface.w3
        this.delegationContract = this.web3Instance.eth.contract(delegationAbi).at(delegationAddress);
        this.socket = socket;
        this.button = document.createElement("input")
        this.button.type = "button";
        this.button.value = "Save Land Claim";
        this.button.className = "sendTx";
        this.button.onclick = this.claimLand.bind(this);
        this.button.disabled = true;
        this.socket.on("landHoldingsUpdated", (() => {
            this.button.disabled = false;
        }).bind(this))
    }

    initButton(result)
    {
        document.getElementsByTagName("body")[0].appendChild(this.button);
    }

    buf2hex(buffer) {
        return "0x"+Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    claimLand()
    {
        this.button.disabled = true;
        this.socket.emit("buildPlacementTx", {});
        this.socket.once("placementUpdateTx", ((msg) => {
            let nonce = parseInt(msg.nonce._hex);
            let r = this.buf2hex(msg.r);
            let s = this.buf2hex(msg.s);
            this.delegationContract.updatePlot(this.web3Instance.eth.accounts[0],msg.plotIds,nonce,msg.v,r,s,console.log)
        }).bind(this));

    }
}

export {ClaimLandUI};