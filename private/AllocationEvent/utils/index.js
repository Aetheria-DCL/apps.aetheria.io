//this file will create the database and the collections
//it will also then require a json document to be inserted with all the contributors in it

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/", async (err, database) => {
	if (err) throw err;
	var db = database.db("AllocationEvent")
	createDatabaseCollections(db);
	populateContributorList(db)
})

function createDatabaseCollections(db)
{
console.log("Adding Database Collections...");

['AllocationResults', 'Approved', 'Contributors', 'Plots', 'Votes', 'Admins', 'Config'].forEach((el) => {
	console.log("Adding " + el + "...")
	db.createCollection(el)
});
}

function populateContributorList(db)
{
console.log("Populating Contributor List...");
var contribs =  require("../Contributors.json")
var contribCollection = db.collection("Contributors")
for (var key in contribs)
{
	console.log("Inserting "+ key + "...")
	contribCollection.insertOne({address: key, contribution: contribs[key]});
}
}

