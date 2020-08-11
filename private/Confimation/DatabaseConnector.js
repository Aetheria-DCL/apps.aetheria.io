//connectes applications to the mongo database
//all apps but AllocationEvent run on it

const MongoClient = require('mongodb').MongoClient;

module.exports = async () => {
    this.MongoDatabaseLink = new MongoClient("mongodb://localhost:27017/");
    await this.MongoDatabaseLink.connect();
    
    this.AllocationDatabaseLink = this.MongoDatabaseLink.db("AllocationEvent");
    
    this.contributorCollection = this.AllocationDatabaseLink.collection("Contributors");
    this.allocationResultsCollection = this.AllocationDatabaseLink.collection("AllocationResults");
    this.approvedCollection = this.AllocationDatabaseLink.collection("Approved");

    this.Contribs = new Proxy({}, { //read only 
        get: (async function(obj, prop)
        {
            contributionObject = await this.contributorCollection.findOne({address: prop});
            try {
                return contributionObject.contribution;
            } catch (e) {
            return 0;
        }
        }).bind(this)
    });
    
    this.Store = new Proxy({}, {
        get: (async function(obj, prop)
        {
            if(prop == "all")
            {
                var totalCollectionPromise = await this.allocationResultsCollection.find({});
                var totalCollectionArray = await totalCollectionPromise.toArray();
                var retval = {};
                for (i = 0; i < totalCollectionArray.length; i++)
                {
                    retval[totalCollectionArray[i].addr] = totalCollectionArray[i]
                }
                return retval;
            }
            return this.allocationResultsCollection.findOne({addr: prop});
        }).bind(this),
        set: (function(obj, prop, value)
        {
            this.allocationResultsCollection.replaceOne(
                {addr: prop}, //find one with the address
                value, //replace it with the value
                {
                    upsert: true //if no document make a new one
                }
            )
        }).bind(this)
    })
    
    this.Approved = new Proxy({}, {
        get: (async function(obj, prop)
        {
            if(prop == "all")
            {
                var approvedCollectionPromise = await this.approvedCollection.find({});
                var approvedArray =  await approvedCollectionPromise.toArray()
                return approvedArray.map(x => x.addr);
            }
            return this.approvedCollection.countDocuments({addr: prop}, {limit: 1}) == 1
        }).bind(this),
        set: (function(obj, prop, value)
        {
            if(value) //add object if it already exists replace
            {
                this.approvedCollection.replaceOne(
                    {addr: prop}, 
                    {addr: prop},
                    {
                        upsert: true
                    }
                )
            }
            else //remove object
            {
                this.approvedCollection.findOneAndDelete(
                    {addr: prop}
                )
            }
        }).bind(this)
    });

    console.log("Database Connection Successful..")
    return this;
}
