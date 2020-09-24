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
var EventEmitter = require("events");
var MapHandler = (function () {
    function MapHandler(databaseConnection) {
        this.databaseConnection = databaseConnection;
        this.mapCache = {};
        this.handlers = {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.deleteProperty.bind(this)
        };
        this.events = new EventEmitter();
        this.mapInterface = {
            map: new Proxy(this.mapCache, this.handlers),
            events: this.events
        };
    }
    MapHandler.prototype.dbDump = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plotsCursor, plots, formatedPlots, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.databaseConnection.plotsCollection.find()];
                    case 1:
                        plotsCursor = _a.sent();
                        return [4, plotsCursor.toArray()];
                    case 2:
                        plots = _a.sent();
                        formatedPlots = {};
                        for (i = 0; i < plots.length; i++) {
                            formatedPlots[JSON.stringify(plots[i].cords)] = { addr: plots[i].addr, p_type: plots[i].p_type };
                        }
                        return [2, formatedPlots];
                }
            });
        });
    };
    MapHandler.prototype.get = function (target, key) {
        return __awaiter(this, void 0, void 0, function () {
            var deserialisedKey, plotCursor, plotArr, rawPlot, formatedPlot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (key == "dump") {
                            return [2, this.dbDump()];
                        }
                        deserialisedKey = JSON.parse(key);
                        if (target[key] != undefined)
                            return [2, target[key]];
                        return [4, this.databaseConnection.plotsCollection.find({ cords: deserialisedKey })];
                    case 1:
                        plotCursor = _a.sent();
                        return [4, plotCursor.toArray()];
                    case 2:
                        plotArr = _a.sent();
                        if (plotArr.length == 0)
                            return [2, { addr: "0x0", p_type: null }];
                        rawPlot = plotArr[0];
                        formatedPlot = { addr: rawPlot.addr, p_type: rawPlot.p_type };
                        target[key] = formatedPlot;
                        return [2, formatedPlot];
                }
            });
        });
    };
    MapHandler.prototype.set = function (target, location, value) {
        return __awaiter(this, void 0, void 0, function () {
            var deserialisedKey, setterAddr, p_type;
            return __generator(this, function (_a) {
                deserialisedKey = JSON.parse(location);
                setterAddr = value.addr;
                p_type = value.p_type;
                target[location] = { addr: setterAddr, p_type: p_type };
                this.databaseConnection.plotsCollection.replaceOne({ cords: deserialisedKey }, { cords: deserialisedKey, addr: setterAddr, p_type: p_type }, {
                    upsert: true
                });
                this.events.emit("update", { type: "addition", location: deserialisedKey, plot: { addr: setterAddr, p_type: p_type } });
                return [2, true];
            });
        });
    };
    MapHandler.prototype.deleteProperty = function (target, key) {
        return __awaiter(this, void 0, void 0, function () {
            var deserialisedKey;
            return __generator(this, function (_a) {
                deserialisedKey = JSON.parse(key);
                delete target[key];
                this.databaseConnection.plotsCollection.findOneAndDelete({ cords: deserialisedKey });
                this.events.emit("update", { type: "removal", location: deserialisedKey });
                return [2, true];
            });
        });
    };
    return MapHandler;
}());
exports.MapHandler = MapHandler;
//# sourceMappingURL=MapHandler.js.map