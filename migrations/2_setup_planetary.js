const Planetary = artifacts.require("Planetary");

module.exports = function (deployer) {
  deployer.deploy(Planetary);
};
