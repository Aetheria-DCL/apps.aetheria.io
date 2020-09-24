"use strict";
exports.__esModule = true;
var https = require("https");
var http = require("http");
var express = require("express");
var socketIO = require("socket.io");
var getenv = require("getenv");
var Server = (function () {
    function Server() {
        switch (getenv("PLACEMENTEVENTMODE", "windowsLocalDev")) {
            case "windowsLocalDev":
                this.serverOptions = require("../options/Dev");
                break;
            case "linuxProduction":
                this.serverOptions = require("../options/Production");
                break;
            default:
                this.serverOptions = require("../options/Production");
        }
        this.setupInstance(this.serverOptions);
    }
    Server.prototype.setupInstance = function (serverOptions) {
        this.app = express();
        this.server = serverOptions._https ? new https.Server(serverOptions, this.app) : http.createServer(this.app);
        this.io = socketIO(this.server);
        var port = serverOptions.port;
        this.server.listen(port, (function () {
            console.log((serverOptions._https ? "ProdInstance" : "DevInstance") + ": Socket listening on " + port);
        }).bind(this));
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=Server.js.map