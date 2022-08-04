# BETA

## smart-contract-generator
This repository is destinated to engineers who are going to develop the Smart Contract Generator feature for [Zero-Code.io](https://zero-code.io). The following description is more of a technical brief than a "how to use" description. We invite you to refer to this file as a reminder of what's needed to be done. 

## Why are we building this feature?
We want to help our users to set their Smart Contract &amp; to deploy their NFTs on public marketplaces

## Feature description
### Users should be able to set their Smart Contract by going through the following steps 
- Register to account (name, email, referral code, phone number)
- Create Contract (or select one that’s already created)
- Pickup Smart-Contract type (ERC721, ERC1155, ERC20, ERC721 Azuki)
- Select your Blockchain (ETH, Polygon, BNB, Tezos, Solana, Flow)
- General information (IPFS metadata URL or upload, name, mint price, max NFTs per transaction, collection size, token symbol, max NFT per person)
- Features:
    - Delay reveal: placeholder IPFS url to revealed metadata
    - whitelist: whitelist price & max nft per whitelisted person
- Primary sales revenue splits: shareholders wallet address & shares %
- Marketplace (OpenSea, Rarible)
    - (optional) collection names, project url, royalties, royatiles wallet address, description
- Verify everything & deploy contract

### After deploying NFT on the blockchain, users should be able to do some advanced settings 
- Select start and end date & time of Pre-sales. This feature will allow users to schedule their (limited) minting period for whitelisted wallets. 
- Upload whitelist to gate mint during the pre-sale. Whitelisted wallets will be able to mint their NFTs before the opening of public sales.
- Open or close Public sales. The open Public sales button could be manually activated on the minting day and would allow the community to start minting their NFTs. The close of Public sales button is usually used to manually end sales at the end of a time-limited drop. 
Select airdrop addresses to send them free NFTs. That’s usually used to incentivize the community before a drop or to reward holders.
- Update the price of the NFTs. That would allow users to choose an NFT selling price that’s more adapted to the demand. 
- Update metadata (usually users would upload the IPFS address since this address gets updated when either the metadata or the artwork are changed) 
- Update max per mint (that should allow users to fix the maximum number of purchasable NFTs per wallet so they prevent Whales from buying all NFTs at once)

### Users should also be able to create a minting button 
- Select Collection (Created Smart Contract)
- Select link Marketplace, past collection URL in the marketplace & click link
- Select add minting button: input button name, select drop datetime, create
- Display the time before minting
- Copy iframe to embed in the website

## Functionality Requirements overview
- Store artwork (image & metadata) on IPFS
- Set Smart Contracts (name, description, number of copies, royalties & type of minting)
- Deploy on public NFT marketplaces (Rarible & Opensea)
- Software Language tools & Technical Requirements
- Connection to Ethereum Mainnet & Matic Mainnet
- ERC 721 & ERC 1155 Smart Contract generation. ERC 721 will be used to upload one single NFT on the blockchain & ERC 1155 will be used to upload multiple NFTs that belong to the same collection. 
- IFrame generation. This code warps the Mint button and can be embedded into the user's Web3 page. (cf brief Web3 Builder) 
- Development in Solidity language & using Web3.js functions for setting up Smart Contracts
- JavaScript, TypeScript, HTML5, CSS3 and ReactJS Framework for frontend development
- State management patterns and solutions with Redux & NgRx toolkits
- JavaScript project environment setting with Webpack, Babel & Eslint toolkits
- Continuous Integration using Jenkin. Frequent Git commits & merges. That should handle the technical dept
- Continuous Deployment on Kubernetes. That should keep the product evolution stick to customers' needs. 

## Success Criteria
- Mint NFTs with key wallets such as Metamask, Coinbase, ConnectWallet (this wallet can give access to other key ones such as Alpha, Math & Trust)
- Deploy NFT on Rarible & OpenSea
- Create a Minting button
- Mint from Desktop & Mobile


## Sources that may help you have an in-depth understanding of what’s needed to be done
- [Create an NFT minting button with ZeroCodeNFT](https://www.youtube.com/watch?v=_cIU62JmmJI)
- [How to create a NFT minting website (No Code)](https://www.youtube.com/watch?v=9IzPDi_ygzw&t=589s) | The easiest way / best method
Watch this Youtube video from min3:00 to min10:00. It explains the User flow we want to create.  


Connect to this platform using Phantom wallet on Solana’s blockchain, click the [“General Mint Setting”](https://novalaunch.art/dashboard/mint-settings) tab in the left panel menu and follow the set steps to get a better understanding of the user flow we want to build. Then click on the 
[“Solana Mint Account”](https://novalaunch.art/dashboard/mint-accounts) button in the left panel and do the same thing. 

