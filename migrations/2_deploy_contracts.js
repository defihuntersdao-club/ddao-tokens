const CrowdsaleVesting = artifacts.require("CrowdsaleVesting");
const ERC20Base = artifacts.require("ERC20Base");

module.exports = async (deployer, network, accounts) => {
    let ddaoAddress;
    let addaoAddress;
    let crowdsaleAddress;
  
    await deployer.deploy(ERC20Base, 'DEFI HUNTERS DAO Token', 'DDAO', '18');
    let ddaoInstance = await ERC20Base.deployed();
    await ddaoInstance.mint(accounts[0], '21000000000000000000000000');
    ddaoAddress = ddaoInstance.address;
  
    await deployer.deploy(ERC20Base, 'DEFI HUNTERS DAO Token', 'aDDAO', '18');
    let addaoInstance = await ERC20Base.deployed();
    await addaoInstance.mint(accounts[0], '5000000000000000000000000');
    addaoAddress = addaoInstance.address;
    
    let timestamp = 1646092800 // 1 Mar.
    await deployer.deploy(CrowdsaleVesting, ddaoAddress, addaoAddress, timestamp);
    let crowdsaleVestingInstance = await CrowdsaleVesting.deployed();
    crowdsaleAddress = crowdsaleVestingInstance.address;
    await crowdsaleVestingInstance.transferOwnership('0x5c763f9C2111a61e154d0A05a526E332c12957CE');
    await ddaoInstance.transfer(crowdsaleAddress, '5880000000000000000000000');
  
    console.log("DDAO - ", ddaoAddress)
    console.log("aDDAO - ", addaoAddress)
    console.log("CrowdsaleVesting - ", crowdsaleAddress)
    console.log("__Network__ - ", network)
    console.log('accounts[0] - ', accounts[0])
  };