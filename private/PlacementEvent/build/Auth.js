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
var uuid = require("uuid");
var util = require("ethereumjs-util");
var Authenticator = (function () {
    function Authenticator(io, db) {
        var _this = this;
        this.onAuthed = [];
        this.dbConnection = db;
        io.on('connection', (function (socket) {
            _this.buildAuthenticationHandlers(socket);
        }).bind(this));
        this.validChallanges = {};
    }
    Authenticator.prototype.generateChallange = function (addr) {
        this.validChallanges[addr] = "Placement Event Auth Token: " + uuid();
        return this.validChallanges[addr];
    };
    Authenticator.prototype.verify = function (addr, sig) {
        try {
            var msgBuffer = util.toBuffer(this.validChallanges[addr]);
            var msgHash = util.hashPersonalMessage(msgBuffer);
            var signatureBuffer = util.toBuffer(sig);
            var signatureParams = util.fromRpcSig(signatureBuffer);
            var publicChallange = util.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
            var addressBuffer = util.pubToAddress(publicChallange);
            var resultAddr = util.bufferToHex(addressBuffer);
            return (resultAddr == addr);
        }
        catch (e) {
            console.log(addr + " sent \"" + sig + "\" and caused and error \"" + e + "\"");
            return false;
        }
    };
    Authenticator.prototype.buildAuthenticationHandlers = function (socket) {
        var _this = this;
        socket.isAuthed = false;
        socket.on("startAuth", (function (addr) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = socket;
                        return [4, this.isMemberOfCurrentAllowedGroup(addr)];
                    case 1:
                        _a.accesslevel = _b.sent();
                        if (!socket.accesslevel) {
                            socket.emit("authError", "Not Member Of Currently Allowed Group");
                            return [2];
                        }
                        socket.addr = addr;
                        socket.emit("authChallange", this.generateChallange(addr));
                        return [2];
                }
            });
        }); }).bind(this));
        socket.on("authAttempt", (function (sig) {
            var isVerified = _this.verify(socket.addr, sig);
            var isAdmin = (socket.accesslevel == 'admin');
            socket.emit("authResult", { isSuccess: isVerified, isAdmin: isAdmin, addr: socket.addr });
            _this.buildAuthCleanup(socket)();
            if (isVerified) {
                socket.emit("accessLevel", socket.accesslevel);
                _this.onAuthed.map(function (x) { return x(socket); });
            }
        }).bind(this));
        socket.on('disconnect', this.buildAuthCleanup(socket));
    };
    Authenticator.prototype.buildAuthCleanup = function (socket) {
        var _this = this;
        return (function () {
            socket.removeAllListeners(['disconnect']);
            delete _this.validChallanges[socket.addr];
        }).bind(this);
    };
    Authenticator.prototype.isMemberOfCurrentAllowedGroup = function (addr) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCollectionPromise, configArray, restrictionLevel, adminMatchingCount, approvedMatchingCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.dbConnection.configCollection.find({})];
                    case 1:
                        totalCollectionPromise = _a.sent();
                        return [4, totalCollectionPromise.toArray()];
                    case 2:
                        configArray = _a.sent();
                        restrictionLevel = configArray[0].currentMode;
                        if (!(restrictionLevel >= 0)) return [3, 4];
                        return [4, this.dbConnection.adminsCollection.countDocuments({ addr: addr }, { limit: 1 })];
                    case 3:
                        adminMatchingCount = _a.sent();
                        if (adminMatchingCount == 1) {
                            return [2, "admin"];
                        }
                        _a.label = 4;
                    case 4:
                        if (!(restrictionLevel >= 1)) return [3, 6];
                        return [4, this.dbConnection.approvedCollection.countDocuments({ addr: addr }, { limit: 1 })];
                    case 5:
                        approvedMatchingCount = _a.sent();
                        if (approvedMatchingCount == 1) {
                            return [2, "approved"];
                        }
                        _a.label = 6;
                    case 6:
                        if (restrictionLevel == 2)
                            return [2, "contributor"];
                        return [2, false];
                }
            });
        });
    };
    return Authenticator;
}());
exports.Authenticator = Authenticator;
//# sourceMappingURL=Auth.js.map