import {Core} from '@walletconnect/core';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';
import {formatJsonRpcResult} from '@json-rpc-tools/utils';
import {Web3Wallet} from '@walletconnect/web3wallet';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  Text,
  View,
  Modal,
} from 'react-native';
import {Picker} from 'react-native-form-component';
import {
  HCESession,
  NFCTagType4NDEFContentType,
  NFCTagType4,
} from 'react-native-hce';
import Icon2 from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMC from 'react-native-vector-icons/MaterialIcons';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import Web3 from 'web3';
import {abiERC20} from '../../contracts/erc20';
import {abiXERC20} from '../../contracts/xtokensABI';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import IotReciever from '../../utils/iot-reciever-aws';
import Header from '../components/header';
import CryptoSign from './cryptoSign';

import BigNumber from 'bignumber.js';
import {
  NODE_ENV_EXPLORER,
  NODE_ENV_NETWORK_APPNAME,
  NODE_ENV_NETWORK_RCP,
  WCproject,
  contentColor,
  headerColor,
  native,
  tokens,
  tokensContracts,
  xtokens,
  xtokensContracts,
} from '../../../env';
import Cam from '../components/cam';
import AsyncStorage from '@react-native-async-storage/async-storage';

function epsilonRound(num, zeros = 4) {
  return (
    Math.round((num + Number.EPSILON) * Math.pow(10, zeros)) /
    Math.pow(10, zeros)
  );
}

const WithdrawCryptoStateBase = {
  stage: 0, // 0
  publish: {
    message: '',
    topic: '',
  },
  metadata: {},
  address: '',
  transaction: {
    value: '0',
    gas: '0',
    data: '0x',
    kind: '',
  },
  transactionDisplay: {
    kind: 'eth_sendTransaction',
    name: native,
    decimals: 18,
    value: 0,
    gas: 0,
  },
  session: {},
  sessionRequest: {},
  sessionRequestTransaction: {},
  hash: '',
  token: {
    label: native,
    value: '0',
  },
  value: '0',
  loading: 0,
  modal: false,
  scanFlag: true,
  reset: false,
  clear: false,
};

class WithdrawCrypto extends Component {
  constructor(props) {
    super(props);
    this.state = WithdrawCryptoStateBase;
    reactAutobind(this);
    this.web3 = new Web3(NODE_ENV_NETWORK_RCP);
    this.simulation = null;
    this.mount = true;
    this.connector = null;
    this.topic = '';
    this.interval = null;
    this.abiDecoder = require('abi-decoder');
    this.core = new Core({
      projectId: WCproject,
    });
    this.scanFlag = true;
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.abiDecoder.addABI(abiERC20);
    this.abiDecoder.addABI(abiXERC20);
    this.props.navigation.addListener('focus', async () => {
      this.mount = true;
      this.scanFlag = true;
      this.mount && this.setState(WithdrawCryptoStateBase);
      this.mount && this.resetCamera();
      try {
        const tag = new NFCTagType4({
          type: NFCTagType4NDEFContentType.Text,
          content: this.context.value.account,
          writable: false,
        });
        this.simulation = await HCESession.getInstance();
        this.simulation.setApplication(tag);
        await this.simulation.setEnabled(true);
      } catch (err) {
        console.log(err);
      }
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(WithdrawCryptoStateBase);
      this.scanFlag = true;
      this.connector && (await this.disconnectSession());
      this.interval && clearInterval(this.interval);
      await this.simulation.setEnabled(false);
      await this.clearAsyncStorageWC();
      this.mount = false;
    });
  }

