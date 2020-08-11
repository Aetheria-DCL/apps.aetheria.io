pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol";
import "./LAND/ILANDRegistry.sol";
import "./LAND/IEstateRegistry.sol";

contract AetherianLand is Ownable, ERC721Full {
    ILANDRegistry private landContract;
    IEstateRegistry private estateContract;
    mapping(uint256 => bool) private isClaimed;
    uint256 private estateId;
    address private delegatedSigner;

    constructor (address landContractAddress, address estateContractAddress, uint256 _estateId) public {
        landContract = ILANDRegistry(landContractAddress);
        estateContract = IEstateRegistry(estateContractAddress);
        estateId = _estateId;
        delegatedSigner = owner();
    }

    function _isNotClaimed(uint256[] memory plotIds) private view returns (bool) {
        for(uint i = 0; i < plotIds.length; i++) {
            if(isClaimed[plotIds[i]]) {
                return false;
            }
        }
        return true;
    }

    function setDelegatedSigner(address newDelegate) external onlyOwner {
        delegatedSigner = newDelegate;
        emit DelegateChanged(delegatedSigner);
    }

    function getDelegatedSigner() public view returns (address) {
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

    function setUpdateOperator(address newOperator, uint256 plotId) external {
        require(ownerOf(plotId) == msg.sender, "Not land owner");

        estateContract.setLandUpdateOperator(estateId, plotId, newOperator);
    }

    function setManyUpdateOperator(address newOperator, uint256[] calldata plotIds) external {
        for (uint i = 0; i < plotIds.length; i++)
        {
            this.setUpdateOperator(newOperator, plotIds[i]);
        }
    }

    function claimLandTokens(address userAddress, uint256[] calldata plotIds, uint nonce, uint8 _v, bytes32 _r, bytes32 _s) external {
        bytes32 msgHash = getMessageHash(userAddress, plotIds, nonce);
        require(verifySender(msgHash, _v, _r, _s), "Invalid Sig");
        require(_isNotClaimed(plotIds), "A plot is already claimed");

        for (uint i = 0; i<plotIds.length; i++) {
            _mint(userAddress, plotIds[i]);
            isClaimed[plotIds[i]] = true;
        }

        this.setManyUpdateOperator(userAddress, plotIds);
    }

  function _doTransferFrom(
    address from,
    address to,
    uint256 assetId,
    bytes memory userData,
    bool doCheck
  )
    internal
  {
    super._doTransferFrom(
      from,
      to,
      assetId,
      userData,
      doCheck
    );

    estateContract.setLandUpdateOperator(estateId, assetId, to); //new owner is default operator
  }

    event DelegateChanged(
        address newDelegatedAddress
    );
}
