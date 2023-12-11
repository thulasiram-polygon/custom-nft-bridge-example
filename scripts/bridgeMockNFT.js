/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { ethers } = require('hardhat');

const networkIDRootchain = 0;
const networkIDChaildChain = 1;

const TOKEN_ID = 1; // NOTE: Change this to the token ID you want to bridge

const pathdeployedNFT = path.join(__dirname, './deployMockNFT_output.json');
const deployedNFT = require(pathdeployedNFT).nftMockcontract;

const pathNFTBridgeOutput = path.join(__dirname, '../deployment/NFTBridge_output.json');
const deployedNftBridgeAddress = require(pathNFTBridgeOutput).nftBridgeContract;

async function main() {
 // Load provider
  let rootchainProvider = new ethers.providers.JsonRpcProvider(
    process.env.ROOTCHAIN_URL
  );
    // Load deployer
   let deployerRootchain;
 
   if (process.env.PRIVATE_KEY_ROOTCHAIN && process.env.PRIVATE_KEY_CHILDCHAIN) {
     // Load deployer
     deployerRootchain = new ethers.Wallet(
       process.env.PRIVATE_KEY_ROOTCHAIN,
       rootchainProvider
     );
     console.log(`Deployer Rootchain: ${deployerRootchain.address}`);
   } else {
     throw new Error("PRIVATE_KEY not found in .env file");
   }

    const nftBridgeFactory = await ethers.getContractFactory('ZkEVMNFTBridge', deployerRootchain);
    const nftBridgeContract =  nftBridgeFactory.attach(
        deployedNftBridgeAddress,
    );
    

    const destinationNetwork = networkIDChaildChain;
    const destinationAddress = deployerRootchain.address;

    // Approve tokens
    const nftFactory = await ethers.getContractFactory('ERC721Mock', deployerRootchain);
    const nftContract = nftFactory.attach(deployedNFT);
    await (await nftContract.approve(nftBridgeContract.address, TOKEN_ID)).wait();
    console.log(`Approved token ${TOKEN_ID} for bridge`);

    const tx = await nftBridgeContract.bridgeNFT(
        destinationNetwork,
        destinationAddress,
        deployedNFT,
        TOKEN_ID,
        true,
    );

    console.log((await tx.wait()).transactionHash);
    console.log('Bridge done succesfully');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
