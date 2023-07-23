// Basic Imports
import React, { Component } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
// Components
import QRCode from "react-native-qrcode-svg";
// Components Local
import Header from "./components/header";
// Utils
import reactAutobind from "react-autobind";
import NfcManager, { Ndef, NfcEvents } from "react-native-nfc-manager";
// Utils Local
import ContextModule from "../utils/contextModule";
import IotReciever from "../utils/iot-reciever-aws";
// Assets
import IconMCI from "react-native-vector-icons/MaterialCommunityIcons";
import IconMC from "react-native-vector-icons/MaterialIcons";
// Styles
import GlobalStyles from "../styles/styles";

import { contentColor, headerColor, native, polkaWallet } from "../../env";

function epsilonRound(num, zeros = 4) {
  return (
    Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

const DepositCryptoBaseState = {
  address: "seed",
  kind: "Polkadot",
  memory: 0,
  qr: null,
  signature: "",
  printData: "",
  amount: 0,
  signature: "",
  publish: {
    message: "",
    topic: "",
  },
  token: native,
};

class DepositCrypto extends Component {
  constructor(props) {
    super(props);
    this.state = DepositCryptoBaseState;
    reactAutobind(this);
    this.interval = null;
    this.mount = true;
    this.flag = true;
    this.svg = null;
    this.NfcManager = NfcManager;
  }

  static contextType = ContextModule;

  async getDataURL() {
    return new Promise(async (resolve, reject) => {
      this.svg.toDataURL(async (data) => {
        this.setState(
          {
            printData: "data:image/png;base64," + data,
          },
          () => resolve("ok")
        );
      });
    });
  }

  setupNFC() {
    this.NfcManager.start();
    this.NfcManager.setEventListener(NfcEvents.DiscoverTag, this.NFCreadData);
    this.NfcManager.registerTagEvent();
  }

  NFCreadData(data) {
    let decoded = Ndef.text.decodePayload(data.ndefMessage[0].payload);
    if (
      decoded.length === 42 ||
      decoded.length === 47 ||
      decoded.length === 48
    ) {
      this.mount &&
        this.setState({
          publish: {
            message: `{ "token": "${this.state.address}" }`,
            topic: `/EffiSend/WalletConnect/${decoded}`,
          },
        });
    }
  }

  componentDidMount() {
    this.props.navigation.addListener("focus", () => {
      this.setState({
        address: this.context.value.polkaAccount,
      });
      this.interval = null;
      this.mount = true;
      this.flag = true;
      this.svg = null;
      this.setupNFC();
    });
    this.props.navigation.addListener("blur", () => {
      this.setState(DepositCryptoBaseState);
      this.mount = false;
      clearInterval(this.interval);
      this.NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      this.NfcManager.unregisterTagEvent();
    });
  }

  componentWillUnmount() {
    this.mount = false;
    clearInterval(this.interval);
  }

  callBackIoT = (data) => {
    console.log(data);
  };

  render() {
    return (
      <View style={GlobalStyles.container}>
        <Header />
        <View style={{ position: "absolute", top: 9, left: 18 }}>
          <Pressable onPress={() => this.props.navigation.navigate("Payments")}>
            <IconMC name="arrow-back-ios" size={36} color={headerColor} />
          </Pressable>
        </View>
        <View style={{ position: "absolute", top: 18, right: 18 }}>
          <IotReciever
            publish={this.state.publish}
            sub_topics={[]}
            callback={this.callBackIoT}
            callbackPublish={() =>
              this.mount &&
              this.setState({ publish: { message: "", topic: "" } })
            }
          />
        </View>
        <View
          style={[
            GlobalStyles.mainSub,
            {
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
            },
          ]}
        >
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 22,
              width: "95%",
            }}
          >
            {this.state.kind} Address:
            {"\n"}
            {this.state.address.substring(
              0,
              Math.round(this.state.address.length / 2)
            )}
            {"\n"}
            {this.state.address.substring(
              Math.round(this.state.address.length / 2),
              this.state.address.length
            )}
          </Text>
          <View style={{ borderColor: contentColor, borderWidth: 2 }}>
            <QRCode
              value={this.state.address}
              size={280}
              quietZone={10}
              ecl="H"
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              width: Dimensions.get("window").width,
            }}
          >
            <Pressable
              style={[
                GlobalStyles.button,
                {
                  flexDirection: "row",
                  width: Dimensions.get("window").width * 0.45,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRightColor: headerColor,
                  borderRightWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
              onPress={() =>
                this.mount && this.setState({
                  kind: "Polkadot",
                  address: this.context.value.polkaAccount,
                })
              }
            >
              <Image
                source={polkaWallet}
                resizeMode="contain"
                style={{ width: 20, height: 20, alignSelf: "center" }}
              />
              <Text style={[GlobalStyles.buttonText]}> Polkadot</Text>
            </Pressable>
            <Pressable
              style={[
                GlobalStyles.button,
                {
                  flexDirection: "row",
                  width: Dimensions.get("window").width * 0.45,
                  alignItems: "center",
                  justifyContent: "center",
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                },
              ]}
              onPress={() =>
                this.mount && this.setState({
                  kind: "Moonbeam",
                  address: this.context.value.account,
                })
              }
            >
              <IconMCI name="ethereum" size={24} color="white" />
              <Text style={[GlobalStyles.buttonText]}>Moonbeam</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }
}

export default DepositCrypto;
