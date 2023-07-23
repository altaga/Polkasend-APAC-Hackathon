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
import {abiERC20} from '../contracts/erc20';
import {abiXERC20} from '../contracts/xtokensABI';
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

import {ethers} from 'ethers';
import {
  NODE_ENV_EXPLORER,
  NODE_ENV_NETWORK_APPNAME,
  NODE_ENV_NETWORK_RCP,
  WCproject,
  contentColor,
  headerColor,
  native,
  parachainId,
  tokens,
  tokensContracts,
  xtokens,
  xtokensContracts,
} from '../../env';

import {decodeAddress} from '@polkadot/util-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Switch} from 'react-native-elements';

function decodePolkaAddress(address) {
  return Buffer.from(decodeAddress(address)).toString('hex');
}

const fullTokenList = [{label: native, value: ''}].concat(
  tokens.concat(xtokens).map((item, index) => ({
    key: index + item,
    label: item,
    value: tokensContracts.concat(xtokensContracts)[index],
    parachainId: parachainId[index],
  })),
);
const xTokenList = xtokens.map((item, index) => ({
  label: item,
  value: tokensContracts.concat(xtokensContracts)[index + 2],
  parachainId: parachainId[index + 2],
}));

const WalletConnectETHBaseState = {
  qr: null,
  account: '',
  stage: 0,
  token: fullTokenList[0],
  tokenlist: fullTokenList,
  place: '',
  articles: '',
  amount: 0,
  signature: '',
  publish: {
    message: '',
    topic: '',
  },
  crosschain: false,
};

class WalletConnectETH extends Component {
  constructor(props) {
    super(props);
    this.state = WalletConnectETHBaseState;
    reactAutobind(this);
    this.mount = true;
    this.web3 = new Web3(NODE_ENV_NETWORK_RCP);
    this.provider = new ethers.providers.JsonRpcProvider(NODE_ENV_NETWORK_RCP);
    this.NfcManager = NfcManager;
    this.svg = null;
    this.connector = null;
    this.flag = true;
    this.decodedAddress = '';
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

  async createTransaction() {
    if (this.state.token.label === native) {
      console.log('transfer');
      this.transfer(
        this.state.amount,
        this.state.account,
        this.context.value.account,
      );
    } else if (this.state.crosschain) {
      console.log('transfer xcmtoken');
      this.transferXToken(
        this.state.amount,
        this.state.account,
        this.context.value.account,
      );
    } else {
      console.log('transfer token');
      this.transferToken(
        this.state.amount,
        this.state.account,
        this.context.value.account,
        this.state.token.value,
      );
    }
  }

  async transfer(amount, from, to) {
    const web3Provider = new ethers.providers.Web3Provider(this.connector);
    const nonce = await this.provider.getTransactionCount(from, 'latest');
    const transaction = {
      from,
      to,
      nonce,
      data: '0x',
      value: this.web3.utils.toHex(
        this.web3.utils.toWei(amount.toString(), 'ether'),
      ),
    };
    const gas = await this.provider.estimateGas(transaction);
    const result = await web3Provider.send('eth_sendTransaction', [
      {...transaction, gas:parseInt(gas.toString())},
    ]);
    await this.setStateAsync({
      signature: result,
      stage: 3,
    });
    this.connector && (await this.clearWC());
    await this.clearAsyncStorageWC();
  }

  async transferToken(amount, from, to, tokenAddress) {
    const web3Provider = new ethers.providers.Web3Provider(this.connector);
    const nonce = await this.provider.getTransactionCount(from, 'latest');
    const contract = new this.web3.eth.Contract(abiERC20, tokenAddress, {
      from,
    });
    const decimals = await contract.methods.decimals().call();
    const transferTransaction = contract.methods.transfer(
      to,
      this.web3.utils.toHex(amount * Math.pow(10, decimals)),
    );
    const transaction = {
      to: tokenAddress,
      from,
      nonce,
      value: 0,
      data: transferTransaction.encodeABI(),
      gas: await transferTransaction.estimateGas(),
    };
    const result = await web3Provider.send('eth_sendTransaction', [
      transaction,
    ]);
    await this.setStateAsync({
      signature: result,
      stage: 3,
    });
    this.connector && (await this.clearWC());
    await this.clearAsyncStorageWC();
  }

  async transferXToken(amount, from) {
    try {
      const web3Provider = new ethers.providers.Web3Provider(this.connector);
      const nonce = await this.provider.getTransactionCount(from, 'latest');
      const xTokenContractAddress = '0x0000000000000000000000000000000000000804';
      const multilocation = [
        1,
        [
          this.state.token.parachainId,
          '0x01' + decodePolkaAddress(this.context.value.polkaAccount) + '00',
        ],
      ];
      const contract = new this.web3.eth.Contract(
        abiERC20,
        this.state.token.value,
        {
          from,
        },
      );
      const contractX = new this.web3.eth.Contract(
        abiXERC20,
        xTokenContractAddress,
        {
          from,
        },
      );
      const decimals = await contract.methods.decimals().call();
      const transferTx = contractX.methods.transfer(
        this.state.token.value,
        this.web3.utils.toHex(amount * Math.pow(10, decimals)),
        multilocation,
        this.web3.utils.toHex(amount * Math.pow(10, decimals)),
      );
      const transaction = {
        to: xTokenContractAddress,
        from,
        nonce,
        data: transferTx.encodeABI(),
        value: 0,
        gas: await transferTx.estimateGas(),
      };
      const result = await web3Provider.send('eth_sendTransaction', [
        transaction,
      ]);
      await this.setStateAsync({
        signature: result,
        stage: 3,
      });
      this.connector && (await this.clearWC());
      await this.clearAsyncStorageWC();
    } catch (err) {
      console.log(err)
    }
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
      this.setState(WalletConnectETHBaseState);
      await this.setupNFC();
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(WalletConnectETHBaseState);
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
    if (decoded.length === 42) {
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
          description: NODE_ENV_NETWORK_APPNAME + ' Point of Sale Superapp',
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
      console.log('connect');
      console.log(e);
      this.setDownNFC();
      const address = await this.connector.request(
        {
          method: 'eth_accounts',
          params: [],
        },
        'eip155:420',
      );
      await this.setStateAsync({
        account: address[0],
        stage: 2,
      });
      console.log(address[0]);
      this.createTransaction();
    });

    // session disconnect
    this.connector.on('disconnect', async e => {
      this.connector && (await this.cleanWC());
      await this.setStateAsync(WalletConnectETHBaseState);
      await this.clearAsyncStorageWC();
    });
    this.connector
      .connect({
        namespaces: {
          eip155: {
            methods: ['eth_sendTransaction'],
            chains: ['eip155:420'],
            events: ['chainChanged', 'accountsChanged'],
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
        await this.setStateAsync(WalletConnectETHBaseState);
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
                    if (!this.state.crosschain) {
                      this.setState({
                        crosschain: !this.state.crosschain,
                        tokenlist: xTokenList,
                        token: xTokenList[0],
                      });
                    } else {
                      this.setState({
                        crosschain: !this.state.crosschain,
                        token: fullTokenList[0],
                        tokenlist: fullTokenList,
                      });
                    }
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
                  items={this.state.tokenlist}
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
                    `${NODE_ENV_EXPLORER}tx/` + this.state.signature,
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
            value={NODE_ENV_EXPLORER + 'tx/' + this.state.signature}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
            getRef={c => (this.svg = c)}
          />
        </View>
      </>
    );
  }
}

export default WalletConnectETH;