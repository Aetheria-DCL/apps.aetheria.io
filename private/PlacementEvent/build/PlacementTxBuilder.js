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
var Web3 = require("web3");
var util = require("ethereumjs-util");
var DelegationABI_1 = require("./DelegationABI");
var PlacementTxBuilder = (function () {
    function PlacementTxBuilder() {
        this.web3 = new Web3("http://localhost:8545");
        this.landInstance = new this.web3.eth.Contract(DelegationABI_1.landABI, DelegationABI_1.landAddr);
        this.delegInstance = new this.web3.eth.Contract(DelegationABI_1.delegationABI, DelegationABI_1.delegAddr);
    }
    PlacementTxBuilder.prototype.fromRpcSig = function (sig) {
        var buf = util.toBuffer(sig);
        if (buf.length !== 65) {
            throw new Error('Invalid signature length');
        }
        var v = buf[64];
        return {
            v: v,
            r: buf.slice(0, 32),
            s: buf.slice(32, 64)
        };
    };
    PlacementTxBuilder.prototype.buildTx = function (plotArray, addr) {
        return __awaiter(this, void 0, void 0, function () {
            var nonce, cords, landIds, landHexs, addresses, address, packed, packedHashedData, sig, signatureParams;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.delegInstance.methods.currentNonce.call()];
                    case 1:
                        nonce = _a.sent();
                        cords = plotArray.map(function (x) { return x.cords; });
                        return [4, this.getLandIds(cords)];
                    case 2:
                        landIds = _a.sent();
                        landHexs = landIds.map(function (x) { return x._hex; });
                        return [4, this.web3.eth.getAccounts()];
                    case 3:
                        addresses = _a.sent();
                        address = addresses[0];
                        packed = this.web3.eth.abi.encodeParameters(["address", "uint256[]", "uint256"], [addr, landHexs, nonce]);
                        packedHashedData = this.web3.utils.keccak256(packed);
                        return [4, this.web3.eth.personal.sign(packedHashedData, address, DelegationABI_1.password)];
                    case 4:
                        sig = _a.sent();
                        signatureParams = this.fromRpcSig(sig);
                        return [2, {
                                v: signatureParams.v,
                                r: signatureParams.r,
                                s: signatureParams.s,
                                nonce: nonce,
                                addr: addr,
                                plotIds: landHexs
                            }];
                }
            });
        });
    };
    PlacementTxBuilder.prototype.getLandIds = function (cords) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
                        var landIdsPromises;
                        var _this = this;
                        return __generator(this, function (_a) {
                            landIdsPromises = cords.map(function (cords) { return _this.landInstance.methods.encodeTokenId(cords.x, cords.y).call(); });
                            Promise.all(landIdsPromises).then(function (landIds) {
                                res(landIds);
                            });
                            return [2];
                        });
                    }); })];
            });
        });
    };
    return PlacementTxBuilder;
}());
exports.PlacementTxBuilder = PlacementTxBuilder;
//# sourceMappingURL=PlacementTxBuilder.js.map