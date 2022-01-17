const { expect } = require("chai");
const { assert, artifacts } = require("hardhat");
const truffleAssert = require('truffle-assertions');
const { increaseTime } = require('./utils/timeManipulation');

// ********************************************************************************
// ****** Should be uncomment accounts in Participants contract before tests ******
// ********************************************************************************

const bn1e18 = ethers.BigNumber.from((10**18).toString());
const timestamp = 1646092800; // 1 Mar.

const sixMonthPass = 1661644800;
const nineMonthPass = 1669420800;
const twelveMonthPass = 1677196800;
const eighteenMonthPass = 1692748800;
const twentyFourMonthPass = 1708300800;

describe("CrowdsaleVesting", function () {
    let owner;
    let payer1;
    let payer2;
    let payer3;

    let crowdsaleVesting;
    let ddaoToken;
    let addaoToken;

    const provider = ethers.getDefaultProvider();

    beforeEach(async function() {
        [owner, payer1, payer2, payer3] = await ethers.getSigners();

        CrowdsaleVesting = await ethers.getContractFactory('CrowdsaleVesting');
        ERC20 = await ethers.getContractFactory('ERC20Base');

        ddaoToken = await ERC20.deploy('DEFI HUNTERS DAO Token', 'DDAO', 18);
        await ddaoToken.mint(owner.address, '21000000000000000000000000');
        
        addaoToken = await ERC20.deploy('DEFI HUNTERS DAO Token', 'aDDAO', 18);
        await addaoToken.mint(owner.address, '5880000000000000000000000');
        
        crowdsaleVesting = await CrowdsaleVesting.deploy(ddaoToken.address, addaoToken.address, timestamp)
        
        await ddaoToken.transfer(crowdsaleVesting.address, '5880000000000000000000000');
    })

    describe("constructor", function() {
        it("Should set token addreses and timestamp successfully", async function() {
            expect(await crowdsaleVesting.ddao()).to.be.equal(ddaoToken.address);
            expect(await crowdsaleVesting.addao()).to.be.equal(addaoToken.address);
            expect((await crowdsaleVesting.startDate()).toNumber()).to.be.equal(timestamp);
        });
    })

    describe("claim", function() {
        it("Should not claim as balance 0.", async function() {
            await truffleAssert.reverts(crowdsaleVesting.connect(payer2).claim(0), "Nothing to claim");
        });
    })
    
    describe("calculateUnlockedTokens", function() {
        it("Should not calculate. Round 100 isn't exist", async function() {
            await truffleAssert.reverts(crowdsaleVesting.calculateUnlockedTokens(payer1.address, 100, 0), "CrowdsaleVesting: this round has not supported");
        });
        it("Should be half of available to claim on the middle of vesting at seed round", async function() {
            await addaoToken.transfer(payer1.address, '625000000000000000000000');
            expect((await crowdsaleVesting.calculateUnlockedTokens(payer1.address, 0, twelveMonthPass)).toString()).to.be.equal('312500000000000000000000');
        });
        it("Should be half of available to claim on the middle of vesting at private 1 round", async function() {
            await addaoToken.transfer(payer2.address, '31250000000000000000000');
            expect((await crowdsaleVesting.calculateUnlockedTokens(payer2.address, 1, nineMonthPass)).toString()).to.be.equal('15625000000000000000000');
        });
        it("Should be half of available to claim on the middle of vesting at private 2 round", async function() {
            await addaoToken.transfer(payer3.address, '2170212765957400000000');
            expect((await crowdsaleVesting.calculateUnlockedTokens(payer3.address, 2, sixMonthPass)).toString()).to.be.equal('1085106382978700000000');
        });
        it("Should be available to claim amount of tokents at the first second, by formula - (Vested_Amounts - Seconds_Passed) / Period_Vesting", async function() {
            await addaoToken.transfer(payer1.address, '625000000000000000000000');
            const oneSecondPass = timestamp + 1;
            expect((await crowdsaleVesting.calculateUnlockedTokens(payer1.address, 0, oneSecondPass)).toString()).to.be.equal('10046939300411522');
        });
    })
});
