// solium-disable linebreak-style
pragma solidity ^0.5.0;

interface ILANDRegistry {

  // LAND can be assigned by the owner
  function assignNewParcel(int x, int y, address beneficiary) external;
  function assignMultipleParcels(int[] calldata x, int[] calldata y, address beneficiary) external;

  // After one year, LAND can be claimed from an inactive public key
  function ping() external;

  // LAND-centric getters
  function encodeTokenId(int x, int y) external pure returns (uint256);
  function decodeTokenId(uint value) external pure returns (int, int);
  function exists(int x, int y) external view returns (bool);
  function ownerOfLand(int x, int y) external view returns (address);
  function ownerOfLandMany(int[] calldata x, int[] calldata y) external view returns (address[] memory);
  function landOf(address owner) external view returns (int[] memory, int[] memory);
  function landData(int x, int y) external view returns (string memory);

  // Transfer LAND
  function transferLand(int x, int y, address to) external;
  function transferManyLand(int[] calldata x, int[] calldata y, address to) external;

  // Update LAND
  function updateLandData(int x, int y, string calldata data) external;
  function updateManyLandData(int[] calldata x, int[] calldata y, string calldata data) external;

  //operators
  function setUpdateOperator(uint256 assetId, address operator) external;

  // Events

  event Update(
    uint256 indexed assetId,
    address indexed holder,
    address indexed operator,
    string data
  );

  event UpdateOperator(
    uint256 indexed assetId,
    address indexed operator
  );

  event DeployAuthorized(
    address indexed _caller,
    address indexed _deployer
  );

  event DeployForbidden(
    address indexed _caller,
    address indexed _deployer
  );
}
