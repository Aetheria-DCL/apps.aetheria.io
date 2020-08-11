pragma solidity ^0.5.0;

contract DummyLand {
  uint256 constant factor = 0x100000000000000000000000000000000;
  uint256 constant clearLow = 0xffffffffffffffffffffffffffffffff00000000000000000000000000000000;
  uint256 constant clearHigh = 0x00000000000000000000000000000000ffffffffffffffffffffffffffffffff;
  
  function setUpdateOperator(uint256 assetId, address operator) external pure returns (uint256, address) {
      return (assetId, operator);
  }
  function encodeTokenId(int x, int y) external pure returns (uint)
  {
    return ((uint(x) * factor) & clearLow) | (uint(y) & clearHigh);
  }
}