  resetCamera() {
    this.setState(
      {
        reset: true,
      },
      () => {
        this.setState({
          reset: false,
        });
      },
    );
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

  callBackIoT = data => {
    console.log(data);
    if (JSON.parse(data[1]).token.substring(0, 3) === 'wc:' && this.scanFlag) {
      this.scanFlag = false;
      this.setupConnector(JSON.parse(data[1]).token);
    } else if (
      JSON.parse(data[1]).token.substring(0, 2) === '0x' &&
      this.scanFlag
    ) {
      this.scanFlag = false;
      this.setState({
        address: JSON.parse(data[1]).token,
        stage: 0.5,
      });
    } else if (
      JSON.parse(data[1]).token.substring(0, 9) === 'ethereum:' &&
      this.scanFlag
    ) {
      this.scanFlag = false;
      this.setState({
        address: JSON.parse(data[1]).token.substring(
          9,
          JSON.parse(data[1]).token.length,
        ),
        stage: 0.5,
      });
    } else {
      this.scanFlag = true;
    }
  };

  async getBalanceToken(address, tokenAddress) {
    return new Promise(async (resolve, reject) => {
      const contract = new this.web3.eth.Contract(abiERC20, tokenAddress);
      let res = await contract.methods.balanceOf(address).call();
      let decimals = await contract.methods.decimals().call();
      resolve(res / Math.pow(10, decimals));
    });
  }

  async acceptAndSign(signedTx) {
    this.mount &&
      this.setState({
        stage: 4,
      });
    let res = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
      async (error, hash) => {
        if (!error) {
          if (this.connector) {
            const {topic, id} = this.state.sessionRequestTransaction;
            console.log({topic, id});
            const response = formatJsonRpcResult(id, hash);
            await this.connector.respondSessionRequest({
              topic,
              response,
            });
          }
          this.mount &&
            (await this.setStateAsync({
              hash,
            }));
        } else {
          console.log(error);
        }
      },
    );
    console.log(res)
    this.mount &&
      this.setState({
        stage: 5,
      });
  }

  async maxSelected(token) {
    if (token.label === native) {
      this.mount &&
        this.setState({
          value: this.context.value.ethBalance.toString(),
        });
    }
    tokens.concat(xtokens).forEach((item, index) => {
      if (item === token.label) {
        this.mount &&
          this.setState({
            value: this.context.value.tokenBalances[item].toString(),
          });
      }
    });
  }

