pragma solidity ^0.5.0;


contract IEstateRegistry {
  function mint(address to, string calldata metadata) external returns (uint256);
  function ownerOf(uint256 _tokenId) public view returns (address _owner); // from ERC721
  function setManyLandUpdateOperator(uint256 _estateId, uint256[] memory _landIds, address _operator) public;
  function setLandUpdateOperator(uint256 _estateId, uint256 _landId, address _operator) public;
  // Events
  event CreateEstate(
    address indexed _owner,
    uint256 indexed _estateId,
    string _data
  );

  event AddLand(
    uint256 indexed _estateId,
    uint256 indexed _landId
  );

  event RemoveLand(
    uint256 indexed _estateId,
    uint256 indexed _landId,
    address indexed _destinatary
  );

  event Update(
    uint256 indexed _assetId,
    address indexed _holder,
    address indexed _operator,
    string _data
  );

  event UpdateOperator(
    uint256 indexed _estateId,
    address indexed _operator
  );

  event UpdateManager(
    address indexed _owner,
    address indexed _operator,
    address indexed _caller,
    bool _approved
  );

  event SetLANDRegistry(
    address indexed _registry
  );
}
