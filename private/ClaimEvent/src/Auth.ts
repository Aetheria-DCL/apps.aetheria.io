import * as uuid from 'uuid';
import * as util from 'ethereumjs-util';

import {PlacementDatabaseConnection} from './PlacementDatabaseConnection';
import {SocketInstance} from './Server';

class Authenticator 
{
    dbConnection: PlacementDatabaseConnection;
    validChallanges: {[key:string]: string};
    onAuthed: Function[];
    
    constructor(io: any, db : PlacementDatabaseConnection)
    {
        this.onAuthed = [];
        this.dbConnection = db;
        io.on('connection', ((socket: SocketInstance) => {
            this.buildAuthenticationHandlers(socket);
        }).bind(this));
        this.validChallanges = {};
    }

    generateChallange(addr : string)
    {
        this.validChallanges[addr] = "Claim Event Auth Token: " + uuid();
        return this.validChallanges[addr];
    }

    verify(addr : string, sig: any)
    {
        try {
            let msgBuffer = Buffer.from(this.validChallanges[addr], 'utf8');
            let msgHash = util.hashPersonalMessage(msgBuffer);
            let signatureBuffer = util.toBuffer(sig);
            // @ts-ignore
            let signatureParams = util.fromRpcSig(signatureBuffer);
            let publicChallange = util.ecrecover(
                msgHash,
                signatureParams.v,
                signatureParams.r,
                signatureParams.s
            );
            let addressBuffer = util.pubToAddress(publicChallange);
            let resultAddr = util.bufferToHex(addressBuffer);
            return (resultAddr == addr);
        } catch (e) {
            console.log(`${addr} sent "${sig}" and caused and error "${e}"`);
            return false; 
        }
    }

    buildAuthenticationHandlers(socket : SocketInstance)
    {
        socket.isAuthed = false;
        socket.on("startAuth", (async (addr : string) => {
            socket.accesslevel = await this.isMemberOfCurrentAllowedGroup(addr);
            if (!socket.accesslevel)
            {
                socket.emit("authError", "Not Member Of Currently Allowed Group");
                return;
            }

            socket.addr = addr;
            socket.emit("authChallange", this.generateChallange(addr));
        }).bind(this));

        socket.on("authAttempt", ((sig: any) => {
            let isVerified = this.verify(socket.addr, sig)
            let isAdmin = (socket.accesslevel == 'admin')
            socket.emit("authResult", {isSuccess: isVerified, isAdmin: isAdmin, addr: socket.addr});
            this.buildAuthCleanup(socket)(); //build cleaner and run
            if(isVerified)
            {
                socket.emit("accessLevel", socket.accesslevel)
                this.onAuthed.map((x:Function)=>x(socket));
            }
        }).bind(this));

        socket.on('disconnect', this.buildAuthCleanup(socket)) //build cleaner then run on disconnect
    }

    buildAuthCleanup(socket: SocketInstance) //returns a listner
    {
        return (() => {
            socket.removeAllListeners(['disconnect']); //removes the listner for disconnect
            delete this.validChallanges[socket.addr];
        }).bind(this);
    }

    async isMemberOfCurrentAllowedGroup(addr: string)
    {
        var totalCollectionPromise = await this.dbConnection.configCollection.find({});
        var configArray = await totalCollectionPromise.toArray();

        let restrictionLevel = configArray[0].currentMode; //0: admins, 1: approved, 2: everyone
        if (restrictionLevel >= 0)
        {
            let adminMatchingCount = await this.dbConnection.adminsCollection.countDocuments({addr: addr}, {limit: 1})
            if (adminMatchingCount == 1)
            {
                return "admin";
            }
        }
        if (restrictionLevel >= 1)
        {
            let approvedMatchingCount = await this.dbConnection.approvedCollection.countDocuments({addr: addr}, {limit: 1})
            if (approvedMatchingCount == 1)
            {
                return "approved";
            }
        }

        if (restrictionLevel == 2)
            return "contributor";

        return false;
    }
}

export {Authenticator};