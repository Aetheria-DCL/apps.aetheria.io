//this file will create the database and the collections
//it will also then require a json document to be inserted with all the contributors in it

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/?authMechanism=DEFAULT&authSource=admin", async (err, database) => {
	if (err) throw err;
	var db = database.db("AllocationEvent");
	var res = require("../Results.json");
	var approved = require("../Approved.json");
	
	var approvedCollection = db.collection("Approved");
	var allocationResultCollection = db.collection("AllocationResults");
	
	approved.forEach(addr => {
		approvedCollection.insertOne({addr: addr});
	});
	
	for (var key in res)
	{
		allocationResultCollection.insertOne(res[key]);
	}
})
