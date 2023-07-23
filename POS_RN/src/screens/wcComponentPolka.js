// Basic Imports
import React, {Component} from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
// Contracts
// Crypto
import Web3 from 'web3';
//import WalletConnect from "@walletconnect/client";
// Components
import {Picker} from 'react-native-form-component';
import QRCode from 'react-native-qrcode-svg';
// Components Local
import Header from './components/header';
// Utils
import reactAutobind from 'react-autobind';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import NfcManager, {Ndef, NfcEvents} from 'react-native-nfc-manager';
import RNPrint from 'react-native-print';
// Utils Local
import ContextModule from '../utils/contextModule';
import IotReciever from '../utils/iot-reciever-aws';
// Assets
import Icon2 from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome5';
import IconMCI from 'react-native-vector-icons/MaterialIcons';
import {logo} from '../assets/logo';
// Styles
import UniversalProvider from '@walletconnect/universal-provider';
import GlobalStyles from '../styles/styles';

import {
  NODE_ENV_NETWORK_APPNAME,
  NODE_ENV_NETWORK_RCP,
  NODE_ENV_RPCS,
  PolkaExporers,
  PolkaWalletConnect,
  WCproject,
  contentColor,
  headerColor,
  native,
  polkaNativeTokens,
  polkaTokens,
  polkaTokensZeros,
} from '../../env';

import {encodeAddress, cryptoWaitReady} from '@polkadot/util-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Switch} from 'react-native-elements';
import {ApiPromise, WsProvider} from '@polkadot/api';

