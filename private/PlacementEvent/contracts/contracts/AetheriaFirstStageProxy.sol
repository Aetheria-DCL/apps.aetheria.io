pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./LAND/ILANDRegistry.sol";
import "./LAND/IEstateRegistry.sol";

contract AetheriaFirstStageProxy is Ownable {
	ILANDRegistry private landContract;
	IEstateRegistry private estateContract;
	uint256 private estateId;
	address private delegatedSigner;
	mapping(uint256 => uint) private replayProtection;
	uint public currentNonce;

	constructor (address landContractAddress, address estateContractAddress, uint256 _estateId) public {
		landContract = ILANDRegistry(landContractAddress);
		estateContract = IEstateRegistry(estateContractAddress);
		estateId = _estateId;
		delegatedSigner = owner();
		currentNonce = 1;
	}

	function _isReplayProtectionValid(uint256[] memory plotIds, uint nonce) private view returns (bool) {
		for(uint i = 0; i < plotIds.length; i++) {
			if(replayProtection[plotIds[i]] > nonce) {
				return false;
			}
		}
		return true;
	}

	function setDelegatedSigner(address newDelegate) external onlyOwner {
		delegatedSigner = newDelegate;
		emit DelegateChanged(delegatedSigner);
	}

	function getDelegatedSigner() public view returns (address ){
		return delegatedSigner;
	}

	function getMessageHash(address userAddress, uint256[] memory plotIds, uint nonce) public pure returns (bytes32)
	{
		return keccak256(abi.encode(userAddress, plotIds, nonce));
	}

	function buildPrefixedHash(bytes32 msgHash) public pure returns (bytes32)
	{
		bytes memory prefix = "\x19Ethereum Signed Message:\n32";
		return keccak256(abi.encodePacked(prefix, msgHash));
	}

	function verifySender(bytes32 msgHash, uint8 _v, bytes32 _r, bytes32 _s) private view returns (bool)
	{
		bytes32 prefixedHash = buildPrefixedHash(msgHash);
		return ecrecover(prefixedHash, _v, _r, _s) == delegatedSigner;
	}

	function updatePlot(address userAddress, uint256[] calldata plotIds, uint nonce, uint8 _v, bytes32 _r, bytes32 _s) external {
		bytes32 msgHash = getMessageHash(userAddress, plotIds, nonce);
		require(verifySender(msgHash, _v, _r, _s), "Invalid Sig");
		require(_isReplayProtectionValid(plotIds, nonce), "Nonce to low");
		for (uint i = 0; i<plotIds.length; i++) {
			replayProtection[plotIds[i]] = nonce;
		}
		estateContract.setManyLandUpdateOperator(estateId, plotIds, userAddress);
		if (currentNonce <= nonce)
		{
			currentNonce = nonce+1;
		}
		emit PlotOwnerUpdate(
			userAddress,
			plotIds
		);
	}

	event DelegateChanged(
		address newDelegatedAddress
	);

	event PlotOwnerUpdate(
		address newOperator,
		uint256[] plotIds
	);
}
