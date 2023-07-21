# PolkaSend

<img src="https://i.ibb.co/Y7tf4xH/logo-Polka.png">

PolkaSend is a Alaca EVM+ based DeFi dapp that works in tandem with ChainLink, IPFS and Rapyd to offer a fiat ramp, price data feeds, cash out and an Instant messenger where you can chat and send Acala tokens and NFTs through chat or by scanning the QR.

**IF YOU'RE A JUDGE YOU CAN TEST OUR APPLICATION HERE:**

WEBAPP: https://www.polkasend.online/

- email: polkauser@polkasend.com 
- password: toortoor

# Introduction and Problem

Over the last decade, most economies in Latin America and the Caribbean have displayed sustained growth and macroeconomic stability leading to the emergence of growing middle classes. Despite these advances, poverty and inequality levels remain high and financial exclusion still affects important sectors of the population, which can hinder future economic and social development.

<img src="https://i.ibb.co/SQkXJsw/image.png">

El Salvador’s experiment with Bitcoin has justifiably intrigued much of the financial world. That focus might be missing the much larger story. Regardless of the outcome of El Salvador’s cryptocurrency venture, mobile phones, fintech, DeFi, blockchain technology, and cryptocurrency, are poised to drastically alter banking and commerce, and potentially economic stability, throughout the region.

<img src="https://i.ibb.co/PDvN6MY/image.png">

Nevertheless there are several challenges, an estimated 70% of economic transactions in Latin America are all cash. And just 50% has bank accounts. But, in contrast 78% has a cellphone with internet connection and among those more than 99% use Instant messenger apps. We think that the region is set to jump this chasm and generate new economies based in these technologies such as the jump several countries had from nothing to mobile phones without passing through landlines.

We just need the correct tools, applications and technologies.

# Diagram:

<img src="https://i.ibb.co/RhFhJgy/Scheme-drawio.png">

- The main services we are using is Mandala TC7, ChainLink, IPFS and Rapyd.
- Mandala TC7 is our main blockchain, where thanks to its low fees we can provide the following services.
  - Official Docs: 
    - https://evmdocs.acala.network/network/network-configuration
  - Decentralized Chat.
  - Transfer tokens and NFT's
- Blockscout (Mandala):
  - Provides us with a very efficient API to obtain data from our NFT's and Token balances in our account.
- Chainlink, thanks to its data feeds, provides us with the possibility of consuming them directly within a smart contract.
- Rapyd allows us, on your side, to carry out the KYC to use the Fiat services and also to checkout our fiat money through a virtual card or transfer.
- The Swap is the only section where we coordinate Rapyd and Mandala TC7 services to be able to exchange Acala to Fiat money.

# Walkthrough:

You can find the link, login and password to use our application at the top. Once inside the platform you will see our Chainlink-based price feed as the first screen.

<img src="https://i.ibb.co/FDY9g6Q/main2-1.png">

At the second phone in the image we can see that this feed is based on the data feeds of Mandala TC7 Testnet. As you can see the prices shown on the website are the same as in our Dapp since they come from the same source, the contract as already mentioned is displayed in the Mandala TC7 network Testnet.

In turn we show the contract directly in Remix to show that we are consuming its Data Feeds.

<img src="https://i.ibb.co/pZT6tNt/chainlink-1.png">

Next (third phone on the image with three phones) we can see our balances and transactions of Fiat and Crypto. All balances of the NFT tokens and the Acala are obtained from the Blockscout APIs.

<img src="https://i.ibb.co/7bVzpV8/image.png">

Code:

    var config = {
        method: 'get',
        url: `https://blockscout.mandala.acala.network/api?module=account&action=tokenlist&address=${address}`,
        headers: {}
    };
    axios(config)
    .then((response) => {
        let temp = response.data.result.filter(x => x.type === "ERC-721")
        resolve(temp.map((item) => (
            {
                contractAddress: item.contractAddress,
            }
        )));
    })
    .catch((error) => {
        reject([]);
    });

Finally, in the last button you can complete the KYC through Rapyd to verify your identity.

In the swap section (first phone in the next image) we can make an exchange between our Fiat account and our crypto account, we only have to select if we want to convert Crypto to Dollar or Dollar to Crypto. Once the transaction is signed and the operation is finished in the home section we will be able to see how we have already received our money in our Fiat account and deducted it from our Crypto account.

<img src="https://i.ibb.co/Ns5SYRs/main4-1.png">

In our Cash out section (Second phone in the image above) we will have 2 options, generate a virtual debit card where we can use our Fiat money or make an electronic transfer to another debit card, either visa or mastercard.

## Messenger:

Since each message is sent to a smart contract, we must sign the transaction and pay the fee for the transaction. Once the message is sent, we can see it appear in the chat.

<img src="https://i.ibb.co/6WDvd0k/main5-1.png">

We have to mention that everything regarding the messenger was developed with Mandala TC7 and every transaction or message is wallet signed in the background.

https://github.com/altaga/PolkaSend/blob/main/Contracts/Chat.sol

At the same time we integrate a chat section, where we can talk to any address on the same network, first we put the address with which we want to talk and we can start sending messages, in this case it is possible to send messages, send attached money or even send an NFT.

## QR Transfer:

As it is already an essential part of any wallet, we also have the ability to make transfers by scanning a QR.

<img src="https://i.ibb.co/7bLCBsm/image1.png">

In this case, in order to carry out this example, real cell phones were used (in fact, it is the same transaction that you can see in our demo).

<img src="https://i.ibb.co/rftj7Ns/image3.png">

# What's next for PolkaSend

PolkaSend is a Dapp capable of swapping, cashing out and messaging, where you can save and send NFTs, all registered within the Mandala TC7 network. During the creation process, the incorporation of IPFS was complex because we wanted to integrate it with our blockchain-abled instant messenger. This is where choosing Mandala TC7 as our Blockchain of choice paid out as the assembly of all the concepts was easy enough after reading some documentation and using some templates. For future steps we want to improve the UI to make it as intuitive and user friendly as possible. We will be seeking to launch a beta to test the performance of the application.

# References

- https://www.caf.com/en/currently/news/2020/08/inclusion-and-financial-literacy-keys-to-reducing-gaps-in-latin-america-and-the-caribbean/#:~:text=In%20Latin%20America%20and%20the%20Caribbean%2C%20while%20financial%20inclusion%20levels,access%20to%20formal%20financial%20services.

- https://iamericas.org/latin-america-in-crypto-defi-cbdc-blockchain-transition/

- https://docs.chain.link/docs/using-chainlink-reference-contracts/

- https://evmdocs.acala.network/

- https://blockscout.mandala.acala.network/

- https://ipfs.io/