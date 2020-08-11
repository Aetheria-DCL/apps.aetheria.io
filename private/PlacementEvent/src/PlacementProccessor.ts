import {MapHandler} from './MapHandler';
import { Authenticator } from './Auth';
import { SocketInstance, SocketGroup, AccessLevel } from './Server';
import { PlacementDatabaseConnection } from './PlacementDatabaseConnection';
import { EventEmitter } from 'events';
import { PlacementTxBuilder } from './PlacementTxBuilder';

type PlotCords = {
    x: number;
    y: number;
}

type BulkSetAction = {
    startPlot: PlotCords;
    endPlot: PlotCords;
    p_type: string;
}

type MapAction =  { cords: PlotCords; p_type: string; }

class PlacementProccessor
{
    mapHandlerInstance : MapHandler;
    mapEvents : EventEmitter;
    map: any;
    databaseConnection: PlacementDatabaseConnection;
    logger: any;
    remainingLandAmounts: {[key:string]: number};
    sockets: SocketGroup;
    txBuilder: PlacementTxBuilder;

    constructor(authenticator : Authenticator, databaseConnection : PlacementDatabaseConnection)
    {
        authenticator.onAuthed.push(this.setupPlacementHandlers.bind(this));

        this.mapHandlerInstance = new MapHandler(databaseConnection);
        this.txBuilder = new PlacementTxBuilder();
        this.mapEvents = this.mapHandlerInstance.events;
        this.map = this.mapHandlerInstance.mapInterface.map;
        this.setupMapHandlers(this.mapEvents);

        this.databaseConnection = databaseConnection;
        this.logger = null;
        this.remainingLandAmounts = {};
        this.sockets = {}
    }

    async setupPlacementHandlers(socket : SocketInstance)
    {
        this.syncPrivateLandCount(socket)
        let mapData = await this.map["dump"];
        socket.emit('mapUpdate', {type: "dump", plots: mapData});
        this.sockets[socket.addr] = socket;
        socket.on('disconnect', (() => {
            delete this.sockets[socket.addr];
        }).bind(this))

        this.socketOnOnce(socket, 'setTile', (async (data: MapAction) => {
            if(!this.isValidTypeForAccesslevel(data.p_type, socket.accesslevel))
                return;
            await this.applyLandUpdate(data.cords, data.p_type, socket.addr);
            await this.syncPrivateLandCount(socket)
            socket.emit("landHoldingsUpdated", {});
        }).bind(this));

        this.socketOnOnce(socket, 'bulkSet', (async (data : BulkSetAction) => {
            let xDirection = data.endPlot.x > data.startPlot.x;
            let yDirection = data.endPlot.y > data.startPlot.y;
            for (var x = data.startPlot.x; x != data.endPlot.x; xDirection ? x++ : x--)
            {
                for (var y = data.startPlot.y; y != data.endPlot.y; yDirection ? y++ : y--)
                {   
                    await this.applyLandUpdate({x: x, y: y}, data.p_type, socket.addr);
                }
            }
            await this.syncPrivateLandCount(socket);
            socket.emit("landHoldingsUpdated", {});
        }).bind(this))

        socket.on("buildPlacementTx", (async () => {
            let plots = this.databaseConnection.plotsCollection.find({addr:socket.addr})
            let plotArray = await plots.toArray();
            let txRet = await this.txBuilder.buildTx(plotArray, socket.addr);
            socket.emit("placementUpdateTx", txRet)
        }))
    }

    async applyLandUpdate(cords : PlotCords, p_type : string, addr : string)
    {
        let stringCords = JSON.stringify(cords);
        switch(p_type)
        {
            case "unAlloc":
                let plot = await this.map[stringCords];
                if (plot.addr != addr) {return;}
                delete this.map[stringCords];
                this.updatePrivateLandCount((await this.map[stringCords]).addr, 1);
                break;
            case "alloc":
                if(!this.hasEnoughRemainingLand(addr))
                    return;
                if( await this.isCurrentlyUsedTile(cords))
                    return;
                this.updatePrivateLandCount(addr, -1);
                this.map[stringCords] = {addr: addr, p_type: p_type};
                break;
            case "adminRemove":
                if(await this.isPrivateUsedTile(cords))
                    this.updatePrivateLandCount((await this.map[stringCords]).addr, 1);
                delete this.map[stringCords];
                break;
            default:
                if(await this.isCurrentlyUsedTile(cords))
                    return;
                this.map[stringCords] = {addr: "DISTRICT_LAND", p_type: p_type};
        }
    }

    setupMapHandlers(mapEvents : EventEmitter)
    {
        mapEvents.on("update", this.mapUpdate.bind(this));
    }

    mapUpdate(updateMessage: any)
    {
        Object.keys(this.sockets).forEach(key => {
            this.sockets[key].emit("mapUpdate", updateMessage);
        });
    }

    async isCurrentlyUsedTile(cords: PlotCords)
    {
        let plot = await this.map[JSON.stringify(cords)];
        return plot.p_type != null  
    }

    async isPrivateUsedTile(cords: any)
    {
        let plot = await this.map[JSON.stringify(cords)];
        return plot.p_type == "alloc";
    }

    hasEnoughRemainingLand(address: string)
    {
        return this.remainingLandAmounts[address] > 0;
    }

    isValidTypeForAccesslevel(p_type: string, level: AccessLevel)
    {
        if(level == "admin")
            return true;
        if (p_type == "unAlloc" || p_type == "alloc")
            return true;
        return false;
    }

    updatePrivateLandCount(addr: string, countChange: number) //updates the internal land count to stop a plot being placed multiple times
    {
        if (addr == undefined) {return;}
        this.remainingLandAmounts[addr] = this.remainingLandAmounts[addr] + countChange;
    }

    async syncPrivateLandCount(socket: SocketInstance) { //recalculates the land count completely and syncs to the user
        if (socket == undefined) {return;} //handle private land count updates without a open user socket

        let allocationResults = await this.databaseConnection.allocationResultsCollection.find({addr: socket.addr})
        let resultArray = await allocationResults.toArray();
        if(resultArray.length < 1)
        {
            socket.emit("ERROR", null);
            return;
        }
        let totalPrivate = resultArray[0].private;

        let placedPlots = await this.databaseConnection.plotsCollection.find({addr: socket.addr});
        let plotArray = await placedPlots.toArray();

        this.remainingLandAmounts[socket.addr] = totalPrivate - plotArray.length;

        socket.emit('currentPrivateLandCount', this.remainingLandAmounts[socket.addr]);
    }

    socketOnOnce(socket: SocketInstance, subject: string, boundUpdate: Function)
    {
        let listener = (msg: any) => {
            boundUpdate(msg)
            socket.once(subject, listener)
        }
        socket.once(subject, listener)
    }
}

export {PlacementProccessor}