  async prepareTransaction(transaction) {
    try {
      console.log(transaction);
      const decodedData = this.abiDecoder.decodeMethod(transaction.data);
      const gasPrice = await this.web3.eth.getGasPrice();
      const balance = await this.web3.eth.getBalance(
        this.context.value.account,
      );
      const gasDisplay = await this.web3.eth.estimateGas(transaction);
      let gas;
      try {
        gas = transaction?.gas ?? gasDisplay;
      } catch (e) {
        console.log('Token insufficient funds');
      }
      if (
        parseInt(transaction?.value ?? '0x0') +
          gasDisplay * new BigNumber(gasPrice) >
        parseInt(balance)
      ) {
        console.log('insufficient funds');
      }
      // XCM transactions
      else if (
        transaction.to === '0x0000000000000000000000000000000000000804'
      ) {
        console.log('tokenXCM');
        const contract = new this.web3.eth.Contract(
          abiERC20,
          decodedData.params[0].value,
          {
            from: this.context.value.account,
          },
        );
        const amount = decodedData.params[1].value;
        const decimals = await contract.methods.decimals().call();
        const name = await contract.methods.name().call();
        this.setState({
          modal: true,
          transaction: {...transaction, gas},
          transactionDisplay: {
            kind: 'eth_sendTransaction',
            name,
            decimals,
            value: epsilonRound(amount * Math.pow(10, -decimals), 6).toString(),
            gas: epsilonRound(
              gasDisplay * new BigNumber(gasPrice) * Math.pow(10, -18),
              6,
            ).toString(),
          },
        });
      }
      // ERC20 transactions
      else if (decodedData?.name === 'transfer') {
        console.log('token');
        const contract = new this.web3.eth.Contract(abiERC20, transaction.to, {
          from: this.context.value.account,
        });
        const amount = decodedData.params[1].value;
        const decimals = await contract.methods.decimals().call();
        const name = await contract.methods.name().call();
        this.setState({
          modal: true,
          transaction: {...transaction, gas},
          transactionDisplay: {
            kind: 'eth_sendTransaction',
            name,
            decimals,
            value: epsilonRound(amount * Math.pow(10, -decimals), 6).toString(),
            gas: epsilonRound(
              gasDisplay * new BigNumber(gasPrice) * Math.pow(10, -18),
              6,
            ).toString(),
          },
        });
      }
      // Any Transaction
      else {
        console.log('transaction');
        this.setState({
          modal: true,
          transaction: {...transaction, gas},
          transactionDisplay: {
            kind: 'eth_sendTransaction',
            name: native,
            decimals: 18,
            value: epsilonRound(
              new BigNumber(transaction.value) * Math.pow(10, -18),
              6,
            ).toString(),
            gas: epsilonRound(
              gasDisplay * new BigNumber(gasPrice) * Math.pow(10, -18),
              6,
            ).toString(),
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async createTX() {
    this.setState({
      loading: 1,
    });
    if (this.state.token.label === native) {
      let transaction = {
        from: this.context.value.account,
        to: this.state.address,
        data: '0x',
        value: this.web3.utils.toHex(
          this.web3.utils.toWei(this.state.value, 'ether'),
        ),
      };
      const gas = await this.web3.eth.estimateGas(transaction);
      const gasPrice = await this.web3.eth.getGasPrice();
      if (
        parseFloat(
          this.web3.utils.toHex(
            this.web3.utils.toWei(this.state.value, 'ether'),
          ),
        ) === parseFloat(this.context.value.ethBalance)
      ) {
        transaction = {
          ...transaction,
          gas: this.web3.utils.toHex(gas),
          value: this.web3.utils.toHex(value - gas * gasPrice),
        };
      } else {
        transaction = {...transaction, gas: this.web3.utils.toHex(gas)};
      }
      if (
        parseFloat(
          this.web3.utils.toHex(
            this.web3.utils.toWei(this.state.value, 'ether') + gas * gasPrice,
          ),
        ) > parseFloat(this.context.value.ethBalance)
      ) {
        this.setState({
          loading: 0,
        });
      } else {
        this.setState({
          transaction,
          loading: 2,
          transactionDisplay: {
            kind: 'eth_sendTransaction',
            name: native,
            decimals: 18,
            value: epsilonRound(
              new BigNumber(transaction.value) * Math.pow(10, -18),
              6,
            ).toString(),
            gas: epsilonRound(
              new BigNumber(gas * gasPrice) * Math.pow(10, -18),
              6,
            ).toString(),
          },
        });
      }
    } else {
      const contract = new this.web3.eth.Contract(
        abiERC20,
        this.state.token.value,
        {
          from: this.context.value.account,
        },
      );
      let decimals = await contract.methods.decimals().call();
      let transaction = {
        to: this.state.token.value,
        from: this.context.value.account,
        data: contract.methods
          .transfer(
            this.state.address,
            this.web3.utils.toHex(
              parseInt(parseFloat(this.state.value) * Math.pow(10, decimals)),
            ),
          )
          .encodeABI(),
      };
      const gas = await contract.methods
        .transfer(
          this.state.address,
          this.web3.utils.toHex(
            parseInt(parseFloat(this.state.value) * Math.pow(10, decimals)),
          ),
        )
        .estimateGas();
      const gasPrice = await this.web3.eth.getGasPrice();
      transaction = {...transaction, gas: this.web3.utils.toHex(gas)};
      const name = await contract.methods.name().call();
      if (
        gas * gasPrice >
        this.web3.utils.toWei(this.context.value.ethBalance, 'ether')
      ) {
        this.setState({
          loading: 0,
        });
      } else {
        this.setState({
          transaction,
          loading: 2,
          transactionDisplay: {
            kind: 'eth_sendTransaction',
            name,
            decimals,
            value: this.state.value,
            gas: epsilonRound(
              new BigNumber(gas * gasPrice) * Math.pow(10, -18),
              6,
            ).toString(),
          },
        });
      }
    }
  }

  clearKeyboard() {
    this.mount &&
      this.setState(
        {
          clear: true,
        },
        () => {
          this.mount &&
            this.setState({
              clear: false,
            });
        },
      );
  }

  async disconnectSession() {
    await this.connector
      .disconnectSession({
        topic: this.state.session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      })
      .catch(e => console.log(e));
  }

  async rejectSession() {
    const {id} = this.state.sessionRequest;
    await this.connector.rejectSession({
      id,
      reason: getSdkError('USER_REJECTED_METHODS'),
    });
  }

  async approveRequest() {
    const {id, params} = this.state.sessionRequest;
    const namespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        eip155: {
          chains: ['eip155:420'],
          methods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'eth_sign',
            'personal_sign',
            'eth_signTypedData',
          ],
          events: ['accountsChanged', 'chainChanged'],
          accounts: [`eip155:420:${this.context.value.account}`],
        },
      },
    });
    const session = await this.connector.approveSession({
      id,
      namespaces,
    });
    this.setState({
      stage: 2,
      session,
    });
  }

  async setupConnector(token) {
    this.connector = await Web3Wallet.init({
      core: this.core, // <- pass the shared `core` instance
      metadata: {
        name: NODE_ENV_NETWORK_APPNAME + ' Wallet EVM',
        description: NODE_ENV_NETWORK_APPNAME + 'Wallet EVM Superapp',
        url: `http://${NODE_ENV_NETWORK_APPNAME}.com/`,
        icons: ['https://i.ibb.co/m4RCzgF/logo-ETHcrop.png'],
      },
    });
    this.connector.on('session_request', async sessionRequest => {
      await this.setStateAsync({
        sessionRequestTransaction: sessionRequest,
      });
      if (sessionRequest.params.request.method === 'eth_sendTransaction') {
        this.prepareTransaction(sessionRequest.params.request.params[0]);
      }
    });
    // Approval: Using this listener for sessionProposal, you can accept the session
    this.connector.on('session_proposal', async sessionRequest => {
      let {metadata} = sessionRequest.params.proposer;
      this.setState({
        metadata,
        sessionRequest,
        stage: 1,
      });
    });
    await this.connector.core.pairing.pair({uri: token});
  }

  async clearAsyncStorageWC() {
    await AsyncStorage.multiRemove([
      'wc@2:client:0.3//proposal',
      'wc@2:client:0.3//request',
      'wc@2:client:0.3//session',
      'wc@2:core:0.3//expirer',
      'wc@2:core:0.3//history',
      'wc@2:core:0.3//keychain',
      'wc@2:core:0.3//messages',
      'wc@2:core:0.3//pairing',
      'wc@2:core:0.3//subscription',
    ]);
  }

  async componentWillUnmount() {
    await this.simulation.setEnabled(false);
    this.connector && (await this.disconnectSession());
    this.interval && clearInterval(this.interval);
    await this.clearAsyncStorageWC();
    this.mount = false;
  }

  render() {
    const modalScale = 0.6;
    return (
      <View style={GlobalStyles.container}>
        <Header />
        <Modal
          visible={this.state.modal}
          transparent={true}
          animationType="slide">
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: 'black',
              width: Dimensions.get('window').width * 0.94,
              height: Dimensions.get('window').height * modalScale,
              marginTop: Dimensions.get('window').height * (1 - modalScale),
              borderWidth: 2,
              borderColor: headerColor,
              padding: 20,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Dapp
            </Text>
            <Image
              resizeMode="contain"
              style={{
                width: '100%',
                height: '30%',
                borderRadius: 500,
              }}
              source={{
                uri: this.state.metadata?.icon
                  ? this.state.metadata?.icon[0]
                  : 'https://i.ibb.co/m4RCzgF/logo-ETHcrop.png',
              }}
            />
            <View
              style={{
                backgroundColor: contentColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 26,
                width: '100%',
              }}>
              {this.state.transactionDisplay.kind}
            </Text>
            <View
              style={{
                backgroundColor: contentColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                width: '100%',
              }}>
              Amount:
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {this.state.transactionDisplay.value}{' '}
              {this.state.transactionDisplay.name}
            </Text>
            <View
              style={{
                backgroundColor: contentColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                width: '100%',
              }}>
              Gas:
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {this.state.transactionDisplay.gas} {native}
            </Text>
            <View
              style={{
                backgroundColor: contentColor,
                height: 1,
                width: '90%',
                marginVertical: 10,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
              }}>
              <Pressable
                style={[
                  GlobalStyles.button,
                  {
                    width: '45%',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRightColor: 'black',
                    borderRightWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={() =>
                  this.mount &&
                  this.setState(
                    {
                      modal: false,
                    },
                    () => {
                      this.setState({
                        stage: 3,
                      });
                    },
                  )
                }>
                <Text style={[GlobalStyles.buttonText]}>Accept</Text>
              </Pressable>
              <Pressable
                style={[
                  GlobalStyles.button,
                  {
                    width: '45%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
                ]}
                onPress={async () => {
                  const response = {
                    id: this.state.sessionRequestTransaction.id,
                    jsonrpc: '2.0',
                    error: {
                      code: 5000,
                      message: 'User rejected.',
                    },
                  };
                  this.mount &&
                    (await this.connector.respondSessionRequest({
                      topic: this.state.sessionRequestTransaction.topic,
                      response,
                    }));
                  this.setState({
                    stage: 2,
                    modal: false,
                  });
                }}>
                <Text style={[GlobalStyles.buttonText]}>Reject</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <View style={{position: 'absolute', top: 9, left: 18}}>
          <Pressable
            onPress={() => this.props.navigation.navigate('CryptoAccount')}>
            <IconMC name="arrow-back-ios" size={36} color={headerColor} />
          </Pressable>
        </View>
        {(this.mount && this.state.stage) === 0 && (
          <View style={{position: 'absolute', top: 18, right: 18}}>
            <IotReciever
              publish={this.state.publish}
              sub_topics={[
                `/PolkaSend/WalletConnect/${this.context.value.account}`,
              ]}
              callback={this.callBackIoT}
              callbackPublish={() =>
                this.mount && this.setState({publish: {message: '', topic: ''}})
              }
            />
          </View>
        )}
        {this.state.stage === 0 && (
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: 20,
              },
            ]}>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 30,
                  width: '80%',
                }}>
                Scan QR or NFC
              </Text>
            </View>
            <View
              style={{
                height: Dimensions.get('screen').height * 0.5,
                width: Dimensions.get('screen').width * 0.8,
                borderColor: contentColor,
                borderWidth: 5,
                borderRadius: 10,
              }}>
              <Cam
                scanFlag={this.state.scanFlag}
                reset={this.state.reset}
                callbackAddress={e =>
                  this.setState({
                    address: e,
                    stage: 0.5,
                    scanFlag: false,
                  })
                }
                callbackWC={e => {
                  this.setupConnector(e);
                  this.setState({
                    scanFlag: false,
                  });
                }}
              />
            </View>
          </View>
        )}
        {this.state.stage === 0.5 && (
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              },
            ]}>
            <Text
              style={{
                textAlign: 'center',
                width: '100%',
                fontSize: 26,
                fontFamily: 'Helvetica',
                color: 'white',
              }}>
              To Address:
              {'\n'}
              {this.state.address.substring(0, 21)}
              {'\n'}
              {this.state.address.substring(21, 42)}
            </Text>
            <View
              style={{
                borderBottomWidth: 2,
                borderColor: contentColor,
                width: '90%',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <Picker
                isRequired
                buttonStyle={{
                  fontSize: 20,
                  textAlign: 'center',
                  backgroundColor: 'black',
                }}
                itemLabelStyle={[
                  {fontSize: 20, textAlign: 'center', color: 'white'},
                ]}
                selectedValueStyle={[
                  {fontSize: 20, textAlign: 'center', color: 'white'},
                ]}
                iconWrapperStyle={{backgroundColor: 'black'}}
                items={[{label: native, value: '0'}].concat(
                  tokens.concat(xtokens).map((item, index) => ({
                    label: item,
                    value: tokensContracts.concat(xtokensContracts)[index],
                  })),
                )}
                selectedValue={this.state.token.value}
                onSelection={item => {
                  if (
                    JSON.stringify(item) !== JSON.stringify(this.state.token)
                  ) {
                    this.mount &&
                      this.setState({
                        token: item,
                        value: '0',
                      });
                  }
                }}
              />
              <Text
                style={{
                  fontSize: 36,
                  fontFamily: 'Helvetica',
                  color: 'white',
                }}>
                {this.state.value.substring(
                  0,
                  this.state.value.indexOf('.') === -1
                    ? this.state.value.length
                    : this.state.value.indexOf('.') + 6,
                )}
              </Text>
              <Pressable
                style={{paddingTop: 6}}
                onPress={() => this.maxSelected(this.state.token)}>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: 'Helvetica',
                    color: 'white',
                  }}>
                  max{'   '}
                </Text>
              </Pressable>
            </View>
            <VirtualKeyboard
              style={{marginTop: -20}}
              rowStyle={{
                width: Dimensions.get('window').width,
              }}
              cellStyle={{
                height: Dimensions.get('window').width / 8,
                borderWidth: 1,
                margin: 1,
              }}
              colorBack={'black'}
              color="white"
              pressMode="string"
              decimal
              onPress={val => this.mount && this.setState({value: val})}
              clear={this.state.clear}
            />
            <Pressable
              disabled={this.state.loading === 1 || this.state.loading === 3}
              style={[GlobalStyles.button, {marginTop: 10}]}
              onPress={async () => {
                this.state.loading === 0 && this.createTX();
                this.state.loading === 2 && this.setState({stage: 3});
              }}>
              <Text style={[GlobalStyles.buttonText]}>
                {this.state.loading === 0 && 'Check'}
                {this.state.loading === 1 && 'Checking...'}
                {this.state.loading === 2 && 'Send'}
                {this.state.loading === 3 && 'Sending...'}
              </Text>
            </Pressable>
          </View>
        )}
        {this.state.stage === 1 && (
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: 20,
              },
            ]}>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 30,
                  width: '80%',
                }}>
                Connect to Dapp
              </Text>
            </View>
            <View
              style={{
                borderWidth: 10,
                borderColor: contentColor,
                borderRadius: 500,
              }}>
              <Image
                style={{
                  width: Dimensions.get('window').width / 1.5,
                  height: Dimensions.get('window').width / 1.5,
                  borderRadius: 500,
                }}
                source={{
                  uri: this.state.metadata.icons[0],
                }}
              />
            </View>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              {this.state.metadata.name}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              {this.state.metadata.description}
            </Text>
            <Pressable
              style={[
                GlobalStyles.button,
                {
                  backgroundColor: contentColor,
                },
              ]}
              onPress={() => {
                this.approveRequest();
              }}>
              <Text style={[GlobalStyles.buttonText]}>Accept</Text>
            </Pressable>
            <Pressable
              style={[
                GlobalStyles.button,
                {
                  backgroundColor: contentColor,
                },
              ]}
              onPress={async () => {
                await this.rejectSession();
                this.props.navigation.navigate('CryptoAccount');
              }}>
              <Text style={[GlobalStyles.buttonText]}>Reject</Text>
            </Pressable>
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
                paddingTop: 20,
              },
            ]}>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 30,
                  width: '80%',
                }}>
                Connected to Dapp
              </Text>
            </View>
            <View
              style={{
                borderRadius: 500,
                borderWidth: 10,
                borderColor: contentColor,
              }}>
              <Image
                style={{
                  width: Dimensions.get('window').width / 1.5,
                  height: Dimensions.get('window').width / 1.5,
                  borderRadius: 500,
                }}
                source={{
                  uri: this.state.metadata.icons[0],
                }}
              />
            </View>
            <Pressable
              style={[GlobalStyles.button]}
              onPress={async () => {
                await this.disconnectSession();
                this.props.navigation.navigate('CryptoAccount');
              }}>
              <Text style={[GlobalStyles.buttonText]}>Disconnect</Text>
            </Pressable>
          </View>
        )}
        {this.state.stage === 2.5 && (
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: 20,
              },
            ]}>
            <View>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 30,
                  width: '80%',
                }}>
                Connected to Dapp
              </Text>
            </View>
            <View
              style={{
                borderRadius: 500,
                borderWidth: 10,
                borderColor: contentColor,
              }}>
              <Image
                style={{
                  width: Dimensions.get('window').width / 1.5,
                  height: Dimensions.get('window').width / 1.5,
                  borderRadius: 500,
                }}
                source={{
                  uri: this.state.metadata.icons[0],
                }}
              />
            </View>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              {this.state.transaction.kind}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Amount: {this.state.transactionDisplay.value}
              {'\n'}
              {this.state.transactionDisplay.name}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Gas: {this.state.transactionDisplay.gas} {'\n'} {native}
            </Text>
            <Pressable
              style={[GlobalStyles.button]}
              onPress={() => {
                this.mount &&
                  this.setState({
                    stage: 3,
                  });
              }}>
              <Text style={[GlobalStyles.buttonText]}>Accept</Text>
            </Pressable>
            <Pressable
              style={[GlobalStyles.button]}
              onPress={async () => {
                const response = {
                  id: this.state.sessionRequest.id,
                  jsonrpc: '2.0',
                  error: {
                    code: 5000,
                    message: 'User rejected.',
                  },
                };
                await this.connector.respondSessionRequest({
                  topic: this.state.sessionRequest.topic,
                  response,
                });
                this.setState({
                  stage: 2,
                });
              }}>
              <Text style={[GlobalStyles.buttonText]}>Reject</Text>
            </Pressable>
          </View>
        )}
        {this.state.stage === 3 && (
          <CryptoSign
            transaction={this.state.transaction}
            signTrans={e => this.acceptAndSign(e)}
            cancelTrans={e => console.log(e)}
          />
        )}
        {this.state.stage === 4 && (
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                paddingTop: 20,
              },
            ]}>
            <Icon name="timer-sand" size={240} color={contentColor} />
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Waiting Confirmation...
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Amount: {this.state.transactionDisplay.value}
              {'\n'}
              {this.state.transactionDisplay.name}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Gas: {this.state.transactionDisplay.gas}
              {'\n'} {native}
            </Text>
          </View>
        )}
        {this.state.stage === 5 && (
          <View
            style={[
              GlobalStyles.mainSub,
              {
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              },
            ]}>
            <Icon2 name="check-circle" size={240} color={contentColor} />
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
                Linking.openURL(NODE_ENV_EXPLORER + 'tx/' + this.state.hash)
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
              style={[GlobalStyles.button]}
              onPress={() => {
                this.props.navigation.navigate('CryptoAccount');
              }}>
              <Text style={[GlobalStyles.buttonText]}>Done</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }
}

export default WithdrawCrypto;
