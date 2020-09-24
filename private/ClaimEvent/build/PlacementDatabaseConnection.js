"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var mongodb_1 = require("mongodb");
var PlacementDatabaseConnection = (function (_super) {
    __extends(PlacementDatabaseConnection, _super);
    function PlacementDatabaseConnection() {
        var _this = _super.call(this) || this;
        _this.setupSemaphore = false;
        _this.on("databaseIsReady", (function () {
            _this.setupSemaphore = true;
        }).bind(_this));
        mongodb_1.MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true }, (function (err, MongoDatabaseLink) {
            _this.MongoDatabaseLink = MongoDatabaseLink;
            _this.buildCollectionRefs();
            console.log("MongoDB connection established...");
            _this.emit("databaseIsReady", true);
        }).bind(_this));
        return _this;
    }
    PlacementDatabaseConnection.prototype.buildCollectionRefs = function () {
        this.AllocationDatabaseLink = this.MongoDatabaseLink.db("AllocationEvent");
        this.contributorCollection = this.AllocationDatabaseLink.collection("Contributors");
        this.allocationResultsCollection = this.AllocationDatabaseLink.collection("AllocationResults");
        this.approvedCollection = this.AllocationDatabaseLink.collection("Approved");
        this.plotsCollection = this.AllocationDatabaseLink.collection("Plots");
        this.claimCollection = this.AllocationDatabaseLink.collection("Claimed");
        this.adminsCollection = this.AllocationDatabaseLink.collection("Admins");
        this.configCollection = this.AllocationDatabaseLink.collection("Config");
    };
    PlacementDatabaseConnection.prototype.finished = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise((function (res) {
                        if (_this.setupSemaphore)
                            res();
                        _this.on("databaseIsReady", (function () {
                            res();
                        }).bind(_this));
                    }).bind(this))];
            });
        });
    };
    return PlacementDatabaseConnection;
}(EventEmitter));
exports.PlacementDatabaseConnection = PlacementDatabaseConnection;
//# sourceMappingURL=PlacementDatabaseConnection.js.map