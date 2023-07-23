import React, { Component } from 'react';
import reactAutobind from 'react-autobind';
import { Dimensions, Pressable, Text, View } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import IconMC from 'react-native-vector-icons/MaterialIcons';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import { headerColor } from '../../../env';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import Header from '../components/header';


class CryptoCheckPinPolka extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pincode: "",
        };
        reactAutobind(this)
        this.mount = true
    }

    static contextType = ContextModule;

    componentDidMount() {
        this.props.navigation.addListener('focus', () => {
            this.clearKeyboard()
            this.mount = true
        })
        this.props.navigation.addListener('blur', () => {
            this.mount = false
            this.setState({
                pincode: ""
            })
        })
    }

    async changeText(val) {
        if (val.length < 4) {
            this.mount && this.setState({
                pincode: val
            });
        }
        else {
            try {
                const session = await EncryptedStorage.getItem("userPIN");
                if (session !== null) {
                    if (val === JSON.parse(session).value) {
                        this.props.navigation.navigate('WithdrawCrypto')
                    }
                    else {
                        this.clearKeyboard()
                        this.mount && this.setState({
                            pincode: ""
                        });
                    }
                }
                else {
                    this.clearKeyboard()
                    this.mount && this.setState({
                        pincode: ""
                    });
                }
            } catch (error) {
                this.clearKeyboard()
                this.mount && this.setState({
                    pincode: ""
                });
            }
        }
    }

    clearKeyboard() {
        this.mount && this.setState({
            clear: true
        }, () => {
            this.mount && this.setState({
                clear: false
            })
        })
    }

    render() {
        return (
            <View style={GlobalStyles.container}>
                <Header />
                {
                    <View style={{ position: "absolute", top: 9, left: 18, width: 36, height: 36 }}>
                        <Pressable onPress={() => this.props.navigation.navigate('CryptoAccount')}>
                            <IconMC name="arrow-back-ios" size={36} color={headerColor} />
                        </Pressable>
                    </View>
                }
                <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center", paddingTop: 20 }]}>
                    <Text style={{ textAlign: "center", fontSize: 36, fontFamily: "Helvetica", color: "white" }}>
                        Pincode
                    </Text>
                    <View style={{ flexDirection: "row", justifyContent: "space-around", paddingTop: 10 }}>
                        <Text style={{ textAlign: "center", width: "20%", fontSize: 36, fontFamily: "Helvetica", color: "white" }}>
                            {
                                this.state.pincode.substring(0, 1) === "" ? "." : "•"
                            }
                        </Text>
                        <Text style={{ textAlign: "center", width: "20%", fontSize: 36, fontFamily: "Helvetica", color: "white" }}>
                            {
                                this.state.pincode.substring(1, 2) === "" ? "." : "•"
                            }
                        </Text>
                        <Text style={{ textAlign: "center", width: "20%", fontSize: 36, fontFamily: "Helvetica", color: "white" }}>
                            {
                                this.state.pincode.substring(2, 3) === "" ? "." : "•"
                            }
                        </Text>
                        <Text style={{ textAlign: "center", width: "20%", fontSize: 36, fontFamily: "Helvetica", color: "white" }}>
                            {
                                this.state.pincode.substring(3, 4) === "" ? "." : "•"
                            }
                        </Text>
                    </View>
                    <VirtualKeyboard
                        rowStyle={{
                            width: Dimensions.get('window').width,
                        }}
                        cellStyle={
                            {
                                height: Dimensions.get('window').width / 6,
                                borderWidth: 1,
                                margin: 1,
                            }
                        }
                        colorBack={'black'}
                        color='white'
                        pressMode='string'
                        onPress={(val) => this.changeText(val)}
                        clear={this.state.clear}
                    />
                </View>
            </View>
        );
    }
}

export default CryptoCheckPinPolka;