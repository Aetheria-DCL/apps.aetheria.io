var afsp = artifacts.require("AetherianLand");
var dummyLand = artifacts.require("LAND/DummyLand");
var dummyestate = artifacts.require("LAND/DummyEstate");
module.exports = function(deployer, network, accounts) {
  // deployment steps
  deployer.deploy(dummyLand).then(landInstance => {
    estateID = 0
    return deployer.deploy(dummyestate).then(estateInstance => {
      return deployer.deploy(afsp, landInstance.address, estateInstance.address, estateID); 
    })
  });
};
