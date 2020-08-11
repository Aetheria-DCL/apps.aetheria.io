import io from './lib/socket.io-client';

import {Authenticator} from './authenticator';
import {MMInterface} from './metamaskInterface';
import {Claimer} from './claimer';

import Swal from './lib/Swal'; //sweet alert

class WebApp 
{
    constructor(debug)
    {
        this.isAuthed = false;
        this.metamaskInstance = new MMInterface();
        this.socket = this.buildSocket(debug);

        new Authenticator(this.socket, this.metamaskInstance).startAuth(() => {
            this.isAuthed = true;
            this.displayInstructions();
        });
        
        new Claimer(this.socket, this.metamaskInstance);
    }

    displayInstructions()
    {
        document.getElementById("dialog").style.display = 'block';
        document.getElementById("dclAtlas").href = `https://land.decentraland.org/address/${this.metamaskInstance.w3.eth.accounts[0]}/parcels?page=1`
    }

    async claimLand()
    {
        let hasClaimedBefore = window.localStorage.getItem("hasClaimed");
        if (hasClaimedBefore)
        {
            let shouldContinue = await Swal.fire({
                title: 'You have already used the claim app!',
                text: 'Are you sure you want to continue? Another claim will cost you more tx fees.',
                showCancelButton: true,
                icon: 'warning',
                confirmButtonText: 'Continue',
                cancelButtonText: 'Cancel Claim',
                reverseButtons: true
            });
            if (!shouldContinue) {return;};
        }
        this.socket.emit("buildTx", {});
        window.localStorage.setItem("hasClaimed", true);
    }

    downloadLands()
    {
        this.socket.emit("listLands", {});
        this.socket.on("landList", (landList) => {
            let jsonCordList = landList.map(plotObj => plotObj.cords);
            let cordList = jsonCordList.map(cordObj => `"${cordObj.x},${cordObj.y}",\n`);
            cordList[cordList.length-1].slice(cordList.length-2,1); //removes the comma
            let fileBlob = new Blob(cordList, {type: 'text/plain'});
            window.open(window.URL.createObjectURL(fileBlob));
        })
    }

    buildSocket(DEBUG)
    {
        let socket = null;
        if (DEBUG) {
            socket = io("localhost:10004");
        } else {
            socket = io("apps.aetheria.io:10004");
        }
        return socket;
    }


}


function isLocalDev()
{
    return !window.location.href.includes("aetheria.io")
}

window.appInstance = new WebApp(isLocalDev());
