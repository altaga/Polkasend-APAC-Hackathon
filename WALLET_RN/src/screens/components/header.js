import React, { Component } from 'react';
import { Dimensions, Image, View } from 'react-native';
import logoETH from "../../assets/logoETHcrop.png"
import GlobalStyles from '../../styles/styles';

class Header extends Component {
    render() {
        return (
            <View style={[GlobalStyles.header, { flexDirection: "row", justifyContent: "center", alignItems: "center" }]}>
                <Image source={logoETH} style={{ width: Dimensions.get("screen").width * 0.1 }} resizeMode="contain" />
            </View>
        );
    }
}

export default Header;