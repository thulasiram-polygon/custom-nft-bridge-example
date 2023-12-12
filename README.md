# CDK NFT bridge example

This folder provides an example on how to **Brige NFTs** using the  `polygonZKEVMBridge` for the CDK 

## Requirements

- node version: >= 14.x
- npm version: >= 7.x

## Deployment and usage instructions for the CDK NFT bridge example
It works on any EVM chain as L1(root chain ) and CDK as L2(child chain).
As an example `goerli`(or `geth` as root chain) and `polygonZKEVMTestnet` or `CDK`(as child chain):
This script will deploy on both networks the same contract using the deterministic deployment:

### Deployment

In project root execute:

```
npm i
cp .env.example .env
```

Fill `.env` with your

```
PRIVATE_KEY_ROOTCHAIN="Your-RootChain-private key"
PRIVATE_KEY_CHILDCHAIN="Your CDK private key"
ROOTCHAIN_URL="Root chain JSON rpc url"
CHILDCHAIN_URL="Child chain JSON rpc url"
BRIDGE_ADDRESS="CDK Bridge address"
CHILD_CHAIN_BRIDGE_API_URL="CDK Bridge API url"
```

In order to use the bridge, some scripts are provided:

We first need to deploy create2 factory contracts on both chains using the script:

```
npm run deploy:create2
```

Next, we need to deploy the bridge contracts on both chains using the script:

```
npm run deploy:bridge
```

Once the deployment is finished, we will find the results on `NFTBridge_output.json`


Next, we need to deploy Mock ERC721 contracts on the root chain using the script:

```
npm run deploy:mockNFT
```

Next, we need to mint some NFTs on the root chain using the script:

```
npm run mint:mockNFT
```

Next, we need to bridge the NFT on the root chain using the script:

```
npm run bridge:mockNFT
```

Now we have to wait until the message is forwarded to L2, there is a final script that will check it if the claim is ready. If it is ready, it will actually claim the NFT on the other layer:

```
npm run claim:mockNFT
```





