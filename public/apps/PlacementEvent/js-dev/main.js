import io from './lib/socket.io-client';

import {Authenticator} from './authenticator';
import {UserInterface} from './userInterface';
import {MMInterface} from './metamaskInterface';

class WebApp 
{
    constructor(debug)
    {
        let metamaskInstance = new MMInterface();
        let socket = this.buildSocket(debug);

        let uiInstance = new UserInterface(socket, metamaskInstance);
        let auth = new Authenticator(socket, metamaskInstance, (data) => {
            uiInstance.authed(data);
        });
        auth.startAuth();
    }

    buildSocket(DEBUG)
    {
        let socket = null;
        if (DEBUG) {
            socket = io("localhost:10002");
        } else {
            socket = io("apps.aetheria.io:10002");
        }
        return socket;
    }
}

function isLocalDev()
{
    return !window.location.href.includes("aetheria.io")
}

new WebApp(isLocalDev());
