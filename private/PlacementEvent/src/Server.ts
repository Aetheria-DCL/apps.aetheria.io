import * as https from 'https';
import * as http from 'http';
import * as express from 'express';
import * as socketIO from 'socket.io';
import * as getenv from 'getenv';

type AccessLevel = false | "admin" | "approved" | "contributor";

type SocketInstance = {
    addr: string;
    accesslevel: AccessLevel;
    isAuthed : boolean;
    on: (eventName : string, callback: any) => void;
    once: (eventName : string, callback: any) => void;
    removeAllListeners: (handlers: string[]) => void;
    emit: {
        (agr0 : string, agr1 : any): void;
        (arg0: string, arg1: any): void;
    }
}

interface SocketGroup {
    [key: string] : SocketInstance;
}

class Server
{
    serverOptions : any;
    server : any;
    io : any;
    app: any;

    constructor()
    {
        switch(getenv("PLACEMENTEVENTMODE", "windowsLocalDev"))
        {
            case "windowsLocalDev":
                this.serverOptions = require("../options/Dev")
                break;
            case "linuxProduction":
                this.serverOptions = require("../options/Production")
                break;
            default:
                this.serverOptions = require("../options/Production")
        }

        this.setupInstance(this.serverOptions);

    }

    setupInstance(serverOptions: any)
    {
        this.app = express();
        this.server = serverOptions._https ? new https.Server(serverOptions, this.app) : http.createServer(this.app);
        this.io = socketIO(this.server);

        let port = serverOptions.port;

        this.server.listen(port, (() => {
            console.log(`${serverOptions._https ? "ProdInstance" : "DevInstance"}: Socket listening on ${port}`)
        }).bind(this));
    }    
}

export {Server, SocketInstance, SocketGroup, AccessLevel};