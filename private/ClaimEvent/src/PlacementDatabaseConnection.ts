import * as EventEmitter from 'events';
import {MongoClient} from 'mongodb';

class PlacementDatabaseConnection extends EventEmitter
{
    setupSemaphore: boolean;
    MongoDatabaseLink: any;
    AllocationDatabaseLink: any;
    contributorCollection: any;
    allocationResultsCollection: any;
    approvedCollection: any;
    plotsCollection: any;
    claimCollection: any;
    adminsCollection: any;
    configCollection: any;
    
    constructor()
    {
        super();
        this.setupSemaphore = false;
        this.on("databaseIsReady", (() => {
            this.setupSemaphore = true;
        }).bind(this))

        MongoClient.connect("mongodb://localhost:27017/",{ useNewUrlParser: true }, ((err: any,MongoDatabaseLink: any) => {
            this.MongoDatabaseLink = MongoDatabaseLink;
            this.buildCollectionRefs();
            console.log("MongoDB connection established...")
            this.emit("databaseIsReady", true);
        }).bind(this))
    }

    buildCollectionRefs()
    {
        this.AllocationDatabaseLink = this.MongoDatabaseLink.db("AllocationEvent");

        this.contributorCollection = this.AllocationDatabaseLink.collection("Contributors");
        this.allocationResultsCollection = this.AllocationDatabaseLink.collection("AllocationResults");
        this.approvedCollection = this.AllocationDatabaseLink.collection("Approved");
        this.plotsCollection = this.AllocationDatabaseLink.collection("Plots");
        this.claimCollection = this.AllocationDatabaseLink.collection("Claimed");
        this.adminsCollection = this.AllocationDatabaseLink.collection("Admins");
        this.configCollection = this.AllocationDatabaseLink.collection("Config");
    }

    async finished()
    {
        return new Promise(((res: { (): void; (): void; }) =>{
            if (this.setupSemaphore)
                res();
            this.on("databaseIsReady", (() => {
                res();
            }).bind(this))
        }).bind(this))
    }
}

export {PlacementDatabaseConnection}
