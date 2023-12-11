/* eslint-disable no-await-in-loop, no-use-before-define, no-lonely-if, import/no-dynamic-require, global-require */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved, no-restricted-syntax */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { ethers } = require('hardhat');

// Address of the Create2Factory contract for all chains(if you deployed create2Factory contract on all chains)
// Make sure you deployed the contract first. by running `npm run deploy:create2`
const create2Contract = "0x4e59b44847b379578588920ca78fbf26c0b4956c" 
const saltCreate2 = '0x0000000000000000000000000000000000000000000000000000000000000000';

async function main() {
  
  // bridge address
  //let BRIDGE_ADDRESS = process.env.ROOTCHAIN_BRIDGE_ADDRESS;
  let BRIDGE_ADDRESS = process.env.BRIDGE_ADDRESS;

  // Load providers for both networks
  let rootchainProvider = new ethers.providers.JsonRpcProvider(
    process.env.ROOTCHAIN_URL
  );
  let childchainProvider = new ethers.providers.JsonRpcProvider(
    process.env.CHILDCHAIN_URL
  );


  // Get deployers for both networks
  let deployerRootchain;
  let deployerChildChain;

  if (process.env.PRIVATE_KEY_ROOTCHAIN && process.env.PRIVATE_KEY_CHILDCHAIN) {
    // Load deployer
    deployerRootchain = new ethers.Wallet(
      process.env.PRIVATE_KEY_ROOTCHAIN,
      rootchainProvider
    );
    deployerChildChain = new ethers.Wallet(
      process.env.PRIVATE_KEY_CHILDCHAIN,
      childchainProvider
    );
    console.log(`Deployer Rootchain: ${deployerRootchain.address}`);
    console.log(`Deployer ChildChain: ${deployerChildChain.address}`);
  } else {
    throw new Error("PRIVATE_KEY not found in .env file");
  }
 

    const nftBridgeFactory = await ethers.getContractFactory('ZkEVMNFTBridge', deployerRootchain);
    const deployBridgeTxData = (nftBridgeFactory.getDeployTransaction(
        BRIDGE_ADDRESS,
    )).data;

    //console.log(`DeployBridgeTxData: ${JSON.stringify(deployBridgeTxData)}`);
    // Encode deploy transaction
    const hashInitCode = ethers.utils.solidityKeccak256(['bytes'], [deployBridgeTxData]);
    // Precalculate create2 address
    const precalculatedAddressDeployed = ethers.utils.getCreate2Address(create2Contract, saltCreate2, hashInitCode);
    console.log(`Precalculated Address: ${precalculatedAddressDeployed}`);
    const txParams = {
        to: create2Contract,
        data: ethers.utils.hexConcat([saltCreate2, deployBridgeTxData]),
    };

    // Deploy root chain
    if (await deployerRootchain.provider.getCode(precalculatedAddressDeployed) === '0x') {
       const tx = await deployerRootchain.sendTransaction(txParams);
       await tx.wait(); // wait for tx to be mined
       console.log(`Rootchain: Transaction hash: ${tx.hash}`);
    } else {
        console.log('Contract already deployed on L1');
    }

    // Deploy child chain
    if (await deployerChildChain.provider.getCode(precalculatedAddressDeployed) === '0x') {
        const tx = await deployerChildChain.sendTransaction(txParams);
        await tx.wait(); // wait for tx to be mined
        console.log(`ChaildChain: Transaction hash: ${tx.hash}`);
    } else {
        console.log('Contract already deployed on L2');
    }

    // Check succesfull deployment
    if (await deployerRootchain.provider.getCode(precalculatedAddressDeployed) === '0x'){
      throw new Error('Contract not deployed on Root Chain yet');
    }
    if( await deployerChildChain.provider.getCode(precalculatedAddressDeployed) === '0x')
     {
      throw new Error('Contract not deployed on Child Chain yet');
    }
    console.log('NFT bridge contract succesfully deployed on: ', precalculatedAddressDeployed);

    const outputJson = {
        nftBridgeContract: precalculatedAddressDeployed,
    };
    const pathOutputJson = path.join(__dirname, './NFTBridge_output.json');

    fs.writeFileSync(pathOutputJson, JSON.stringify(outputJson, null, 1));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
