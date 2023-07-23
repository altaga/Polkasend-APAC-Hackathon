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

import {
  PolkaExporers,
  SubHosts,
  headerColor,
  polkaNames
} from '../../../env';
import Ctransactions from './cryptoTransactions';

async function getTransactionsWithDelay(address, url) {
  return new Promise(async (resolve, reject) => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('X-API-Key', 'e2fad2a4503d46efa99d3f617e9a882f');
    var raw = JSON.stringify({address, row: 100});
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };
    fetch(`${url}/api/v2/scan/transfers`, requestOptions)
      .then(response => response.json())
      .then(result => {
        if(result.code ===0){
          resolve(result)
        }
        else{
          resolve({"data": {"transfers": null}})
        }
      })
      .catch(error => reject(error));
  });
}

class CryptoMainTransactionsPolka extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
    };
    reactAutobind(this);
    this.mount = true;
  }

  static contextType = ContextModule;
  async componentDidMount() {
    let delay = 0;
    const promises = await Promise.all(
      SubHosts.map(async item => {
        delay += 500;
        return new Promise(resolve => setTimeout(resolve, delay)).then(
          async () =>
            await getTransactionsWithDelay(
              this.context.value.polkaAccount,
              item,
            ),
        );
      }),
    );
    let transactions = [];
    polkaNames.forEach((item, index) =>
      promises[index].data.transfers?.forEach(transaction =>
        transactions.push({
          ...transaction,
          network: item,
          explorer: PolkaExporers[index],
        }),
      ),
    );
    this.setState({
      transactions,
    });
  }

  componentWillUnmount() {
    this.mount = false;
    clearInterval(this.interval);
  }

  render() {
    return (
      <View style={GlobalStyles.container}>
        <Header />
        {
          <View
            style={{
              position: 'absolute',
              top: 9,
              left: 18,
              width: 36,
              height: 36,
            }}>
            <Pressable
              onPress={() => this.props.navigation.navigate('PolkaAccount')}>
              <IconMC name="arrow-back-ios" size={36} color={headerColor} />
            </Pressable>
          </View>
        }
        <View
          style={[
            GlobalStyles.mainSub,
            {
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            },
          ]}>
          <Text style={{textAlign: 'center', fontSize: 24, color: 'white'}}>
            {'\n'}Transactions:{'\n'}
          </Text>
          <Ctransactions
            transactions={this.state.transactions}
            from={this.context.value.account}
          />
        </View>
      </View>
    );
  }
}

export default CryptoMainTransactionsPolka;