function encodePolkaAddress(address) {
  const fromHexString = hexString =>
    Uint8Array.from(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  return encodeAddress(fromHexString(address));
}

function epsilonRound(num, zeros = 4) {
  return (
    Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

const tokenList = polkaTokens.map((item, index) => ({
  label: item,
  value: polkaTokens[index],
  decimals: polkaTokensZeros[index],
  websocket: NODE_ENV_RPCS[index],
  explorer: PolkaExporers[index],
  native: polkaNativeTokens[index],
  wc: PolkaWalletConnect[index],
}));

const WalletConnectPolkaBaseState = {
  qr: null,
  polkaAddress: '',
  stage: 0,
  token: tokenList[4],
  tokenList,
  place: '',
  articles: '',
  amount: 0,
  gas: 0,
  signature: '',
  publish: {
    message: '',
    topic: '',
  },
  topic: '',
  crosschain: false,
};

class WalletConnectPolka extends Component {
  constructor(props) {
    super(props);
    this.state = WalletConnectPolkaBaseState;
    reactAutobind(this);
    this.mount = true;
    this.web3 = new Web3(NODE_ENV_NETWORK_RCP);
    this.NfcManager = NfcManager;
    this.svg = null;
    this.connector = null;
    this.flag = true;
    this.encodedAddress = '';
    this.api;
  }

  static contextType = ContextModule;

  async getDataURL() {
    return new Promise(async (resolve, reject) => {
      this.svg.toDataURL(async data => {
        this.mount &&
          this.setState(
            {
              printData: 'data:image/png;base64,' + data,
            },
            () => resolve('ok'),
          );
      });
    });
  }

  callBackIoT = data => {
    console.log(data);
  };

  async connectAPI(websocket) {
    const wsProvider = new WsProvider(websocket);
    this.api = new ApiPromise({provider: wsProvider});
    const isReady = await this.api.isReady;
    return isReady;
  }

  async createTransaction() {
    await cryptoWaitReady();
    await this.connectAPI(this.state.token.websocket);
    const balance = await this.api.query.system.account(
      this.state.polkaAddress,
    );
    let tokenBalance;
    let tx;
    let info;
    const amount = this.web3.utils.toHex(
      parseInt(
        parseFloat(this.state.amount) * Math.pow(10, this.state.token.decimals),
      ),
    );
    if (this.state.token.label === 'aUSD') {
      tokenBalance = await this.api.query.tokens.accounts(
        this.state.polkaAddress,
        {Token: 'AUSD'},
      );
      tx = this.api.tx.currencies.transfer(
        this.context.value.polkaAccount,
        {Token: 'AUSD'},
        amount,
      );
      info = await this.api.tx.currencies
        .transfer(this.context.value.polkaAccount, {Token: 'AUSD'}, amount)
        .paymentInfo(this.state.polkaAddress);
      if (
        parseInt(balance.data.free.toString()) <=
          parseInt(info.partialFee.toString()) &&
        tokenBalance.free <= amount
      ) {
        this.setState({
          loading: 0,
        });
        return;
      }
    } else if (
      this.state.token.label === 'IBTC' ||
      this.state.token.label === 'INTR'
    ) {
      tokenBalance = await this.api.query.tokens.accounts(
        this.state.polkaAddress,
        {Token: this.state.token.label},
      );
      tx = this.api.tx.tokens.transfer(
        this.context.value.polkaAccount,
        {Token: this.state.token.label},
        amount,
      );
      info = await this.api.tx.tokens
        .transfer(
          this.context.value.polkaAccount,
          {Token: this.state.token.label},
          amount,
        )
        .paymentInfo(this.state.polkaAddress);
      if (
        parseInt(balance.data.free.toString()) <=
          parseInt(info.partialFee.toString()) &&
        tokenBalance.free <= amount
      ) {
        this.setState({
          loading: 0,
        });
        return;
      }
    } else if (this.state.token.label === 'USDT') {
      tokenBalance = await this.api.query.assets.account(
        1984,
        this.state.polkaAddress,
      );
      tx = this.api.tx.assets.transfer(
        1984,
        this.context.value.polkaAccount,
        amount,
      );
      info = await this.api.tx.assets
        .transfer(1984, this.context.value.polkaAccount, amount)
        .paymentInfo(this.state.polkaAddress);
      let temp;
      try {
        temp = JSON.parse(JSON.stringify(tokenBalance)).balance;
      } catch {
        temp = 0;
      }
      if (
        parseInt(balance.data.free.toString()) <=
          parseInt(info.partialFee.toString()) ||
        temp <= amount
      ) {
        this.setState({
          loading: 0,
        });
        return;
      }
    } else {
      tx = this.api.tx.balances.transfer(
        this.context.value.polkaAccount,
        amount,
      );
      info = await this.api.tx.balances
        .transfer(this.context.value.polkaAccount, amount)
        .paymentInfo(this.state.polkaAddress);
      if (
        parseInt(balance.data.free.toString()) <=
        parseInt(info.partialFee.toString())
      ) {
        console.log('nope');
        this.setState({
          loading: 0,
        });
        return;
      }
    }
    const lastHeader = await this.api.rpc.chain.getHeader();
    const blockNumber = this.api.registry.createType(
      'BlockNumber',
      lastHeader.number.toNumber(),
    );
    const method = this.api.createType('Call', tx);
    const era = this.api.registry.createType('ExtrinsicEra', {
      current: lastHeader.number.toNumber(),
      period: 64,
    });
    const accountNonce = balance?.nonce || 0;
    const nonce = this.api.registry.createType('Compact<Index>', accountNonce);
    const unsignedTransaction = {
      specVersion: this.api.runtimeVersion.specVersion.toHex(),
      transactionVersion: this.api.runtimeVersion.transactionVersion.toHex(),
      address: this.state.polkaAddress,
      blockHash: lastHeader.hash.toHex(),
      blockNumber: blockNumber.toHex(),
      era: era.toHex(),
      genesisHash: this.api.genesisHash.toHex(),
      method: method.toHex(),
      nonce: nonce.toHex(),
      signedExtensions: [
        'CheckNonZeroSender',
        'CheckSpecVersion',
        'CheckTxVersion',
        'CheckGenesis',
        'CheckMortality',
        'CheckNonce',
        'CheckWeight',
        'ChargeTransactionPayment',
      ],
      tip: this.api.registry.createType('Compact<Balance>', 0).toHex(),
      version: tx.version,
    };
    const gasFee = epsilonRound(
      parseFloat(info.partialFee.toString()) *
        Math.pow(10, -this.state.token.decimals),
      6,
    );
    await this.setStateAsync({
      gas: gasFee,
    });
    const result = await this.connector.client.request({
      chainId: `polkadot:${this.state.token.wc}`,
      topic: this.state.topic,
      request: {
        method: 'polkadot_signTransaction',
        params: {
          address: this.state.polkaAddress,
          transactionPayload: unsignedTransaction,
        },
      },
    });
    tx.addSignature(
      this.state.polkaAddress,
      result.signature,
      unsignedTransaction,
    );
    await tx.send(({status, events}) => {
      if (status.isFinalized) {
        events.forEach(async ({event: {method}}) => {
          if (method === 'ExtrinsicSuccess') {
            await this.setStateAsync({
              signature: status.finalized,
              stage: 3,
            });
            this.connector && (await this.clearWC());
            await this.clearAsyncStorageWC();
          } else if (method === 'ExtrinsicFailed') {
            console.log('fail');
          }
        });
      }
    });
  }

  async setStateAsync(value) {
    return new Promise(resolve => {
      this.setState(
        {
          ...value,
        },
        () => resolve(),
      );
    });
  }

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      this.mount = true;
      this.setState(WalletConnectPolkaBaseState);
      await this.setupNFC();
      console.log(this.context.value.account.replace('0x', ''));
      try {
        console.log(
          encodePolkaAddress(this.context.value.account.replace('0x', '')),
        );
      } catch (err) {
        console.log(err);
      }
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(WalletConnectPolkaBaseState);
      await this.setDownNFC();
      this.connector && (await this.clearWC());
      await this.clearAsyncStorageWC();
      this.mount = false;
    });
  }

  async setupNFC() {
    await this.NfcManager.start();
    this.NfcManager.setEventListener(NfcEvents.DiscoverTag, this.NFCreadData);
    await this.NfcManager.registerTagEvent();
  }

  async setDownNFC() {
    this.NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    await this.NfcManager.unregisterTagEvent();
  }

  NFCreadData(data) {
    let decoded = Ndef.text.decodePayload(data.ndefMessage[0].payload);
    if (decoded.length === 47 || decoded.length === 48) {
      console.log({
        publish: {
          message: `{ "token": "${this.state.qr}" }`,
          topic: `/PolkaSend/WalletConnect/${decoded}`,
        },
      });
      this.mount &&
        this.setState({
          publish: {
            message: `{ "token": "${this.state.qr}" }`,
            topic: `/PolkaSend/WalletConnect/${decoded}`,
          },
        });
    }
  }

  async setupWC() {
    try {
      this.connector = await UniversalProvider.init({
        projectId: WCproject, // REQUIRED your projectId
        metadata: {
          name: NODE_ENV_NETWORK_APPNAME,
          description: 'PolkaSend Point of Sale Superapp',
          url: `https://${NODE_ENV_NETWORK_APPNAME}.com/`,
          icons: ['https://i.ibb.co/m4RCzgF/logo-ETHcrop.png'],
        },
      });
    } catch (err) {
      console.log(err);
    }

    this.connector.on('display_uri', uri => {
      console.log('Refreshing URI');
      console.log(uri);
      this.state.qr === null &&
        this.setState({
          qr: uri,
          stage: 1,
          loading: false,
        });
    });

    // Subscribe to session ping
    this.connector.on('session_ping', ({id, topic}) => {
      console.log('session_ping', id, topic);
    });

    // Subscribe to session event
    this.connector.on('session_event', ({event, chainId}) => {
      console.log('session_event', event, chainId);
    });

    // Subscribe to session update
    this.connector.on('session_update', ({topic, params}) => {
      console.log('session_update', topic, params);
    });

    // Subscribe to session delete
    this.connector.on('session_delete', ({id, topic}) => {
      console.log('session_delete', id, topic);
    });

    // session established
    this.connector.on('connect', async e => {
      let {topic} = e.session;
      console.log('connect');
      this.setDownNFC();
      const polkaAddress =
        e.session.namespaces.polkadot.accounts[0].split(':')[2];
      await this.setStateAsync({
        polkaAddress,
        stage: 2,
        topic,
      });
      this.createTransaction();
    });

    // session disconnect
    this.connector.on('disconnect', async e => {
      this.connector && (await this.cleanWC());
      await this.setStateAsync(WalletConnectPolkaBaseState);
      await this.clearAsyncStorageWC();
    });
    this.connector
      .connect({
        namespaces: {
          polkadot: {
            methods: ['polkadot_signTransaction'],
            chains: [`polkadot:${this.state.token.wc}`],
            events: ['chainChanged", "accountsChanged'],
            rpcMap: {},
          },
        },
      })
      .then(e => {
        console.log('Connection OK');
        console.log(e);
      })
      .catch(async e => {
        console.log('Connection Rejected');
        this.connector && (await this.cleanWC());
        await this.setStateAsync(WalletConnectPolkaBase);
        await this.clearAsyncStorageWC();
      });
  }

  async cleanWC() {
    console.log('refresh session');
    this.connector.abortPairingAttempt();
    this.connector.cleanupPendingPairings({deletePairings: true});
  }

  async clearWC() {
    console.log('close session');
    this.connector.abortPairingAttempt();
    await this.connector.disconnect();
  }

  async clearAsyncStorageWC() {
    await AsyncStorage.multiRemove([
      'wc@2:client:0.3//proposal',
      'wc@2:client:0.3//session',
      'wc@2:core:0.3//expirer',
      'wc@2:core:0.3//history',
      'wc@2:core:0.3//keychain',
      'wc@2:core:0.3//messages',
      'wc@2:core:0.3//pairing',
      'wc@2:core:0.3//subscription',
      'wc@2:universal_provider:/namespaces',
      'wc@2:universal_provider:/optionalNamespaces',
      'wc@2:universal_provider:/sessionProperties',
    ]);
  }

  async componentWillUnmount() {
    this.NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    this.NfcManager.unregisterTagEvent();
    this.connector && (await this.clearWC());
    await this.clearAsyncStorageWC();
    this.mount = false;
  }

  render() {
    return (
      <>
        <View style={GlobalStyles.container}>
          <Header />
          {
            <View style={{position: 'absolute', top: 9, left: 18}}>
              <Pressable
                onPress={() =>
                  this.props.navigation.navigate('PaymentsBlockchain')
                }>
                <IconMCI name="arrow-back-ios" size={36} color={headerColor} />
              </Pressable>
            </View>
          }
          {(this.state.stage === 0 || this.state.stage === 1) && (
            <View style={{position: 'absolute', top: 18, right: 18}}>
              <IotReciever
                publish={this.state.publish}
                sub_topics={[]}
                callback={this.mount && this.callBackIoT}
                callbackPublish={() =>
                  this.mount &&
                  this.setState({publish: {message: '', topic: ''}})
                }
              />
            </View>
          )}
          {this.state.stage === 0 && (
            <ScrollView style={[GlobalStyles.mainSub]}>
              <View
                style={{
                  alignSelf: 'center',
                  width: '90%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginVertical: 10,
                }}>
                <Text
                  style={{fontSize: 28, fontWeight: 'bold', color: 'white'}}>
                  Cross-chain Bridge
                </Text>
                <Switch
                  onChange={() => {
                    /**
                      this.setState({
                        crosschain: !this.state.crosschain,
                      });
                    */
                  }}
                  value={this.state.crosschain}
                  thumbColor={
                    this.state.crosschain ? headerColor : headerColor + '44'
                  }
                  trackColor={'#fff'}
                />
              </View>
              <View
                style={{
                  width: '90%',
                  textAlign: 'center',
                  alignSelf: 'center',
                }}>
                <Picker
                  isRequired
                  buttonStyle={{
                    fontSize: 28,
                    textAlign: 'center',
                    borderWidth: 1,
                    borderColor: 'black',
                  }}
                  itemLabelStyle={[{fontSize: 24, textAlign: 'center'}]}
                  labelStyle={[
                    {fontSize: 28, textAlign: 'center', color: 'white'},
                  ]}
                  selectedValueStyle={[{fontSize: 28, textAlign: 'center'}]}
                  items={this.state.tokenList}
                  label="Token"
                  selectedValue={this.state.token.value}
                  onSelection={item => {
                    this.mount &&
                      this.setState({
                        token: item,
                      });
                  }}
                />
              </View>
              <View
                style={{
                  width: '90%',
                  textAlign: 'center',
                  alignSelf: 'center',
                  paddingBottom: 20,
                }}>
                <Text
                  style={{fontSize: 28, fontWeight: 'bold', color: 'white'}}>
                  Amount
                </Text>
                <TextInput
                  style={{
                    fontSize: 24,
                    textAlign: 'center',
                    borderRadius: 6,
                    backgroundColor: 'white',
                    color: 'black',
                  }}
                  keyboardType="number-pad"
                  value={this.state.amount.toString()}
                  onChangeText={value =>
                    this.mount && this.setState({amount: value})
                  }
                />
              </View>
              <View
                style={{
                  width: '90%',
                  textAlign: 'center',
                  alignSelf: 'center',
                  paddingBottom: 20,
                }}>
                <Text
                  style={{fontSize: 28, fontWeight: 'bold', color: 'white'}}>
                  Place
                </Text>
                <TextInput
                  style={{
                    fontSize: 24,
                    textAlign: 'center',
                    borderRadius: 6,
                    backgroundColor: 'white',
                    color: 'black',
                  }}
                  keyboardType="default"
                  value={this.state.place}
                  onChangeText={value =>
                    this.mount && this.setState({place: value})
                  }
                />
              </View>
              <View
                style={{
                  width: '90%',
                  textAlign: 'center',
                  alignSelf: 'center',
                  paddingBottom: 30,
                }}>
                <Text
                  style={{fontSize: 28, fontWeight: 'bold', color: 'white'}}>
                  Articles
                </Text>
                <TextInput
                  style={{
                    fontSize: 24,
                    textAlign: 'center',
                    borderRadius: 6,
                    backgroundColor: 'white',
                    color: 'black',
                  }}
                  keyboardType="default"
                  value={this.state.articles}
                  onChangeText={value =>
                    this.mount && this.setState({articles: value})
                  }
                />
              </View>
              <Pressable
                disabled={this.loading}
                style={[
                  this.loading
                    ? GlobalStyles.buttonDisabled
                    : GlobalStyles.button,
                  {alignSelf: 'center', marginBottom: 20},
                ]}
                onPress={() => {
                  this.mount &&
                    this.setState(
                      {
                        loading: true,
                      },
                      () => this.setupWC(),
                    );
                }}>
                <Text style={[GlobalStyles.buttonText]}>Pay</Text>
              </Pressable>
            </ScrollView>
          )}
          {this.state.stage === 1 && (
            <View style={[GlobalStyles.mainSub, {}]}>
              {this.state.qr && (
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={[{fontSize: 24, color: 'white', marginVertical: 4}]}>
                    NFC or Scan
                  </Text>
                  <View style={{borderColor: contentColor, borderWidth: 2}}>
                    <QRCode
                      value={this.state.qr}
                      size={Dimensions.get('window').height / 1.8}
                      quietZone={10}
                      ecl="H"
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: contentColor,
                      borderRadius: 10,
                      width: '90%',
                      marginTop: 10,
                    }}>
                    <Text
                      style={[
                        {fontSize: 24, color: 'white', marginVertical: 10},
                      ]}>
                      Amount: {this.state.amount.toString()}{' '}
                      {this.state.token.label}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
          {this.state.stage === 2 && (
            <View
              style={[
                GlobalStyles.mainSub,
                {
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                },
              ]}>
              <Icon name="wallet" size={128} color={contentColor} />
              <Text
                style={{
                  textShadowRadius: 1,
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Wallet Connected
              </Text>
              <Text
                style={{
                  textShadowRadius: 1,
                  fontSize: 18,
                  color: '#AAA',
                  paddingTop: 10,
                  textAlign: 'center',
                  width: '60%',
                }}>
                Review and sign the transaction to complete...
              </Text>
              <View
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: contentColor,
                  borderRadius: 10,
                  width: '90%',
                  height: '30%',
                  marginTop: 20,
                }}>
                <Text style={[{fontSize: 24, color: 'white'}]}>
                  Amount: {this.state.amount.toString()}{' '}
                  {this.state.token.label}
                </Text>
                {this.state.gas > 0 ? (
                  <Text style={[{fontSize: 24, color: 'white'}]}>
                    Gas fee: {this.state.gas.toString()}{' '}
                    {this.state.token.label}
                  </Text>
                ) : (
                  <Text style={[{fontSize: 24, color: 'white'}]}>
                    Gas fee: calculating...
                  </Text>
                )}
                {this.state.place && (
                  <Text style={[{fontSize: 24, color: 'white'}]}>
                    Place: {this.state.place}
                  </Text>
                )}
                {this.state.articles && (
                  <Text style={[{fontSize: 24, color: 'white'}]}>
                    Articles: {this.state.articles}
                  </Text>
                )}
              </View>
            </View>
          )}
          {this.state.stage === 3 && (
            <View
              style={[
                GlobalStyles.mainSub,
                {
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                },
              ]}>
              <Icon2 name="check-circle" size={160} color={contentColor} />
              <Text
                style={{
                  textShadowRadius: 1,
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Completed
              </Text>
              <Pressable
                style={{marginVertical: 30}}
                onPress={() =>
                  Linking.openURL(
                    `${this.state.token.explorer}tx/` + this.state.signature,
                  )
                }>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                  }}>
                  View on Explorer
                </Text>
              </Pressable>
              <Pressable
                style={[
                  GlobalStyles.button,
                  {alignSelf: 'center', marginBottom: 20},
                ]}
                onPress={async () => {
                  await this.getDataURL();
                  const results = await RNHTMLtoPDF.convert({
                    html: `
                                        <div style="text-align: center;">
                                        <img src='${logo}' width="450px"></img>
                                            <h1 style="font-size: 3rem;">--------- Original Reciept ---------</h1>
                                            <h1 style="font-size: 3rem;">Date: ${new Date().toLocaleDateString()}</h1>
                                            <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                            <h1 style="font-size: 3rem;">WalletConnect Transfer</h1>
                                            <h1 style="font-size: 3rem;">Amount: ${
                                              this.state.amount.toString() + ' '
                                            }${this.state.token.label}</h1>
                                            ${
                                              this.state.place &&
                                              `<h1 style="font-size: 3rem;">Place:${this.state.place}</h1>`
                                            }
                                            ${
                                              this.state.articles &&
                                              `<h1 style="font-size: 3rem;">Articles:${this.state.articles}</h1>`
                                            }
                                            <h1 style="font-size: 3rem;">------------------ • ------------------</h1>
                                            <img src='${
                                              this.state.printData
                                            }'></img>
                                        </div>
                                        `,
                    fileName: 'print',
                    base64: true,
                  });
                  await RNPrint.print({filePath: results.filePath});
                }}>
                <Text style={[GlobalStyles.buttonText]}>Print Receipt</Text>
              </Pressable>
              <Pressable
                style={[
                  GlobalStyles.button,
                  {alignSelf: 'center', marginBottom: 20},
                ]}
                onPress={() => {
                  this.props.navigation.navigate('Payments');
                }}>
                <Text style={[GlobalStyles.buttonText]}>Done</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={{position: 'absolute', bottom: -500}}>
          <QRCode
            value={PolkaExporers + 'tx/' + this.state.signature}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </>
    );
  }
}

export default WalletConnectPolka;
