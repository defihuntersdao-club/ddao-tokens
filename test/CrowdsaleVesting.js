const { expect } = require("chai");
const { ethers } = require("hardhat");
const { assert, artifacts } = require("hardhat");

const bn1e18 = BigNumber.from((10**18).toString());
const timestamp = 1646092800 // 1 Mar.

describe("CrowdsaleVesting", function () {
    let accounts;
    let owner;
    let payer1;
    let payer2;

    let crowdsaleVesting;
    let ddaoToken;
    let addaoToken;

    const provider = ethers.getDefaultProvider();

    beforeEach(async function() {
        [owner, payer1, payer2] = await ethers.getSigners();

        CrowdsaleVesting = await ethers.getContractFactory('CrowdsaleVesting');
        ERC20 = await ethers.getContractFactory('ERC20Base');

        ddaoToken = await ERC20.deploy('DEFI HUNTERS DAO Token', 'DDAO', 18);
        await ddaoToken.mint(owner.address, '21000000000000000000000000');

        addaoToken = await ERC20.deploy('DEFI HUNTERS DAO Token', 'aDDAO', 18);
        await addaoToken.mint(owner.address, '5880000000000000000000000');

        crowdsaleVesting = await CrowdsaleVesting.deploy(ddaoToken, addaoToken, timestamp)
        
        await ddaoToken.transfer(crowdsaleVesting.address, '5880000000000000000000000');
    })

    describe( "constructor", function() {
        it("Should set token addreses and timestamp successfully", async function() {
            expect(await crowdsaleVesting.ddao()).to.be.equal(ddaoToken.address);
            expect(await crowdsaleVesting.addao()).to.be.equal(addaoToken.address);
            expect(await crowdsaleVesting.startDate()).to.be.equal(timestamp);
        });
    })
});
