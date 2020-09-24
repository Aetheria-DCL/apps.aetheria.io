"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var MapHandler_1 = require("./MapHandler");
var PlacementTxBuilder_1 = require("./PlacementTxBuilder");
var PlacementProccessor = (function () {
    function PlacementProccessor(authenticator, databaseConnection) {
        authenticator.onAuthed.push(this.setupPlacementHandlers.bind(this));
        this.mapHandlerInstance = new MapHandler_1.MapHandler(databaseConnection);
        this.txBuilder = new PlacementTxBuilder_1.PlacementTxBuilder();
        this.mapEvents = this.mapHandlerInstance.events;
        this.map = this.mapHandlerInstance.mapInterface.map;
        this.setupMapHandlers(this.mapEvents);
        this.databaseConnection = databaseConnection;
        this.logger = null;
        this.remainingLandAmounts = {};
        this.sockets = {};
    }
    PlacementProccessor.prototype.setupPlacementHandlers = function (socket) {
        return __awaiter(this, void 0, void 0, function () {
            var mapData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.syncPrivateLandCount(socket);
                        return [4, this.map["dump"]];
                    case 1:
                        mapData = _a.sent();
                        socket.emit('mapUpdate', { type: "dump", plots: mapData });
                        this.sockets[socket.addr] = socket;
                        socket.on('disconnect', (function () {
                            delete _this.sockets[socket.addr];
                        }).bind(this));
                        this.socketOnOnce(socket, 'setTile', (function (data) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!this.isValidTypeForAccesslevel(data.p_type, socket.accesslevel))
                                            return [2];
                                        return [4, this.applyLandUpdate(data.cords, data.p_type, socket.addr)];
                                    case 1:
                                        _a.sent();
                                        return [4, this.syncPrivateLandCount(socket)];
                                    case 2:
                                        _a.sent();
                                        socket.emit("landHoldingsUpdated", {});
                                        return [2];
                                }
                            });
                        }); }).bind(this));
                        this.socketOnOnce(socket, 'bulkSet', (function (data) { return __awaiter(_this, void 0, void 0, function () {
                            var xDirection, yDirection, x, y;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        xDirection = data.endPlot.x > data.startPlot.x;
                                        yDirection = data.endPlot.y > data.startPlot.y;
                                        x = data.startPlot.x;
                                        _a.label = 1;
                                    case 1:
                                        if (!(x != data.endPlot.x)) return [3, 6];
                                        y = data.startPlot.y;
                                        _a.label = 2;
                                    case 2:
                                        if (!(y != data.endPlot.y)) return [3, 5];
                                        return [4, this.applyLandUpdate({ x: x, y: y }, data.p_type, socket.addr)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        yDirection ? y++ : y--;
                                        return [3, 2];
                                    case 5:
                                        xDirection ? x++ : x--;
                                        return [3, 1];
                                    case 6: return [4, this.syncPrivateLandCount(socket)];
                                    case 7:
                                        _a.sent();
                                        socket.emit("landHoldingsUpdated", {});
                                        return [2];
                                }
                            });
                        }); }).bind(this));
                        socket.on("buildPlacementTx", (function () { return __awaiter(_this, void 0, void 0, function () {
                            var plots, plotArray, txRet;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        plots = this.databaseConnection.plotsCollection.find({ addr: socket.addr });
                                        return [4, plots.toArray()];
                                    case 1:
                                        plotArray = _a.sent();
                                        return [4, this.txBuilder.buildTx(plotArray, socket.addr)];
                                    case 2:
                                        txRet = _a.sent();
                                        socket.emit("placementUpdateTx", txRet);
                                        return [2];
                                }
                            });
                        }); }));
                        return [2];
                }
            });
        });
    };
    PlacementProccessor.prototype.applyLandUpdate = function (cords, p_type, addr) {
        return __awaiter(this, void 0, void 0, function () {
            var stringCords, _a, plot, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        stringCords = JSON.stringify(cords);
                        _a = p_type;
                        switch (_a) {
                            case "unAlloc": return [3, 1];
                            case "alloc": return [3, 4];
                            case "adminRemove": return [3, 6];
                        }
                        return [3, 10];
                    case 1: return [4, this.map[stringCords]];
                    case 2:
                        plot = _d.sent();
                        if (plot.addr != addr) {
                            return [2];
                        }
                        delete this.map[stringCords];
                        _b = this.updatePrivateLandCount;
                        return [4, this.map[stringCords]];
                    case 3:
                        _b.apply(this, [(_d.sent()).addr, 1]);
                        return [3, 12];
                    case 4:
                        if (!this.hasEnoughRemainingLand(addr))
                            return [2];
                        return [4, this.isCurrentlyUsedTile(cords)];
                    case 5:
                        if (_d.sent())
                            return [2];
                        this.updatePrivateLandCount(addr, -1);
                        this.map[stringCords] = { addr: addr, p_type: p_type };
                        return [3, 12];
                    case 6: return [4, this.isPrivateUsedTile(cords)];
                    case 7:
                        if (!_d.sent()) return [3, 9];
                        _c = this.updatePrivateLandCount;
                        return [4, this.map[stringCords]];
                    case 8:
                        _c.apply(this, [(_d.sent()).addr, 1]);
                        _d.label = 9;
                    case 9:
                        delete this.map[stringCords];
                        return [3, 12];
                    case 10: return [4, this.isCurrentlyUsedTile(cords)];
                    case 11:
                        if (_d.sent())
                            return [2];
                        this.map[stringCords] = { addr: "DISTRICT_LAND", p_type: p_type };
                        _d.label = 12;
                    case 12: return [2];
                }
            });
        });
    };
    PlacementProccessor.prototype.setupMapHandlers = function (mapEvents) {
        mapEvents.on("update", this.mapUpdate.bind(this));
    };
    PlacementProccessor.prototype.mapUpdate = function (updateMessage) {
        var _this = this;
        Object.keys(this.sockets).forEach(function (key) {
            _this.sockets[key].emit("mapUpdate", updateMessage);
        });
    };
    PlacementProccessor.prototype.isCurrentlyUsedTile = function (cords) {
        return __awaiter(this, void 0, void 0, function () {
            var plot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.map[JSON.stringify(cords)]];
                    case 1:
                        plot = _a.sent();
                        return [2, plot.p_type != null];
                }
            });
        });
    };
    PlacementProccessor.prototype.isPrivateUsedTile = function (cords) {
        return __awaiter(this, void 0, void 0, function () {
            var plot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.map[JSON.stringify(cords)]];
                    case 1:
                        plot = _a.sent();
                        return [2, plot.p_type == "alloc"];
                }
            });
        });
    };
    PlacementProccessor.prototype.hasEnoughRemainingLand = function (address) {
        return this.remainingLandAmounts[address] > 0;
    };
    PlacementProccessor.prototype.isValidTypeForAccesslevel = function (p_type, level) {
        if (level == "admin")
            return true;
        if (p_type == "unAlloc" || p_type == "alloc")
            return true;
        return false;
    };
    PlacementProccessor.prototype.updatePrivateLandCount = function (addr, countChange) {
        if (addr == undefined) {
            return;
        }
        this.remainingLandAmounts[addr] = this.remainingLandAmounts[addr] + countChange;
    };
    PlacementProccessor.prototype.syncPrivateLandCount = function (socket) {
        return __awaiter(this, void 0, void 0, function () {
            var allocationResults, resultArray, totalPrivate, placedPlots, plotArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (socket == undefined) {
                            return [2];
                        }
                        return [4, this.databaseConnection.allocationResultsCollection.find({ addr: socket.addr })];
                    case 1:
                        allocationResults = _a.sent();
                        return [4, allocationResults.toArray()];
                    case 2:
                        resultArray = _a.sent();
                        if (resultArray.length < 1) {
                            socket.emit("ERROR", null);
                            return [2];
                        }
                        totalPrivate = resultArray[0].private;
                        return [4, this.databaseConnection.plotsCollection.find({ addr: socket.addr })];
                    case 3:
                        placedPlots = _a.sent();
                        return [4, placedPlots.toArray()];
                    case 4:
                        plotArray = _a.sent();
                        this.remainingLandAmounts[socket.addr] = totalPrivate - plotArray.length;
                        socket.emit('currentPrivateLandCount', this.remainingLandAmounts[socket.addr]);
                        return [2];
                }
            });
        });
    };
    PlacementProccessor.prototype.socketOnOnce = function (socket, subject, boundUpdate) {
        var listener = function (msg) {
            boundUpdate(msg);
            socket.once(subject, listener);
        };
        socket.once(subject, listener);
    };
    return PlacementProccessor;
}());
exports.PlacementProccessor = PlacementProccessor;
//# sourceMappingURL=PlacementProccessor.js.map