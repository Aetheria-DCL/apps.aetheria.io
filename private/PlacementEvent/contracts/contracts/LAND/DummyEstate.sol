pragma solidity ^0.5.0;

import './IEstateRegistry.sol';

contract DummyEstate {
    address addrdumpvar; //These variables are only used to stop warnings from the compiler
    string metadata;
    mapping(uint256 => address) look;
    mapping(uint256 => address) operator;
    uint256 uint256dumpvar;

  function mint(address _to, string calldata _metadata) external returns (uint256) {
      addrdumpvar = _to;
      metadata = _metadata;
      return 0;
  }
  function ownerOf(uint256 _tokenId) public view returns (address _owner) {
      return look[_tokenId];
  } // from ERC721

  function operatorOf(uint256 _tokenId) public view returns (address _owner) {
      return operator[_tokenId];
  }

  function setManyLandUpdateOperator(
    uint256 _estateId,
    uint256[] memory _landIds,
    address _operator
  ) public {
      for (uint i = 0; i<_landIds.length; i++) {
        operator[_landIds[i]] = _operator;
      }
      uint256dumpvar = _estateId;
      addrdumpvar = _operator;
      return;
  }

  function setLandUpdateOperator(
    uint256 _estateId,
    uint256 _landId,
    address _operator
  ) public {
      uint256dumpvar = _estateId;
      operator[_landId] = _operator;
      addrdumpvar = _operator;
      return;
  }

}
