import * as EventEmitter from 'events';
import {PlacementDatabaseConnection} from './PlacementDatabaseConnection';

type MapAction = { [x: string]: { addr: any; p_type: any; }};

//returns the maps proxy object
class MapHandler
{
    databaseConnection: PlacementDatabaseConnection;
    handlers: { get: any; set: any; deleteProperty: any; };
    mapCache: {};
    mapInterface: { map: {}; events: any; };
    events: EventEmitter;

    constructor(databaseConnection: PlacementDatabaseConnection)
    {
        this.databaseConnection = databaseConnection
        this.mapCache = {};
        this.handlers = {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.deleteProperty.bind(this)
        }
        this.events = new EventEmitter();
        this.mapInterface = {
            map: new Proxy(this.mapCache, this.handlers),
            events: this.events
        }
    }

    async dbDump()
    {
        let plotsCursor = await this.databaseConnection.plotsCollection.find();
        let plots = await plotsCursor.toArray();
        let formatedPlots : any = {};
        for (let i = 0; i < plots.length; i++)
        {
            formatedPlots[JSON.stringify(plots[i].cords)] = {addr: plots[i].addr, p_type: plots[i].p_type};
        }

        return formatedPlots; //return mapping
    }

    async get(target: MapAction, key: string)
    {
        if(key == "dump")
        {
            return this.dbDump(); //allow us to request whole map...
        }

        let deserialisedKey = JSON.parse(key)

        if(target[key] != undefined)
            return target[key]; //simple mapping lookup
        
        let plotCursor = await this.databaseConnection.plotsCollection.find({cords: deserialisedKey});
        let plotArr = await plotCursor.toArray();

        if (plotArr.length == 0)
            return {addr: "0x0", p_type: null};

        let rawPlot = plotArr[0];
        let formatedPlot = {addr: rawPlot.addr, p_type: rawPlot.p_type}; //remove cords from the plot raw
        
        target[key] = formatedPlot; //add to cache

        return formatedPlot;
    }

    async set(target: { [x: string]: { addr: any; p_type: any; }; }, location: string, value: { addr: any; p_type: any; })
    {
        let deserialisedKey = JSON.parse(location)
        let setterAddr = value.addr;
        let p_type = value.p_type;
        target[location] = {addr: setterAddr, p_type: p_type}; //cache for future
        this.databaseConnection.plotsCollection.replaceOne(
            {cords: deserialisedKey}, 
            {cords: deserialisedKey, addr: setterAddr, p_type: p_type},
            {
                upsert: true
            }
        )
        this.events.emit("update", {type: "addition", location: deserialisedKey, plot: {addr: setterAddr, p_type: p_type}})

        return true;
    }

    async deleteProperty(target: { [x: string]: any; }, key: string)
    {
        let deserialisedKey = JSON.parse(key)
        delete target[key];
        this.databaseConnection.plotsCollection.findOneAndDelete({cords: deserialisedKey});
        this.events.emit("update", {type: "removal", location: deserialisedKey});
        return true;
    }

}

export {MapHandler}