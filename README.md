[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE) [<img src="https://img.shields.io/badge/View-Video-red">](pending)

# Polkasend-APAC-Hackathon

Polkasend is a wallet and Point of Sale Superapp that combines TradFi with Web3, through Moonbeam and Polkadot's XCM services.

<img src="https://i.ibb.co/yB3qdr5/logoETH.png" width="20%">

<br>

Welcome, this is our project for Polkadot Hackathon: APAC Edition 2023

# IMPORTANT!

## Application:

Main App APK: [LINK](./WALLET_APK/app-release.apk)

POS App APK: [LINK](./POS_APK/app-release.apk)

Installation and Setup guide: [LINK](./INSTALL&SETUP.md)

## Here is our main demo video: 

[![Demo](https://i.ibb.co/g4W3ypx/image.png)](pending)

# Improvements and our thesis for this new Polkasend

The idea and project is vaguely based on a project that we developed last year that has participated in some hackathons. We just took the name it had, grabbed the idea to combine Traditional Finance and Web3 from it and that is basically it. For that project we used the Acala EVM and on the side of Traditional Finance we are using the Rapyd's sandbox (one of the biggest Fintech providers in the world). 

This is that project: https://devpost.com/software/polkasend

Nevertheless almost everything, but the name and some visuals, is completely NEW.

And we decided on that vehemently for this hackathon: EVERYTHING from this new Polkasend is developed from scratch (it was previously a progressive Webapp). And you can attest to that if you compare screenshots and functionalities. Even the code for the incorporation of Rapyd is all new as they also updated their platform. 

All this is new:

* Moonbeam EVM instead of Acala.
* Full Polkadot and Moonbeam EVM wallet with XCM services
* Moonbeam's XC-20 tokens and their equivalent on the Polkadot parachains. [ACA, ASTR, aUSD, BNC, DOT, IBTC, INTR, PARA, PHA, RING, USDT]
* Transfers from Moonbeam to Parachains through Moonbeam's X-Tokens Solidity Interface.
* Contactless transfers through WalletConnect 2.0 services, EVM and Polkadot compatible.
* From progressive Web app to Native application
* Everything regarding the Point of Sale is new.

### TLDR: Basically we just reused the name and some images.

# Introduction and Problem

## Industries being disrupted: ewallets, fintech and retail Point of Sale.

Banking the unbanked has always been a paradigm in the Web3 world.

Our team is based in Mexico, within a region with several challenges, an estimated 70% of economic transactions in Latin America are all cash. And just 50% have bank accounts. But, in contrast 78% has a cell phone with an internet connection.

<img src="https://i.ibb.co/tcxQWP3/inclusion-in-LATAM.jpg" width="90%">

These numbers are close and very similar to the APAC region. In Asia Pacific cash accounts for 57% of the transactions and just 76% has bank accounts. Of course in terms of mobile connections they boast much higher numbers reaching 98%! 

<img src="https://i.ibb.co/cYQYBdR/stats.png" width="90%">

Traditional Finance has proven itself unable to solve the great Chasm in both regions that comes from not having any kind of banking, and overusing cash not to mention a digital one.
We think that both regions are set to jump this chasm and generate new economies based on these technologies, which they already are doing. Despite this the crypto world has seldom focused on these regions and not really reached the retail or final consumer, until now.

<img src="https://i.ibb.co/cc0HFZc/fintech.png" width="90%">

<img src="https://i.ibb.co/86VHBv9/globalfintech.png" width="90%">

Of course, as the numbers show us that Digital Wallets are projected to overtake credit cards by 2024, we want to capitalize on that opportunity with Fintech and Web3 tools.

### Our goal for this project is to actually enable and get crypto at the point of sale.



# Solution

PolkaSend is a Mobile-First wallet, cash out ramp and Point of Sale Superapp. We combine TradFi through Rapyd with Web3 to improve Financial Inclusion in Mexico and LATAM

System's Architecture:

<img src="https://i.ibb.co/1JLrC59/Scheme-Polka-drawio-1.png">

- All Moonbeam transactions are controlled through [web3.js](https://web3js.readthedocs.io/) and [ethers](https://docs.ethers.org/).

- All Polkadot and Parachain transactions are controlled by [@polkadot/api](https://www.npmjs.com/package/@polkadot/api) and the connection to the blockchain is through the WsProvider module through RPC.

- The connection of the Wallet and the POS Dapp is used [WalletConnect 2.0](https://walletconnect.com/) as [Universal Provider](https://docs.Walletconnect.com/2.0/web/providers/universal) to sign transactions wirelessly or by NFC.

- Transaction history for Moonbeam EVM, Polkadot and Parachains is obtained by the [Subscan API](https://support.subscan.io/#introduction).

- Through Rapyd's APIs we can manage users, checkout, swap and KYC of our app. (https://www.rapyd.net/)

# Main App Screens:

<img src="https://i.ibb.co/Yj4K0HM/vlcsnap-2023-07-21-14h37m50s726.png" width="32%">
<img src="https://i.ibb.co/zxL0ptT/Screenshot-20230721-144024.png" width="32%">

- Through Rapyd, Moonbeam, Polkadot and Parachains we can have total control of the movements and transactions of our account in both Crypto and Fiat.

- Crypto Moonbeam

 <img src="https://i.ibb.co/pzqhhvb/vlcsnap-2023-07-21-14h38m01s262.png" width="32%"> <img src="https://i.ibb.co/N2FmQXP/Screenshot-20230721-144036.png" width="32%"> <img src="https://i.ibb.co/bQJxwgp/Screenshot-20230721-144044.png" width="32%">

 - Crypto Polkadot

 <img src="https://i.ibb.co/gyW7bN3/Screenshot-20230721-144050.png" width="32%"> <img src="https://i.ibb.co/5KnRWrH/Screenshot-20230721-144105.png" width="32%"> <img src="https://i.ibb.co/y40s4g7/Screenshot-20230721-144100.png" width="32%">

- Fiat

<img src="https://i.ibb.co/bbyMR24/vlcsnap-2023-04-23-18h09m38s018.png" width="32%"> <img src="https://i.ibb.co/LYdtt5m/vlcsnap-2023-04-23-18h05m59s400.png" width="32%"> <img src="https://i.ibb.co/vc04zNK/vlcsnap-2023-04-23-18h05m42s395.png" width="32%"> 

## Moonbeam -> Parachain - XCM-Transfer:

Through Moonbeam we can also make transfers XCM transfers with X-Tokens Solidity Interface.

- First we must click on the pay button.

  <img src="https://i.ibb.co/gzs17MQ/vlcsnap-2023-07-21-15h06m06s357.png" width="32%">

- With this component we can scan either wallets to make direct transfers or a Wallet Connect QR for connectivity with dapp, in this case we will scan a WalletConnect 2.0 QR, to connect to our POS Dapp. In the case of a transfer by XCM, we will select in the [POS](#pos-walletconnect-20-payments) the x-token that we are going to receive and the amount.
  
  <img src="https://i.ibb.co/xs5Rtz8/vlcsnap-2023-07-21-19h51m42s261.png" width="32%">
  <img src="https://i.ibb.co/kmwYxpp/vlcsnap-2023-07-21-19h46m50s055.png" width="32%">
  <img src="https://i.ibb.co/wppvTHC/vlcsnap-2023-07-21-19h15m03s208.png" width="32%">

- Once we accept the connection, the Connected to Dapp sign will appear and the same POS will send us the transaction request in a few seconds, which if it seems to be fine we will have to accept and sign like any other wallet.

    <img src="https://i.ibb.co/2Fyf8VG/vlcsnap-2023-07-21-19h15m16s395.png" width="32%">
    <img src="https://i.ibb.co/80xXxK0/vlcsnap-2023-07-21-19h15m29s711.png" width="32%"> <img src="https://i.ibb.co/F7pH4yD/vlcsnap-2023-07-21-19h15m36s060.png" width="32%">

- Finally we wait for the confirmation of the payment and reviewing it in the explorer we confirm that it is correct.

  <img src="https://i.ibb.co/MZ7RLwQ/image.png" width="32%">
  <img src="https://i.ibb.co/q7XtcBr/vlcsnap-2023-07-21-19h16m25s169.png" width="32%">

- The transaction carried out in this section is the following, you can check that the data is the same.

https://moonbeam.subscan.io/extrinsic/0xbb9d81e12609a30822c3b59156ee44c5424830fd0113006e4042e15a687f2e60

## Moonbeam Direct Transfer:

Through Moonbeam we can also make transfers directly between Moonbeam Wallets.

- First we must click on the pay button.

  <img src="https://i.ibb.co/gzs17MQ/vlcsnap-2023-07-21-15h06m06s357.png" width="32%">

- With this component we can scan either wallets to make direct transfers or a Wallet Connect QR for dapp connectivity, in this case we will scan a wallet.

  <img src="https://i.ibb.co/7zggHQK/vlcsnap-2023-07-21-15h06m15s335.png" width="32%">
  <img src="https://i.ibb.co/wpw9xKw/vlcsnap-2023-07-21-15h06m44s607.png" width="32%">

- In the case of a direct transfer, we will select the token that we are going to send and the amount. By pressing the Check button, the wallet will check that the transaction can be made with the balance we have at that time. If the transaction can be carried out, the button will change to Send and we will be able to carry out the transaction.

  <img src="https://i.ibb.co/Xkpz8nv/vlcsnap-2023-07-21-15h06m30s802.png" width="32%">
  <img src="https://i.ibb.co/XbMgrz6/vlcsnap-2023-07-21-15h06m49s035.png" width="32%">
  <img src="https://i.ibb.co/Jzcj2nM/vlcsnap-2023-07-21-15h06m53s064.png" width="32%">

- Once the Send button is pressed, a signature screen will appear for us to sign with our pin or biometrics. Going to a waiting screen until the transaction is in the blockchain and we can finally see it in the explorer.

  <img src="https://i.ibb.co/3NKg61m/vlcsnap-2023-07-21-15h06m59s656.png" width="32%">
  <img src="https://i.ibb.co/rpBpqnr/vlcsnap-2023-07-21-15h07m14s477.png" width="32%">
  <img src="https://i.ibb.co/G5r3hgJ/vlcsnap-2023-07-21-15h07m34s813.png" width="32%">

- The transaction carried out in this section is the following, you can check that the data is the same.

https://moonbeam.subscan.io/extrinsic/0xd7dbf6e856512d00e3e7583f0bd2e3b17b7192ccd323b6bb64449f8d2255fcab

## Polkadot and Parachains Direct Transfer:

Through Polkadot API we can also make transfers directly between Polkadot and Parachains Wallets.

- First we must click on the pay button.

  <img src="https://i.ibb.co/31q3Zpy/vlcsnap-2023-07-21-15h06m06s357-1.png" width="32%">

- With this component we can scan either wallets to make direct transfers or a Wallet Connect QR for dapp connectivity, in this case we will scan a wallet.

  <img src="https://i.ibb.co/vXxzjLq/vlcsnap-2023-07-21-15h21m02s190.png" width="32%">
  <img src="https://i.ibb.co/7r7WJqC/vlcsnap-2023-07-21-15h21m09s779.png" width="32%">

- In the case of a direct transfer, we will select the token that we are going to send and the amount, internally the wallet selects the correct method to move the asset, since some parachains vary from API method. [APPENDIX I](#appendix-i).

-  By pressing the Check button, the wallet will check that the transaction can be made with the balance we have at that time. If the transaction can be carried out, the button will change to Send and we will be able to carry out the transaction.

    <img src="https://i.ibb.co/SJ3qJSZ/vlcsnap-2023-07-21-15h21m13s727.png" width="32%">
    <img src="https://i.ibb.co/cFYnQP1/vlcsnap-2023-07-21-15h21m24s544.png" width="32%">
    <img src="https://i.ibb.co/SsNVbdR/vlcsnap-2023-07-21-15h21m27s818.png" width="32%">

- Once the Send button is pressed, a signature screen will appear for us to sign with our pin or biometrics. Going to a waiting screen until the transaction is in the blockchain and we can finally see it in the explorer.

  <img src="https://i.ibb.co/xf8W290/vlcsnap-2023-07-21-15h21m46s845.png" width="32%">
  <img src="https://i.ibb.co/mzmZVs5/vlcsnap-2023-07-21-15h22m27s498.png" width="32%">
  <img src="https://i.ibb.co/KGtSk4Q/vlcsnap-2023-07-21-15h22m46s070.png" width="32%">

- The transaction carried out in this section is the following, you can check that the data is the same.

https://phala.subscan.io/extrinsic/0x1b6c65538305ef1c3051a63cb3485ccc0e75bd8cf879f2ff9c7f7ec50e363eaf

## Swap Transfers:
- We carry out Moonbeam (GLMR) and Fiat transfers by coordinating the services of Moonbeam and Rapyd. Transferring the equivalent of Moonbeam or USD currency from PolkaSend Master accounts.

  <img src="https://i.ibb.co/MSpXfW5/vlcsnap-2023-06-26-23h46m44s348.png" width="32%">

## Fiat Services:

- At the same time, we can obtain a virtual card from the Rapyd API to be able to spend the money from our Fiat account directly.

  <img src="https://i.ibb.co/LYdtt5m/vlcsnap-2023-04-23-18h05m59s400.png" width="32%">

- Additionally, we can make a Card Debit deposit from our Fiat account to a any debit cards.

  <img src="https://i.ibb.co/hFPLBYk/vlcsnap-2022-09-17-16h09m10s480.png" width="32%">

- This is a screenshot of our backend in Rapyd.

  <img src="https://i.ibb.co/vXD3Hzf/image.png">

## Rapyd KYC:

- The KYC of our application is controlled by Rapyd and to confirm it, the documents must match the user's registration.
  
  <img src="https://i.ibb.co/vsR05Pj/vlcsnap-2023-04-23-18h14m12s756.png" width="32%">

# Point of Sale application:

- The Point of Sale application is more focused on the simple reception of payments and an interface focused on generating payment orders through QR or NFC.

- The POS allows us to see the Moonbeam EVM, Polkadot and Fiat balances received along with the list of transactions just like the Main App.

    <img src="https://i.ibb.co/Sthqt5z/Screenshot-20230721-210343.png" width="32%">
    <img src="https://i.ibb.co/DYx00yk/Screenshot-20230721-210326.png" width="32%">
    <img src="https://i.ibb.co/NSZs5QQ/Screenshot-20230721-210317.png" width="32%">
  
## POS - WalletConnect 2.0 Payments:

- One of the most important processes is being able to make payments at the POS through WalletConnect 2.0, being this the pillar of our device. Since this provides a payment experience similar to current contactless payments, in turn being able to make payments with any of the X-Tokens available in the moonbeam network, payments can be made either between the networks as a traditional transaction or cross chain using the XCM language, for example we will show how a transaction is made from moonbeam to a parachain.

  <img src="https://i.ibb.co/L6Sv9bn/vlcsnap-2023-07-21-20h09m29s388.png" width="32%" >
  <img src="https://i.ibb.co/QkMJ2Mr/vlcsnap-2023-07-21-20h09m50s015.png" width="32%">
  <img src="https://i.ibb.co/txZrQHw/vlcsnap-2023-07-21-20h10m06s933.png" width="32%">

- When the reference is created by QR, it can be paid through any wallet compatible with WalletConnect 2.0, however our Main App also allows payment through NFC. According to the token selection, the POS will configure the transaction with the correct multilocation address [Appendix II](#appendix-ii).

    <img src="https://i.ibb.co/2KH3gbz/vlcsnap-2023-07-21-20h10m13s631.png" width="32%">
    <img src="https://i.ibb.co/7rhx4Jv/vlcsnap-2023-07-21-20h10m46s015.png" width="32%">
    <img src="https://i.ibb.co/BGdjkRM/vlcsnap-2023-07-21-20h10m50s739.png" width="32%">

- The section of code that configures the multilocation address is the following, it is extremely important that it is correct otherwise the funds could be lost.

        const multilocation = [
            1,
                [
                    parachainId,
                    '0x01' + decodePolkaAddress(polkaAccount) + '00',
                ],
            ];

- Once the reference payment has been made, we will be able to see the confirmed and verified messages.

- In addition, we provide a printed receipt with the URL where you can check your transaction.

  <img src="https://i.ibb.co/VJDN1nx/vlcsnap-2023-07-21-20h11m19s366.png" width="32%">

- Let's print!

    <img src="./IMG/gifPrint.gif" width="32%">

# Current state and what's next

This application is directed at those who cannot benefit directly from cryptocurrency. It has the usual, both crypto and fiat wallets, transfers between crypto and fiat, transfers between crypto accounts and it gives a spin on the cash in - cash out portion of the equation as no other project provides it. It is very important if this application is going to benefit and bank people to be very agile and compatible with FIAT at least until crypto reaches mass market. Most of the developed world has not even incorporated to legacy electronic systems. In addition to that the incorporation of a Point of Sale thought mainly for SMEs is something that can be key in augmenting the change for further adoption. 

I think we can make the jump from those systems almost directly to self-banking, such as the jump that was made in some parts of Africa and even here in Latin America from skipping telephone landlines directly to Mobile phones. If that jump was made from that type of technology this one can be analogous and possible. 

Perhaps the most important feedback we have obtained is that we have to show how our application will ensure the enforcement of anti-laundering laws. 

We will do that will strong KYC. And at the same time Mexico has published since 2018 strong laws to manage that including its fintech law.

https://en.legalparadox.com/post/the-definitive-guide-mexican-fintech-law-a-look-3-years-after-its-publication#:~:text=The%20Mexican%20FinTech%20Law%20was,as%20Artificial%20Intelligence%2C%20Blockchain%2C%20collaborative

Quoting: " The Mexican FinTech Law was one of the first regulatory bodies created specifically to promote innovation, the transformation of traditional banking and credit financial services that would even allow the possibility of incorporating exponential technology such as Artificial Intelligence, Blockchain, collaborative economies and peer-to-peer financial services in secure regulatory spaces. "

All of this was a silent revolution that happened in this jurisdiction after the HSBC money-laundering scandal that included cartels and some other nefarious individuals. 
https://www.investopedia.com/stock-analysis/2013/investing-news-for-jan-29-hsbcs-money-laundering-scandal-hbc-scbff-ing-cs-rbs0129.aspx

Thus, the need for Decentralized solutions.

Security and identity verification of the clients who use the app is paramount for us, and to thrive in this market we need this to emulate incumbents such as Bitso. We think our technology is mature enough if we compare with these incumbents and much safer. 

Of course, the main plan is to launch this application both the wallet and test the PoS system with several businesses at a retail level through pilots that we are already obtaining at this very moment.

Though our time with certain mentors during the Hackathon we were shared several insights both technical and on the business development side that will map the next upgrades to the project:

- To have a conversion ready for the final user in a currency he can understand, this happens when we do not use Stablecoins. (from Kasper Mai Joergensen)

- Improve or remove the seed phrase process for the PoS. (from Kasper Mai Joergensen)  

- Incorporate the SmolDOT light client instead of an RPC and refer to XCM correctly as a language xD. (from Leonardo Razovic)

- Improve the UX and incorporate CRM utilities for businesses. (from Victor Estival)

- Mind the Polkadot grants and support, and learn to market. (Victor Estival)

- Improve on the delivery of the project and perhaps experiment with DeFi tools (Daniel Bigos)

- Go further though several of the other Moonbeam tools and experiment (Kevin Neilson) 

- But in essence our plan is to launch the Wallet and run pilots for the PoS while we secure funding.



Hopefully you liked the Mobile DApp and Point of Sale.

# Team

#### 3 Engineers with experience developing IoT and hardware solutions. We have been working together now for 5 years since University.

[<img src="https://img.shields.io/badge/Luis%20Eduardo-Arevalo%20Oliver-blue">](https://www.linkedin.com/in/luis-eduardo-arevalo-oliver-989703122/)

[<img src="https://img.shields.io/badge/Victor%20Alonso-Altamirano%20Izquierdo-lightgrey">](https://www.linkedin.com/in/alejandro-s%C3%A1nchez-guti%C3%A9rrez-11105a157/)

[<img src="https://img.shields.io/badge/Alejandro-Sanchez%20Gutierrez-red">](https://www.linkedin.com/in/victor-alonso-altamirano-izquierdo-311437137/)


## References:

https://egade.tec.mx/es/egade-ideas/opinion/la-inclusion-financiera-en-mexico-retos-y-oportunidades

https://www.cnbv.gob.mx/Inclusi%C3%B3n/Anexos%20Inclusin%20Financiera/Panorama_IF_2021.pdf?utm_source=Panorama&utm_medium=email

https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2021/OtrTemEcon/ENDUTIH_2020.pdf

https://www.cnbv.gob.mx/Inclusi%C3%B3n/Anexos%20Inclusin%20Financiera/Panorama_IF_2021.pdf?utm_source=Panorama&utm_medium=email

https://www.rappi.com

https://www.rapyd.net/

https://www.gsma.com/mobileeconomy/wp-content/uploads/2022/07/GSMA_APAC_ME_2022_R_Web_Final.pdf

https://www.pointer.gg/tutorials/solana-pay-irl-payments/944eba7e-82c6-4527-b55c-5411cdf63b23#heads-up:-you're-super-early

https://worldpay.globalpaymentsreport.com/en/market-guides/mexico

https://www.sipa.columbia.edu/academics/capstone-projects/cryptocurrency-and-unbankedunderbanked-world

# Appendix I:

APIs used to transfer assets according to the parachain or token.

Acala USD: 

    api.tx.currencies.transfer(
        to_address,
        {Token: 'AUSD'},
        amount,
    );
Acala: 

    api.tx.balances.transfer(
        to_address,
        amount
    )

Astar:

    api.tx.balances.transfer(
        to_address,
        amount
    )

Bifrost:

    api.tx.balances.transfer(
        to_address,
        amount
    )

Polkadot:

    api.tx.balances.transfer(
        to_address,
        amount
    )

Interlay:

    api.tx.tokens.transfer(
        to_address,
        {Token: 'INTR'},
        amount
    )

Interlay BTC:

    api.tx.tokens.transfer(
        to_address,
        {Token: 'IBTC'},
        amount
    )

Parallel:

    api.tx.balances.transfer(
        to_address,
        amount
    )

Phala:

    api.tx.balances.transfer(
        to_address,
        amount
    )

Darwinia:

    api.tx.balances.transfer(
        to_address,
        amount
    )

AssetHub (Statemint):

    api.tx.assets.transfer(
        1984, // USDT
        to_address,
        amount
    );

# Appendix II:

Acala: 

- RPC: wss://acala-rpc.dwellir.com
- ParachainId: 0x00000007D0
- WalletConnectId: fc41b9bd8ef8fe53d58c7ea67c794c7e

Astar:

- RPC: wss://rpc.astar.network
- ParachainId: 0x00000007D6
- WalletConnectId: 9eb76c5184c4ab8679d2d5d819fdf90b

Bifrost:

- RPC: wss://hk.p.bifrost-rpc.liebi.com/ws
- ParachainId: 0x00000007EE
- WalletConnectId: 262e1b2ad728475fd6fe88e62d34c200

Polkadot:

- RPC: wss://polkadot-public-rpc.blockops.network/ws
- ParachainId: 0x0000000000
- WalletConnectId: 91b171bb158e2d3848fa23a9f1c2518

Interlay:

- RPC: wss://interlay-rpc.dwellir.com
- ParachainId: 0x00000007F0
- WalletConnectId: bf88efe70e9e0e916416e8bed61f2b45

Parallel:

- RPC: wss://rpc.parallel.fi
- ParachainId: 0x00000007DC
- WalletConnectId: e61a41c53f5dcd0beb09df93b34402aa

Phala:

- RPC: wss://phala.api.onfinality.io/public-ws
- ParachainId: 0x00000007F3
- WalletConnectId: 1bb969d85965e4bb5a651abbedf21a54

Darwinia:

- RPC: wss://rpc.darwinia.network
- ParachainId: 0x00000007FE
- WalletConnectId: 3cc73806aa66ef26e3ac31109e6bd17d

AssetHub (Statemint):

- RPC: wss://statemint-rpc.polkadot.io
- ParachainId: 0x00000003E8
- WalletConnectId: 68d56f15f85d3136970ec16946040bc1
