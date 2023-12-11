/* eslint-disable no-await-in-loop */
/* eslint-disable no-console, no-inner-declarations, no-undef, import/no-unresolved */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { ethers } = require('hardhat');
const AXIOS = require("axios");

const mekrleProofString = '/merkle-proof';
const getClaimsFromAcc = '/bridges/';

const nftBridgeDeployment = path.join(__dirname, '../deployment/NFTBridge_output.json');
const deployedNftBridgeAddress = require(nftBridgeDeployment).nftBridgeContract;
console.log(`deployedNftBridgeAddress: ${deployedNftBridgeAddress}`);

async function main() {
    const CHILD_CHAIN_URL = process.env.CHILDCHAIN_URL;
    const CHILD_CHAIN_BRIDGE_URL = process.env.CHILD_CHAIN_BRIDGE_API_URL;
    const BRIDGE_ADDRESS = process.env.BRIDGE_ADDRESS;

    let childchainProvider = new ethers.providers.JsonRpcProvider(
        CHILD_CHAIN_URL
      );

      let deployerChildChain;

      if (process.env.PRIVATE_KEY_CHILDCHAIN) {
        // Load deployer
        deployerChildChain = new ethers.Wallet(
          process.env.PRIVATE_KEY_CHILDCHAIN,
          childchainProvider
        );
        console.log(`Deployer ChildChain: ${deployerChildChain.address}`);
      } else {
        throw new Error("PRIVATE_KEY not found in .env file");
      }


    const axios = AXIOS.default.create({
        baseURL: CHILD_CHAIN_BRIDGE_URL,
      });

    const bridgeFactoryChildchain = await ethers.getContractFactory('PolygonZkEVMBridge', deployerChildChain);
    const bridgeContractChildchain = bridgeFactoryChildchain.attach(BRIDGE_ADDRESS);
    console.log(`Bridgecontract Rootchain: ${deployedNftBridgeAddress}`)
    const depositAxions = await axios.get(getClaimsFromAcc + deployedNftBridgeAddress, { params: { limit: 100, offset: 0 } });
    const depositsArray = depositAxions.data.deposits;

    if (depositsArray.length === 0) {
        console.log('Not deposits yet!');
        return;
    }
    console.log("depositsArray: ", depositsArray);

    for (let i = 0; i < depositsArray.length; i++) {
        const currentDeposit = depositsArray[i];
        if (currentDeposit.ready_for_claim) {

            if (currentDeposit.claim_tx_hash !== "") {
                console.log('already claimed: ', currentDeposit.claim_tx_hash);
                continue;
            }

            const proofAxios = await axios.get(mekrleProofString, {
                params: { deposit_cnt: currentDeposit.deposit_cnt, net_id: currentDeposit.orig_net },
            });

            const { proof } = proofAxios.data;
            const claimTx = await bridgeContractChildchain.claimMessage(
                proof.merkle_proof,
                currentDeposit.deposit_cnt,
                proof.main_exit_root,
                proof.rollup_exit_root,
                currentDeposit.orig_net,
                currentDeposit.orig_addr,
                currentDeposit.dest_net,
                currentDeposit.dest_addr,
                currentDeposit.amount,
                currentDeposit.metadata,
            );
            console.log('claim message succesfully send: ', claimTx.hash);
            await claimTx.wait();
            console.log('claim message succesfully mined');
        } else {
            console.log('Not ready yet!');
        }
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
