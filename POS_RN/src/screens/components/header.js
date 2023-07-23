import React, { Component } from 'react';
import { Image, View } from 'react-native';
import logoETH from "../../assets/logoETHcrop.png"
import GlobalStyles from '../../styles/styles';

class Header extends Component {
    render() {
        return (
            <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                <Image source={logoETH} style={{ height: 343 / 10, width: 363 / 10 }} />
            </View>
        );
    }
}

export default Header;