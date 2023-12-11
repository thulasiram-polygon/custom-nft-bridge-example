const { ethers } = require('hardhat');

async function main(){

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

  // Deploy on Root Chain

  const txResponse = await deployerRootchain.sendTransaction({to: '0x3fab184622dc19b6109349b94811493bf2a45362', value: ethers.utils.parseUnits('0.01', 'ether')}) // fund signer keyless deploymetn
  console.log("Rootchain: Transaction hash:", txResponse.hash);

  // Wait for the transaction to be mined
  const receipt = await txResponse.wait();
  console.log("Rootchain: Transaction confirmed in block:", receipt.blockNumber);
  const depolyTx = await rootchainProvider.sendTransaction("0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222") // send deployment
  console.log(depolyTx.hash);
  console.log('Contract deployed On Root chain at address:', '0x3fab184622dc19b6109349b94811493bf2a45362');
 
  // Deploy on Child Chain
  const currentNonce = await childchainProvider.getTransactionCount(deployerChildChain.address);
  console.log("Current nonce:", currentNonce);
  const txResponse2 = await deployerChildChain.sendTransaction({nonce:currentNonce, to: '0x3fab184622dc19b6109349b94811493bf2a45362', value: ethers.utils.parseUnits('0.01', 'ether')}) // fund signer keyless deploymetn
  console.log("ChildChain: Transaction hash:", txResponse2.hash);
  // Wait for the transaction to be mined
  const receipt2 = await txResponse2.wait();
  console.log("ChildChain: Transaction confirmed in block:", receipt2.blockNumber);
  const depolyTx2 = await childchainProvider.sendTransaction("0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222") // send deployment
  console.log(depolyTx2.hash);
  console.log('ChildChain: Contract deployed at address:', '0x3fab184622dc19b6109349b94811493bf2a45362');

  }


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });