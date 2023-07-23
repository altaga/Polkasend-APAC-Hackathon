// Basic Imports
import React, { Component } from 'react';
import { Pressable, Text, View } from 'react-native';
// Components Local
import Header from '../components/header';
// Utils 
import reactAutobind from 'react-autobind';
// Utils Local
import ContextModule from '../../utils/contextModule';
// Styles
import GlobalStyles from '../../styles/styles';
// Assets
import IconMC from 'react-native-vector-icons/MaterialIcons';

import { headerColor, NODE_ENV_API_APIKEY, NODE_ENV_API_EXPLORER } from "../../../env";
import Ctransactions from './cryptoTransactions';

class CryptoMainTransactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            transactions: []
        };
        reactAutobind(this)
        this.mount = true
    }

    static contextType = ContextModule;

async componentDidMount() {
    const requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };
    let [transactions, tokenTransactions] = await Promise.all([
        new Promise((resolve) => {
            fetch(`${NODE_ENV_API_EXPLORER}api?module=account&action=txlist&address=${this.context.value.account}&startblock=1&endblock=99999999&sort=desc&apikey=${NODE_ENV_API_APIKEY}`, requestOptions)
                .then(response => response.json())
                .then(res => {
                    resolve(res.result)
                })
                .catch(error => console.log('error', error));
        }),
        new Promise((resolve) => {
            fetch(`${NODE_ENV_API_EXPLORER}api?module=account&action=tokentx&address=${this.context.value.account}&startblock=0&endblock=99999999&sort=desc&page=1&apikey=${NODE_ENV_API_APIKEY}`, requestOptions)
                .then(response => response.json())
                .then(res => {
                    resolve(res.result)
                })
                .catch(error => console.log('error', error));
        })

    ])
    this.setState({
        transactions: transactions.concat(tokenTransactions).sort((a, b) => a.timeStamp < b.timeStamp)
    })
  }

    componentWillUnmount() {
        this.mount = false
        clearInterval(this.interval)
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
                <View style={[GlobalStyles.mainSub, { flexDirection: "column", justifyContent: "space-evenly", alignItems: "center" }]}>
                    <Text style={{ textAlign: "center", fontSize: 24, color: "white" }}>
                        {"\n"}Transactions:{"\n"}
                    </Text>
                    <Ctransactions transactions={this.state.transactions} from={this.context.value.account} />
                </View>
            </View>
        );
    }
}

export default CryptoMainTransactions;