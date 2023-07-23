// Basic Imports
import React, { Component } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
// Crypto
import Web3 from "web3";
// Contracts
// Components Local
import Footer from "./components/footer";
import Header from "./components/header";
// Utils
import reactAutobind from "react-autobind";
// Utils Local
import ContextModule from "../utils/contextModule";
// Styles
import GlobalStyles from "../styles/styles";
// Assets

import IconMI from "react-native-vector-icons/MaterialIcons";
import IconMCI from "react-native-vector-icons/MaterialCommunityIcons";

import Chart from "./cryptoAccountComponentsPolka/chart";

import {
  APIsubscan,
  contentColor,
  headerColor,
  nativeIconPolka,
  nativePolka,
  NetworkName,
  NODE_ENV_NETWORK_RCP,
  polkaTokens,
  xcolors,
  xGeckoTokens,
  xtokensIcons,
} from "../../env";

function epsilonRound(num, zeros = 4) {
  return (
    Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

class PolkaAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      modal: false,
    };
    reactAutobind(this);
    this.web3 = new Web3(NODE_ENV_NETWORK_RCP);
    this.mount = true;
    this.controller = new AbortController();
  }

  static contextType = ContextModule;

  getUSD(array) {
    return new Promise((resolve, reject) => {
      var myHeaders = new Headers();
      myHeaders.append("accept", "application/json");

      var requestOptions = {
        signal: this.controller.signal,
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${array.toString()}&vs_currencies=usd`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch((error) => console.log("error", error));
    });
  }

  async componentDidMount() {
    this.props.navigation.addListener("focus", async () => {
      this.mount = true;
      // Native
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("X-API-Key", APIsubscan);

      var raw = JSON.stringify({
        address: this.context.value.polkaAccount,
      });

      var requestOptions = {
        signal: this.controller.signal,
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };
      let result = await new Promise((resolve, reject) =>
        fetch(
          "https://polkadot.api.subscan.io/api/scan/multiChain/account",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => resolve(result))
          .catch((error) => console.log("error", error))
      );
      let results = await this.getUSD(xGeckoTokens);
      let tokenPolkaUSD = {};
      xGeckoTokens.forEach(
        (item, index) =>
          (tokenPolkaUSD[polkaTokens[index]] = results[item]?.usd)
      );
      let data = result.data ?? [];
      let temp = polkaTokens.map((item) => {
        for (let i = 0; i < data.length ?? 0; i++) {
          if (result.data[i].symbol.toLowerCase() === item.toLowerCase()) {
            return (
              result.data[i].balance / Math.pow(10, result.data[i].decimal)
            );
          }
        }
        return 0;
      });
      let tokenPolkaBalances = {};
      temp.forEach(
        (item, index) => (tokenPolkaBalances[polkaTokens[index]] = item)
      );
      this.context.setValue({
        tokenPolkaBalances,
        tokenPolkaUSD,
      });
    });
    this.props.navigation.addListener("blur", () => {
      this.mount = false;
      this.controller.abort();
    });
  }

  componentWillUnmount() {
    this.mount = false;
    this.controller.abort();
  }

  render() {
    return (
      <>
        <View style={GlobalStyles.container}>
          <Header />
          <View style={{ position: "absolute", top: 9, left: 18 }}>
            <Pressable
              onPress={() =>
                this.props.navigation.navigate("CryptoTransactionsPolka")
              }
            >
              <View style={{ alignSelf: "center" }}>
                <IconMI name="receipt-long" size={24} color={headerColor} />
              </View>
              <Text style={{ color: "white" }}>Transactions</Text>
            </Pressable>
          </View>
          <View style={{ position: "absolute", top: 9, right: 18 }}>
            <Pressable onPress={() => console.log("CryptoCashOut")}>
              <View style={{ alignSelf: "center" }}>
                <IconMCI name="cash-fast" size={24} color={headerColor} />
              </View>
              <Text style={{ color: "white" }}>Withdraw</Text>
            </Pressable>
          </View>
          <View
            style={{
              position: "absolute",
              top: Dimensions.get("window").height * 0.02,
              width: "100%",
            }}
          ></View>
          <View
            style={[
              GlobalStyles.main,
              { flexDirection: "column", alignItems: "center", paddingTop: 10 },
            ]}
          >
            <View style={[{ flexDirection: "row", alignItems: "center" }]}>
              <View
                style={{
                  borderBottomWidth: 0.5,
                  borderColor: "black",
                  width: "100%",
                }}
              >
                <Pressable
                  onPress={() =>
                    this.context.setValue({
                      show: !this.context.value.show,
                    })
                  }
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: 20,
                    }}
                  >
                    {NetworkName} Address
                    {"\n"}
                    {this.context.value.polkaAccount.substring(0, 7)}
                    ...
                    {this.context.value.polkaAccount.substring(
                      this.context.value.polkaAccount.length - 7,
                      this.context.value.polkaAccount.length
                    )}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View
              style={{
                backgroundColor: contentColor,
                height: 2,
                width: "90%",
                marginVertical: 10,
              }}
            />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ textAlign: "center", color: "white", fontSize: 20 }}
              >
                Balance
              </Text>
              <Pressable
                onPress={() =>
                  this.context.setValue({
                    show: !this.context.value.show,
                  })
                }
              >
                <Text style={{ fontSize: 30, color: "white" }}>
                  {"$ "}
                  {this.context.value.show
                    ? epsilonRound(
                        polkaTokens
                          .map(
                            (item) =>
                              (this.context.value.tokenPolkaBalances[item] ??
                                0) *
                              (this.context.value.tokenPolkaUSD[item] ?? 0)
                          )
                          .reduce((partialSum, a) => partialSum + a, 0),
                        2
                      )
                    : "***"}
                  {" USD"}
                </Text>
              </Pressable>
            </View>
            <View
              style={{
                backgroundColor: contentColor,
                height: 2,
                width: "90%",
                marginVertical: 10,
              }}
            />
            <View style={{ height: "16%" }}>
              <ScrollView persistentScrollbar>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "33.33%" }}>
                    {this.context.value.show ? (
                      <Image
                        source={nativeIconPolka}
                        style={{ width: 20, height: 20, alignSelf: "center" }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 20,
                          color: "white",
                          alignSelf: "center",
                        }}
                      >
                        {"***"}{" "}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      color: "white",
                      width: "33.33%",
                      textAlign: "center",
                    }}
                  >
                    {this.context.value.show ? nativePolka : "***"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      color: "white",
                      width: "33.33%",
                      textAlign: "center",
                    }}
                  >
                    {" "}
                    {this.context.value.show
                      ? epsilonRound(
                          this.context.value.tokenPolkaBalances[nativePolka]
                        )
                      : "***"}{" "}
                  </Text>
                </View>
                {polkaTokens.map(
                  (item, index) =>
                    epsilonRound(
                      this.context.value.tokenPolkaBalances[item],
                      4
                    ) > 0 && (
                      <React.Fragment key={index + "Value"}>
                        <View
                          style={{
                            backgroundColor: contentColor,
                            height: 0.5,
                            width: Dimensions.get("window").width * 0.9,
                            marginVertical: 8,
                            alignSelf: "center",
                          }}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <View style={{ width: "33.33%" }}>
                            {this.context.value.show ? (
                              <Image
                                source={xtokensIcons[index]}
                                style={{
                                  width: 20,
                                  height: 20,
                                  alignSelf: "center",
                                }}
                              />
                            ) : (
                              <Text
                                style={{
                                  fontSize: 20,
                                  color: "white",
                                  alignSelf: "center",
                                }}
                              >
                                {"***"}{" "}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={{
                              fontSize: 20,
                              color: "white",
                              width: "33.33%",
                              textAlign: "center",
                            }}
                          >
                            {this.context.value.show ? item : "***"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 20,
                              color: "white",
                              width: "33.33%",
                              textAlign: "center",
                            }}
                          >
                            {" "}
                            {this.context.value.show
                              ? epsilonRound(
                                  this.context.value.tokenPolkaBalances[item],
                                  6
                                )
                              : "***"}{" "}
                          </Text>
                        </View>
                      </React.Fragment>
                    )
                )}
              </ScrollView>
            </View>
            <View
              style={{
                backgroundColor: contentColor,
                height: 2,
                width: "90%",
                marginVertical: 10,
              }}
            />
            <Chart
              size={180}
              data={polkaTokens.map(
                (item) =>
                  (this.context.value.tokenPolkaBalances[item] ?? 0) *
                  (this.context.value.tokenPolkaUSD[item] ?? 0)
              )}
              dataColors={xcolors}
              dataLabels={polkaTokens}
              dataMultipliers={polkaTokens.map(
                (item) => 1 / this.context.value.tokenPolkaUSD[item] ?? 1
              )}
              show={this.context.value.show}
              round={[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]}
            />
          </View>
          <Footer navigation={this.props.navigation} />
        </View>
      </>
    );
  }
}

export default PolkaAccount;
