const { expect, assert } = require("chai");
const truffleAssert = require('truffle-assertions');
const { increaseTime } = require('./utils/timeManipulation');

// ********************************************************************************
// ****** Should be uncomment accounts in Participants contract before tests ******
// ********************************************************************************

const bn1e18 = ethers.BigNumber.from((10**18).toString());
const timestamp = 1646092800; // 1 Mar.

const oneMonth = 2592000;
const sixMonthPass = 1661644800;
const nineMonthPass = 1669420800;
const twelveMonthPass = 1677196800;
const eighteenMonthPass = 1692748800;
const twentyFourMonthPass = 1708300800;

let owner;
let payer1;
let payer2;
let payer3;
let account0;
let account1;

let crowdsaleVesting;
let ddaoToken;
let addaoToken;

describe("CrowdsaleVesting", function () {

    beforeEach(async function() {
        [owner, payer1, payer2, payer3] = await ethers.getSigners();
        [account0, account1] = await web3.eth.getAccounts();

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
        it("Should return 0 as timestamp less then startDate", async function() {
            console.log('timestamp', (await web3.eth.getBlock('latest').timestamp));
            
            await addaoToken.connect(owner).approve(payer1.address, ethers.utils.parseEther('120000').toString());
            await addaoToken.connect(payer1).transferFrom(owner.address, payer1.address, ethers.utils.parseEther('120000').toString());
            await addaoToken.connect(payer1).approve(crowdsaleVesting.address, ethers.utils.parseEther('120000').toString());

            const startDatePluslockupPeriod = +(await crowdsaleVesting.startDate()) + +(await crowdsaleVesting.lockupPeriod());
            
            expect((await crowdsaleVesting.calculateUnlockedTokens(payer1.address, 0, startDatePluslockupPeriod - 1)).toString()).to.be.equal('0');
        });
        
    })

    describe("adminGetCoin", function() {
        it("Should be Fail as unreach to send Eth", async function() {
            await truffleAssert.reverts(web3.eth.sendTransaction({from: account0, to: crowdsaleVesting.address, value: web3.utils.toWei('100', "ether")}), "Transaction reverted: function selector was not recognized and there's no fallback nor receive function");
        });
        it("Should be Fail as unreach to call transfer", async function() {
            await truffleAssert.reverts(crowdsaleVesting.adminGetCoin(ethers.utils.parseEther('100').toString()), "Transaction reverted: function call failed to execute");
        });
    });

    describe("adminGetToken", function() {
        it("Should be send token", async function() {            
            await addaoToken.connect(owner).approve(payer1.address, ethers.utils.parseEther('120000').toString());
            await addaoToken.connect(payer1).transferFrom(owner.address, payer1.address, ethers.utils.parseEther('120000').toString());
            await addaoToken.connect(payer1).approve(crowdsaleVesting.address, ethers.utils.parseEther('120000').toString());

            await increaseTime({ ethers }, ethers.BigNumber.from(oneMonth).mul(5)); // Move {{n}} months

            await crowdsaleVesting.connect(payer1).claim(0);
            
            const balanceAddaoBefore = await addaoToken.balanceOf(owner.address);

            await crowdsaleVesting.adminGetToken(addaoToken.address, ethers.utils.parseEther('100').toString());
            const balanceAddaoAffter = await addaoToken.balanceOf(owner.address);
            
            expect(ethers.BigNumber.from(balanceAddaoAffter).sub(balanceAddaoBefore).toString()).to.be.equal(ethers.utils.parseEther('100').toString());
        });
        // it("Should return 0 due to balance", async function() {            
            // await increaseTime({ ethers }, ethers.BigNumber.from(oneMonth).mul(12)); // Move {{n}} months
            // const currentTimestamp = (await web3.eth.getBlock('latest')).timestamp;
            // expect(await crowdsaleVesting.calculateUnlockedTokens(payer1.address, 0, currentTimestamp)).to.be.equal('0');
        // });
    });
});