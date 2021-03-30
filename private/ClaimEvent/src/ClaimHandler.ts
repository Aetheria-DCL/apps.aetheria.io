import {PlacementDatabaseConnection} from './PlacementDatabaseConnection';
import {SocketInstance} from './Server';
import {Authenticator} from './Auth';
import { PlacementTxBuilder } from './PlacementTxBuilder';

class ClaimHandler {
    dbConnection: PlacementDatabaseConnection;
    txBuilder: PlacementTxBuilder;
    constructor(authenticator : Authenticator, db : PlacementDatabaseConnection) {
        this.dbConnection = db;
        this.txBuilder = new PlacementTxBuilder();
        authenticator.onAuthed.push(this.setupHandlers.bind(this));
    }

    flagPlotsAsClaimed (plots: any) {
        try {
            this.dbConnection.claimCollection.insertMany(plots, {ordered:false});
        } catch (e) {
            console.error("Error from plot flag: " + e);
        }
    }

    async getUserPlots (addr: String) {
        let plots = this.dbConnection.plotsCollection.find({addr:addr})
        return plots.toArray();
    }

    setupHandlers(socket : SocketInstance) {
        socket.on("buildTx", (async () => {
            let plotArray = await this.getUserPlots(socket.addr.toLowerCase());
            let txRetPromised : any = await this.txBuilder.buildManyTx(plotArray, socket.addr)
            let txRet = await Promise.all(txRetPromised);
            socket.emit("claimTx", txRet);
        }));
        socket.on("listLands", async () => {
            let plotArray = await this.getUserPlots(socket.addr);
            socket.emit("landList", plotArray);
        });
    }
}

export {ClaimHandler};
