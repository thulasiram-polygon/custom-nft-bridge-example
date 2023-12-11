/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { ethers } = require('hardhat');
// For deploying NFT on the root chain \
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

    // deploy erc721 token
    const tokenName = 'test NFT';
    const tokenSymbol = 'TNFT';
    const baseTokenURL = 'http://example';

    const nftFactory = await ethers.getContractFactory('ERC721Mock', deployerRootchain);
    const nftContract = await nftFactory.deploy(
        tokenName,
        tokenSymbol,
        baseTokenURL,
    );
    await nftContract.deployed();

    console.log('nftMockContract contract succesfully deployed on: ', nftContract.address);

    // mint nft for owner
    await nftContract.mint(deployerRootchain.address);

    const outputJson = {
        tokenName,
        tokenSymbol,
        baseTokenURL,
        nftMockcontract: nftContract.address,
    };

    const pathOutputJson = path.join(__dirname, './deployMockNFT_output.json');

    fs.writeFileSync(pathOutputJson, JSON.stringify(outputJson, null, 1));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
