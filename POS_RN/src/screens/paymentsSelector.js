import React, { Component } from "react";
import reactAutobind from "react-autobind";
import { Image, Pressable, Text, View } from "react-native";
// Utils
import ContextModule from "../utils/contextModule";
// Styles
import GlobalStyles from "../styles/styles";
import Header from "./components/header";
// Assets
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconMCI from "react-native-vector-icons/MaterialIcons";
import { headerColor, polkaWallet } from "../../env";

class PaymentsBlockchain extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    reactAutobind(this);
  }

  static contextType = ContextModule;

  render() {
    return (
      <>
        <View style={GlobalStyles.container}>
          <Header />
          {
            <View style={{ position: "absolute", top: 9, left: 18 }}>
              <Pressable
                onPress={() => this.props.navigation.navigate("Payments")}
              >
                <IconMCI name="arrow-back-ios" size={36} color={headerColor} />
              </Pressable>
            </View>
          }
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: "column",
                justifyContent: "space-evenly",
                alignItems: "center"
              },
            ]}
          >
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "white", textAlign:"center", marginHorizontal:10 }}>
              Select your Origin Payment Network
            </Text>
            <Pressable
              style={[
                GlobalStyles.buttonBig2
              ]}
              onPress={() => this.props.navigation.navigate("WalletConnectPolka")}
            >
              <Image
                source={polkaWallet}
                resizeMode="contain"
                style={{ width: 64, height: 64, alignSelf: "center" }}
              />
              <Text style={[GlobalStyles.buttonText, { marginTop: 20 }]}>
                Polkadot
              </Text>
            </Pressable>
            <Pressable
              style={[
                GlobalStyles.buttonBig2
              ]}
              onPress={() => this.props.navigation.navigate("WalletConnectETH")}
            >
              <Icon
                name="ethereum"
                size={64}
                color="white"
                style={{ alignSelf: "center" }}
              />
              <Text style={[GlobalStyles.buttonText, { marginTop: 10 }]}>
                EVM Moonbeam
              </Text>
            </Pressable>
          </View>
        </View>
      </>
    );
  }
}

export default PaymentsBlockchain;
