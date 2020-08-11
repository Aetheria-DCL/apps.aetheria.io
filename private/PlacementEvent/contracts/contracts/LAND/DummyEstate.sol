pragma solidity ^0.5.0;

import './IEstateRegistry.sol';

contract DummyEstate {
    address addrdumpvar; //These variables are only used to stop warnings from the compiler
    string metadata;
    mapping(uint256 => address) look;
    uint256 uint256dumpvar;

  function mint(address _to, string calldata _metadata) external returns (uint256) {
      addrdumpvar = _to;
      metadata = _metadata;
      return 0;
  }
  function ownerOf(uint256 _tokenId) public view returns (address _owner) {
      return look[_tokenId];
  } // from ERC721
  function setManyLandUpdateOperator(
    uint256 _estateId,
    uint256[] memory _landIds,
    address _operator
  ) public {
      uint256dumpvar = _estateId;
      uint256dumpvar = _landIds[0];
      addrdumpvar = _operator;
      return;
  }
}