/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { ethers } = require('hardhat');

const mockNftDeployment = path.join(__dirname, './deployMockNFT_output.json');
const mockNftContractAddress = require(mockNftDeployment).nftMockcontract;
///Users/ram/Documents/Work/ram-cdk/cdk-tools/custom-nft-bridge-example/scripts/deployMockNFT_output.json
// For Minting NFT on the root chain \
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
 const nftFactory = await ethers.getContractFactory('ERC721Mock', deployerRootchain);
 const nftContract =  nftFactory.attach(mockNftContractAddress)

 // mint nft for owner
 await nftContract.mint(deployerRootchain.address);
 console.log('minted nft for owner');
}

main().catch((e) => {
 console.error(e);
 process.exit(1);
});