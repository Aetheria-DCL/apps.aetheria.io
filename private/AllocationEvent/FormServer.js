#!/usr/bin/env nodejs
/*  
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const https = require("https");
const http = require("http");
const express = require("express");
const socketIO = require('socket.io');

const MongoClient = require('mongodb').MongoClient;
const MongoDatabaseLink = new MongoClient("mongodb://localhost:27017/");

var AllocationDatabaseLink, contributorCollection, allocationResultsCollections, approvedCollection;

(async() => {
	await MongoDatabaseLink.connect();
	
	AllocationDatabaseLink = MongoDatabaseLink.db("AllocationEvent");
	
	contributorCollection = AllocationDatabaseLink.collection("Contributors");
	allocationResultsCollection = AllocationDatabaseLink.collection("AllocationResults");
	approvedCollection = AllocationDatabaseLink.collection("Approved")
})();

var fs = require('fs');
var web3 = require('ethereum.js');
var util = require('ethereumjs-util');

const Contribs = new Proxy({}, { //read only 
    get: async function(obj, prop)
    {
	contributionObject = await contributorCollection.findOne({address: prop});
        try {
        	return contributionObject.contribution;
        } catch (e) {
		return 0;
	}
    }
});

const Store = new Proxy({}, {
    get: async function(obj, prop)
    {
        if(prop == "all")
        {
	    var totalCollectionPromise = await allocationResultsCollection.find({});
            var totalCollectionArray = await totalCollectionPromise.toArray();
            var retval = {};
            for (i = 0; i < totalCollectionArray.length; i++)
            {
                retval[totalCollectionArray[i].addr] = totalCollectionArray[i]
            }
            return retval;
        }
        return allocationResultsCollection.findOne({addr: prop});
    },
    set: function(obj, prop, value)
    {
        allocationResultsCollection.replaceOne(
            {addr: prop}, //find one with the address
            value, //replace it with the value
            {
                upsert: true //if no document make a new one
            }
        )
    }
})

var Approved = new Proxy({}, {
    get: async function(obj, prop)
    {
        if(prop == "all")
        {
            var approvedCollectionPromise = await approvedCollection.find({});
	    var approvedArray =  await approvedCollectionPromise.toArray()
            return approvedArray.map(x => x.addr);
        }
        return approvedCollection.countDocuments({addr: prop}, {limit: 1}) == 1
    },
    set: function(obj, prop, value)
    {
        if(value) //add object if it already exists replace
        {
            approvedCollection.replaceOne(
                {addr: prop}, 
                {addr: prop},
                {
                    upsert: true
                }
            )
        }
        else //remove object
        {
            approvedCollection.findOneAndDelete(
                {addr: prop}
            )
        }
    }
});


let DEBUG = false;
if(DEBUG)
    console.log("Debug Mode Enabled")

const port = 10000;
var io, server;

if (DEBUG)
{
    server = http.createServer(express());
    io = socketIO(server);
}
else
{
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/aetheria.io/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/aetheria.io/cert.pem')
    }
    server = https.Server(options, express());
    io = socketIO(server);
}

io.on('connection', function(socket){
    socket.on("GetLandCount", async function(data) {
        if (isItClosingTime())
            return;
        if(DEBUG)
        {
            socket.emit("LandCount", 1);
            return;
        }
        var landCount = await Contribs[data.addr]
        socket.emit("LandCount", landCount);
    });
    socket.on("FormSubmit", async function(data) {
        if (isItClosingTime())
            return;
        obj = JSON.parse(data.form);
	prefix = new Buffer("\x19Ethereum Signed Message:\n");
        msg = util.sha3(data.form);
	prefixedmsg = util.sha3(Buffer.concat([prefix, new Buffer(String(msg.length)) ,msg]))
	console.log(msg)
        //msg = web3.sha3(data.form)
        
        //sig verify
        var {v, r, s} = util.fromRpcSig(data.sig);
        pubKey = util.ecrecover(util.toBuffer(prefixedmsg), v, r, s);
        addrBuf = util.pubToAddress(pubKey);
        addr    = util.bufferToHex(addrBuf);

        if(addr !== obj.addr)
        {
            socket.emit("DidItWork", false);
            return;
        }

        //verify if data is correct
	isVerified = await VerifyData(obj);
	console.log(isVerified)
        if(isVerified)
        {
            Store[obj.addr] = obj; //store the data
        }
	    socket.emit("DidItWork", isVerified);
    });
    socket.on("PING", (data) => {
        socket.emit("PONG", "");
    });
    
    if (isItClosingTime())
        socket.emit("ClosingTime", "");
});
server.listen(port, () => console.log(`Socket listening on ${port}`))


function isItClosingTime()
{
    var now = new Date();
    var countDownDate = new Date("Mar 1, 2019 23:59:00");
    if (now > countDownDate)
        return true;
    return false;
}

async function VerifyData(data) {
    if(DEBUG) {
        return true;
    }
    else
    {
        contrib = await Contribs[data.addr]; //get their contribution
        
        if(contrib !== (data.public + data.private) || data.public < 0 || data.private < 0)
            return false;
    
        x = 0;
        for(i = 0; i < data.plots.length; i++)
        {
            if((data.plots[i].x < 0 || data.plots[i].y < 0) || (data.plots[i].x % 1 !== 0 || data.plots[i].y % 1 !== 0))
                return false; 
            x += data.plots[i].x * data.plots[i].y;
        }
        if(x !== data.private) //does it sum up to what they said they would commit
            return false;

        return true;
    }
}
