// Basic Imports
import React, { Component } from "react";
import {
  Image,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
// Components Local
import Header from "./components/header";
import Footer from "./components/footer";
// Utils
import reactAutobind from "react-autobind";
// Utils Local
import ContextModule from "../utils/contextModule";
// Styles
import GlobalStyles from "../styles/styles";

import {
  geckoNative,
  geckoTokens,
  NODE_ENV_NETWORK_RCP,
  NODE_ENV_CHAINLINK_FEED_CONTRACT,
  NODE_ENV_DATA_FEEDS_RCP,
  tokens,
  tokensContracts,
  contentColor,
  native,
  xGeckoTokens,
  xtokens,
  xtokensIcons,
  tokensIcons,
  nativeIcon,
  RapydURL,
} from "../../env";

// Price Feeds Contract
import { abiFeeds } from "../contracts/priceFeedContract";
import { abiERC20 } from "../contracts/erc20";
// Price Feeds Assets
import avax from "../assets/FeedAssets/avax.png";
import bnb from "../assets/FeedAssets/bnb.png";
import btc from "../assets/FeedAssets/btc.png";
import dot from "../assets/FeedAssets/polkadot.png";
import eth from "../assets/FeedAssets/eth.png";
import link from "../assets/FeedAssets/link.png";
import matic from "../assets/FeedAssets/polygon.png";
import neo from "../assets/FeedAssets/neo.png";
import sol from "../assets/FeedAssets/sol.png";
import usdc from "../assets/FeedAssets/usdc.png";
import xrp from "../assets/FeedAssets/xrp.png";
// Chainlink Price feeds
import Web3 from "web3";

function epsilonRound(num) {
  const zeros = 2;
  return (
    Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

async function getUSD(array) {
  return new Promise((resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${array.toString()}&vs_currencies=usd`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => resolve(JSON.parse(result)))
      .catch((error) => console.log("error", error));
  });
}

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Price Feeds
      prices: [],
      symbol: [
        "AVAX",
        "BNB",
        "BTC",
        "DOT",
        "ETH",
        "LINK",
        "MATIC",
        "NEO",
        "SOL",
        "XRP",
      ].concat([native]).concat(tokens).concat(xtokens),
      icons: [
        avax,
        bnb,
        btc,
        dot,
        eth,
        link,
        matic,
        neo,
        sol,
        xrp,
      ].concat([nativeIcon]).concat(tokensIcons).concat(xtokensIcons),
    };
    reactAutobind(this);
    this.axios = require("axios");
    this.source = this.axios.CancelToken.source();
    this.web3 = new Web3(NODE_ENV_NETWORK_RCP);
    this.web3Feeds = new Web3(NODE_ENV_DATA_FEEDS_RCP);
    this.interval = null;
    this.mount = true;
    this.flag = true;
    this.contract = new this.web3Feeds.eth.Contract(
      abiFeeds,
      NODE_ENV_CHAINLINK_FEED_CONTRACT
    );
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener("focus", () => {
      this.interval = null;
      this.mount = true;
      this.flag = true;
      //Rapyd
      this.getBalanceRapyd();
      // Tokens USD
      this.getUSDTokens();
      // Native
      this.web3.eth.getBalance(this.context.value.account).then((res) => {
        this.context.setValue({
          ethBalance: this.web3.utils.fromWei(res, "ether"),
        });
      });
      // Tokens
      tokensContracts.forEach((item, index) => {
        this.getBalanceToken(this.context.value.account, item).then((resp) => {
          let json = {};
          json[tokens[index]] = resp;
          this.context.setValue({
            tokenBalances: {
              ...this.context.value.tokenBalances,
              ...json,
            },
          });
        });
      });
      this.interval = setInterval(async () => {
        if (this.flag) {
          this.flag = false;
          await this.updatePriceFeeds();
          this.flag = true;
        }
      }, 10000);
    });
    this.props.navigation.addListener("blur", () => {
      this.setState({});
      this.mount = false;
      this.flag = false;
      clearInterval(this.interval);
    });
   
  }

  componentWillUnmount() {
    this.mount = false;
    clearInterval(this.interval);
  }

  async getUSDTokens() {
    let array = [geckoNative].concat(geckoTokens);
    let results = await getUSD(array);
    let ethUSD = results[geckoNative].usd;
    let tokenUSD = {};
    geckoTokens.map(
      (item, index) => (tokenUSD[tokens[index]] = results[item].usd)
    );
    this.context.setValue({
      ethUSD,
      tokenUSD,
    });
  }

  async getBalanceRapyd() {
    this.axios({
      method: "get",
      url: `${RapydURL}/get-account-balance`,
      headers: {
        ewallet: this.context.value.ewallet,
      },
      cancelToken: this.source.token,
    })
      .then((response) => {
        if (response.data.data.accounts.length > 0) {
          this.context.setValue({
            phone: response.data.data.phone_number,
          });
          response.data.data.accounts.forEach((element) => {
            if (element.currency === "MXN") {
              this.context.setValue({
                fiatBalanceMXN: element.balance,
              });
            } else if (element.currency === "USD") {
              this.context.setValue({
                fiatBalanceUSD: element.balance,
              });
            }
          });
        } else {
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getBalanceToken(address, tokenAddress) {
    return new Promise(async (resolve, reject) => {
      const contract = new this.web3.eth.Contract(abiERC20, tokenAddress);
      let res = await contract.methods.balanceOf(address).call();
      let decimals = await contract.methods.decimals().call();
      resolve(res / Math.pow(10, decimals));
    });
  }

  async updatePriceFeeds() {
    const geckoNatTok = [geckoNative].concat(geckoTokens).concat(xGeckoTokens);
    let [
      priceAVAX,
      priceBNB,
      priceBTC,
      priceDOT,
      priceETH,
      priceLINK,
      priceMATIC,
      priceNEO,
      priceSOL,
      priceXRP,
      results
    ] = await Promise.all([
      this.contract.methods.getLatestAVAXPrice().call(),
      this.contract.methods.getLatestBNBPrice().call(),
      this.contract.methods.getLatestBTCPrice().call(),
      this.contract.methods.getLatestDOTPrice().call(),
      this.contract.methods.getLatestETHPrice().call(),
      this.contract.methods.getLatestLINKPrice().call(),
      this.contract.methods.getLatestMATICPrice().call(),
      this.contract.methods.getLatestNEOPrice().call(),
      this.contract.methods.getLatestSOLPrice().call(),
      this.contract.methods.getLatestXRPPrice().call(),
      getUSD(geckoNatTok)
    ]);

    // To be improve
    const prices = [
      epsilonRound(parseFloat(priceAVAX.toString()) / 100000000),
      epsilonRound(parseFloat(priceBNB.toString()) / 100000000),
      epsilonRound(parseFloat(priceBTC.toString()) / 100000000),
      epsilonRound(parseFloat(priceDOT.toString()) / 100000000),
      epsilonRound(parseFloat(priceETH.toString()) / 100000000),
      epsilonRound(parseFloat(priceLINK.toString()) / 100000000),
      epsilonRound(parseFloat(priceMATIC.toString()) / 100000000),
      epsilonRound(parseFloat(priceNEO.toString()) / 100000000),
      epsilonRound(parseFloat(priceSOL.toString()) / 100000000),
      epsilonRound(parseFloat(priceXRP.toString()) / 100000000),
    ].concat(geckoNatTok.map((item) => results[item].usd));
    this.mount &&
      this.setState({
        prices
      });
  }

  render() {
    return (
      <>
        <View style={GlobalStyles.container}>
          <Header />
          <View style={GlobalStyles.mainSub}>
            <View style={{ height: "20%", marginTop: 30 }}>
              <Text
                style={{ textAlign: "center", color: "white", fontSize: 24 }}
              >
                Total Balance
              </Text>
              <Pressable
                onPress={() =>
                  this.context.setValue({
                    show: !this.context.value.show,
                  })
                }
              >
                <Text
                  style={{ textAlign: "center", color: "white", fontSize: 36 }}
                >
                  {"$ "}
                  {this.context.value.show
                    ? epsilonRound(
                        this.context.value.ethBalance *
                          this.context.value.ethUSD +
                          tokens
                            .map(
                              (item) =>
                                this.context.value.tokenBalances[item] ??
                                0 * this.context.value.tokenUSD[item] ??
                                0
                            )
                            .reduce((partialSum, a) => partialSum + a, 0) +
                          this.context.value.fiatBalanceUSD +
                          this.context.value.fiatBalanceMXN / 20,
                        2
                      )
                    : "***"}
                  {" USD"}
                </Text>
              </Pressable>
              <View
                style={{
                  backgroundColor: contentColor,
                  height: 1,
                  width: "90%",
                  alignSelf: "center",
                  marginTop: 30,
                }}
              />
            </View>
            <View style={{ height: "70%", marginTop: -30 }}>
              <Text
                style={{ textAlign: "center", color: "white", fontSize: 24 }}
              >
                Markets
              </Text>
              {this.state.prices.length === 0 ? (
                <View style={{ marginTop: "50%" }}>
                  <ActivityIndicator size={60} color={contentColor} />
                </View>
              ) : (
                <ScrollView>
                  {this.state.prices.map((price, index) => {
                    return (
                      <View key={"Feed:" + index} style={[{ width: "100%" }]}>
                        <View
                          style={{
                            marginVertical: 10,
                            marginHorizontal: 20,
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                            alignItems: "center",
                            backgroundColor: contentColor,
                            height: 50,
                            borderRadius: 100,
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              width: "33.33%",
                              textAlign: "center",
                              fontSize: 18,
                            }}
                          >
                            {this.state.symbol[index]}
                          </Text>
                          <View style={{ width: "33.33%" }}>
                            <Image
                              source={this.state.icons[index]}
                              style={{
                                width: 30,
                                height: 30,
                                alignSelf: "center",
                              }}
                            />
                          </View>
                          <Text
                            style={{
                              color: "white",
                              width: "33.33%",
                              textAlign: "center",
                              fontSize: 18,
                            }}
                          >
                            ${price}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
        <Footer navigation={this.props.navigation} />
      </>
    );
  }
}

export default Landing;
