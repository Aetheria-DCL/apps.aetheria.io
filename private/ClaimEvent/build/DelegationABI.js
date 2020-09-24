"use strict";
exports.__esModule = true;
var delegationABI = [{ "constant": false, "inputs": [{ "name": "userAddress", "type": "address" }, { "name": "plotIds", "type": "uint256[]" }, { "name": "nonce", "type": "uint256" }, { "name": "_v", "type": "uint8" }, { "name": "_r", "type": "bytes32" }, { "name": "_s", "type": "bytes32" }], "name": "updatePlot", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getDelegatedSigner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newDelegate", "type": "address" }], "name": "setDelegatedSigner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "isOwner", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "currentNonce", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "userAddress", "type": "address" }, { "name": "plotIds", "type": "uint256[]" }, { "name": "nonce", "type": "uint256" }], "name": "getMessageHash", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "name": "msgHash", "type": "bytes32" }], "name": "buildPrefixedHash", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "landContractAddress", "type": "address" }, { "name": "estateContractAddress", "type": "address" }, { "name": "_estateId", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newDelegatedAddress", "type": "address" }], "name": "DelegateChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newOperator", "type": "address" }, { "indexed": false, "name": "plotIds", "type": "uint256[]" }], "name": "PlotOwnerUpdate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }];
exports.delegationABI = delegationABI;
var landABI = [{ "constant": true, "inputs": [{ "name": "_interfaceID", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proxyOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "assetId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "operator", "type": "address" }, { "name": "assetId", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "latestPing", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "assetId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "operator", "type": "address" }, { "name": "assetId", "type": "uint256" }], "name": "isAuthorized", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "authorizedDeploy", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "owner", "type": "address" }, { "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "name": "assetId", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "assetId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "tokensOf", "outputs": [{ "name": "", "type": "uint256[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "assetId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "GET_METADATA", "outputs": [{ "name": "", "type": "bytes4" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "currentContract", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "description", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "updateOperator", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "operator", "type": "address" }, { "name": "authorized", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "assetId", "type": "uint256" }, { "name": "userData", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "estateRegistry", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "assetHolder", "type": "address" }, { "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "assetId", "type": "uint256" }], "name": "getApprovedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "registry", "type": "address" }], "name": "EstateRegistrySet", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "assetId", "type": "uint256" }, { "indexed": true, "name": "holder", "type": "address" }, { "indexed": true, "name": "operator", "type": "address" }, { "indexed": false, "name": "data", "type": "string" }], "name": "Update", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "assetId", "type": "uint256" }, { "indexed": true, "name": "operator", "type": "address" }], "name": "UpdateOperator", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": true, "name": "assetId", "type": "uint256" }, { "indexed": false, "name": "operator", "type": "address" }, { "indexed": false, "name": "userData", "type": "bytes" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": true, "name": "assetId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "operator", "type": "address" }, { "indexed": true, "name": "holder", "type": "address" }, { "indexed": false, "name": "authorized", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "operator", "type": "address" }, { "indexed": true, "name": "assetId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_prevOwner", "type": "address" }, { "indexed": false, "name": "_newOwner", "type": "address" }], "name": "OwnerUpdate", "type": "event" }, { "constant": false, "inputs": [{ "name": "", "type": "bytes" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "operator", "type": "address" }, { "name": "assetId", "type": "uint256" }], "name": "isUpdateAuthorized", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "beneficiary", "type": "address" }], "name": "authorizeDeploy", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "beneficiary", "type": "address" }], "name": "forbidDeploy", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }, { "name": "beneficiary", "type": "address" }], "name": "assignNewParcel", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }, { "name": "beneficiary", "type": "address" }], "name": "assignMultipleParcels", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "ping", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "user", "type": "address" }], "name": "setLatestToNow", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }], "name": "encodeTokenId", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "name": "value", "type": "uint256" }], "name": "decodeTokenId", "outputs": [{ "name": "", "type": "int256" }, { "name": "", "type": "int256" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }], "name": "exists", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "assetId", "type": "uint256" }], "name": "exists", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }], "name": "ownerOfLand", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }], "name": "ownerOfLandMany", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "landOf", "outputs": [{ "name": "", "type": "int256[]" }, { "name": "", "type": "int256[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "assetId", "type": "uint256" }], "name": "tokenMetadata", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }], "name": "landData", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }, { "name": "to", "type": "address" }], "name": "transferLand", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }, { "name": "to", "type": "address" }], "name": "transferManyLand", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }, { "name": "estateId", "type": "uint256" }], "name": "transferLandToEstate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }, { "name": "estateId", "type": "uint256" }], "name": "transferManyLandToEstate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "assetId", "type": "uint256" }, { "name": "operator", "type": "address" }], "name": "setUpdateOperator", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "registry", "type": "address" }], "name": "setEstateRegistry", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }, { "name": "beneficiary", "type": "address" }], "name": "createEstate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }, { "name": "beneficiary", "type": "address" }, { "name": "metadata", "type": "string" }], "name": "createEstateWithMetadata", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256" }, { "name": "y", "type": "int256" }, { "name": "data", "type": "string" }], "name": "updateLandData", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "x", "type": "int256[]" }, { "name": "y", "type": "int256[]" }, { "name": "data", "type": "string" }], "name": "updateManyLandData", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }];
exports.landABI = landABI;
var delegAddr = '0x17bdbacd23d223e1beecb95705d0db92b4a2a0da';
exports.delegAddr = delegAddr;
var landAddr = '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d';
exports.landAddr = landAddr;
var password = 'finj-ydzv';
exports.password = password;
//# sourceMappingURL=DelegationABI.js.map