const https = require("https");
const express = require("express");
const socketIO = require('socket.io');
const uuid = require('uuid')
var EventEmitter = require("events")

var fs = require('fs');
var web3 = require('ethereum.js');
var util = require('ethereumjs-util');

var mongoConnector = require("./DatabaseConnector");
var mongoConnection;

(async () => {
	mongoConnection = await mongoConnector();
	console.log("Mongo connection ready...")
})();

const port = 10001;
var io, server;

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/aetheria.io/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/aetheria.io/cert.pem')
}
server = https.Server(options, express());
io = socketIO(server);

class KeyGenerator extends EventEmitter
{
    constructor()
    {
        super();
        this.validKey = uuid();
        console.log("Key is, " + this.validKey)

        setInterval((() => {
            this.validKey = uuid();
            this.emit("newKey", this.validKey);
            console.log("Key is, " + this.validKey)
        }).bind(this), 1200000) //every 20 mins
    }
}

var keyGenerator = new KeyGenerator();

io.on('connection', function(socket) {

    socket.emit("newKey", keyGenerator.validKey);

    keyGenerator.on("newKey", (newKey) => {
        socket.emit("newKey", newKey)
    });

    socket.on("authAttempt", async (data) => {
        //check if key is valid
        if(data.key != keyGenerator.validKey)
        {
            socket.emit("authFail", "Invalid Key");
            return;
        }
        try
        {
        msgBuffer = util.toBuffer(data.key);
        msgHash = util.hashPersonalMessage(msgBuffer);
        signatureBuffer = util.toBuffer(data.sig);
        signatureParams = util.fromRpcSig(signatureBuffer);
        publicKey = util.ecrecover(
          msgHash,
          signatureParams.v,
          signatureParams.r,
          signatureParams.s
        );
        addressBuffer = util.publicToAddress(publicKey);
        addr = util.bufferToHex(addressBuffer);
        console.log(addr);
        }
        catch (err)
        {
            console.log("error", err)
        }
	
        if(mongoConnection.Store[addr] == undefined)
        {
            socket.emit("authFail", "Invalid Address")
            return;
        }

        var isApproved = await mongoConnection.Approved[addr];
	var results = await mongoConnection.Store[addr];
        socket.emit("Results", {results: results, wasApproved: isApproved})
    });
});

server.listen(port, () => console.log(`Socket listening on ${port}`))
