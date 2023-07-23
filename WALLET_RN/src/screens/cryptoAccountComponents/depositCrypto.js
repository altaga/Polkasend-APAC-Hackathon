// Basic Imports
import React, { Component } from 'react';
import { Text, View, Pressable, Dimensions, Linking } from 'react-native';
// Components
import QRCode from 'react-native-qrcode-svg';
// Components Local
import Header from '../components/header';
import Footer from '../components/footer';
// Utils 
import reactAutobind from 'react-autobind';
// Utils Local
import ContextModule from '../../utils/contextModule';
// Assets
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialIcons';
import { logo } from "../../assets/logo"
// Styles
import GlobalStyles from '../../styles/styles';

import { NODE_ENV_NETWORK_RCP, NODE_ENV_API_APIKEY, NODE_ENV_EXPLORER, NetworkName, NODE_ENV_API_EXPLORER, contentColor, headerColor } from "../../../env"

function epsilonRound(num) {
    const zeros = 4;
    return Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) / Math.pow(10, zeros)
}

class DepositCrypto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            memory: 0,
            qr: null,
            signature: "",
            check: false,
            printData: "",
            amount: 0,
            signature: ""
        };
        reactAutobind(this)
        this.svg = null
    }

    static contextType = ContextModule;

    async getDataURL() {
        return new Promise(async (resolve, reject) => {
            this.svg.toDataURL(async (data) => {
                this.mount && this.setState({
                    printData: "data:image/png;base64," + data
                }, () => resolve("ok"))
            });
        })
    }

    render() {
        return (
            <>
                <View style={GlobalStyles.container}>
                    <Header />
                    {
                        <View style={{ position: "absolute", top: 9, left: 18, width: 36, height: 36 }}>
                            <Pressable onPress={() => this.props.navigation.navigate('CryptoAccount')}>
                                <IconMC name="arrow-back-ios" size={36} color={headerColor} />
                            </Pressable>
                        </View>
                    }
                    {
                        !this.state.check ?
                            <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Text style={{ textAlign: "center", color: "white", fontSize: 26, width: "80%" }}>
                                    {NetworkName} Address:
                                    {"\n"}
                                    {
                                        this.context.value.account.substring(0, 21)
                                    }
                                    {"\n"}
                                    {
                                        this.context.value.account.substring(21, 42)
                                    }
                                </Text>
                                <View style={{ borderColor: contentColor, borderWidth: 2 }}>
                                    <QRCode
                                        value={this.context.value.account}
                                        size={360}
                                        quietZone={10}
                                        ecl="H"
                                    />
                                </View>
                                <Text style={{ textAlign: "center", color: "white", fontSize: 28, width: "80%" }}>
                                    Scan with your{"\n"} mobile wallet
                                </Text>
                            </View>
                            :
                            <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Icon name="check-circle" size={160} color={contentColor} />
                                <Text style={{
                                    textShadowRadius: 1,
                                    fontSize: 28, fontWeight: "bold", color: "white"
                                }}>
                                    Completed
                                </Text>
                                <Pressable style={{ marginVertical: 30 }} onPress={() => Linking.openURL(NODE_ENV_EXPLORER + "tx/" + this.state.signature)}>
                                    <Text style={{
                                        fontSize: 24, fontWeight: "bold", color: "white", textAlign: "center"
                                    }}>
                                        View on Explorer
                                    </Text>
                                </Pressable>
                                <Pressable style={[GlobalStyles.button]} onPress={() => {
                                    this.props.navigation.navigate('CryptoAccount')
                                }}>
                                    <Text style={[GlobalStyles.buttonText]}>
                                        Done
                                    </Text>
                                </Pressable>
                            </View>
                    }
                </View>
                <View style={{ marginTop: Dimensions.get("window").height }}>
                    <QRCode
                        value={NODE_ENV_EXPLORER + "tx/" + this.state.signature}
                        size={Dimensions.get("window").width * 0.7}
                        ecl="L"
                        getRef={(c) => (this.svg = c)}
                    />
                </View>
            </>
        );
    }
}

export default DepositCrypto;