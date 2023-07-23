// Basic Imports
import React, { Component } from 'react';
import { Dimensions, Linking, Pressable, Text, View } from 'react-native';
// Components
import QRCode from 'react-native-qrcode-svg';
// Components Local
import Header from '../components/header';
// Utils 
import reactAutobind from 'react-autobind';
// Utils Local
import ContextModule from '../../utils/contextModule';
// Assets
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialIcons';
// Styles
import GlobalStyles from '../../styles/styles';

import { NODE_ENV_EXPLORER, NetworkName, contentColor, headerColor } from "../../../env";

class DepositCryptoPolka extends Component {
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
                            <Pressable onPress={() => this.props.navigation.navigate('PolkaAccount')}>
                                <IconMC name="arrow-back-ios" size={36} color={headerColor} />
                            </Pressable>
                        </View>
                    }
                    {
                        !this.state.check ?
                            <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                                <Text style={{ textAlign: "center", color: "white", fontSize: 24, width: "90%" }}>
                                    {NetworkName} Address:
                                    {"\n"}
                                    {
                                        this.context.value.polkaAccount.substring(0, 24)
                                    }
                                    {"\n"}
                                    {
                                        this.context.value.polkaAccount.substring(24, this.context.value.polkaAccount.length)
                                    }
                                </Text>
                                <View style={{ borderColor: contentColor, borderWidth: 2 }}>
                                    <QRCode
                                        value={this.context.value.polkaAccount}
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
                                    this.props.navigation.navigate('PolkaAccount')
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

export default DepositCryptoPolka;