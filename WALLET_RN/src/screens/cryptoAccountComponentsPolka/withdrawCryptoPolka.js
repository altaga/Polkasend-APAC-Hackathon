import {Core} from '@walletconnect/core';
import {buildApprovedNamespaces, getSdkError} from '@walletconnect/utils';
import {Web3Wallet} from '@walletconnect/web3wallet';
import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import {Picker} from 'react-native-form-component';
import HCESession, {NFCContentType, NFCTagType4} from 'react-native-hce';
import Icon2 from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMC from 'react-native-vector-icons/MaterialIcons';
import VirtualKeyboard from 'react-native-virtual-keyboard';
import GlobalStyles from '../../styles/styles';
import ContextModule from '../../utils/contextModule';
import IotReciever from '../../utils/iot-reciever-aws';
import Header from '../components/header';
import CryptoSign from './cryptoSign';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {ethers} from 'ethers';
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
  polkaNames,
  polkaNativeTokens,
  polkaTokens,
  polkaTokensZeros,
  tokens,
  xtokens,
} from '../../../env';
import Cam from '../components/camPolka';
import Web3 from 'web3';
import {TypeRegistry} from '@polkadot/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  network:polkaNames[index]
}));

const WithdrawCryptoPolkaStateBase = {
  stage: 0, // 0
  publish: {
    message: '',
    topic: '',
  },
  metadata: {},
  address: '',
  transaction: {},
  transactionDisplay: {
    kind: 'polkadot_signTransaction',
    name: tokenList[4].label,
    decimals: tokenList[4].decimals,
    value: 0,
    gas: 0
  },
  session: {},
  sessionRequest: {},
  sessionRequestTransaction: {},
  hash: '',
  tokenList,
  token: tokenList[4],
  value: '0',
  loading: 0,
  modal: false,
  scanFlag: true,
  reset: false,
  clear: false,
};

class WithdrawCryptoPolka extends Component {
  constructor(props) {
    super(props);
    this.state = WithdrawCryptoPolkaStateBase;
    reactAutobind(this);
    this.simulation = null;
    this.mount = true;
    this.connector = null;
    this.scanFlag = true;
    this.core = new Core({
      projectId: WCproject,
    });
    this.api = null;
    this.web3 = new Web3(NODE_ENV_NETWORK_RCP);
  }

  static contextType = ContextModule;

  componentDidMount() {
    this.props.navigation.addListener('focus', async () => {
      this.mount = true;
      this.setState(WithdrawCryptoPolkaStateBase);
      const tag = new NFCTagType4(
        NFCContentType.Text,
        this.context.value.polkaAccount,
      );
      this.simulation = await new HCESession(tag).start();
    });
    this.props.navigation.addListener('blur', async () => {
      this.setState(WithdrawCryptoPolkaStateBase);
      await this.simulation.terminate();
      this.connector && (await this.disconnectSession());
      await this.clearAsyncStorageWC();
      this.mount = false;
    });
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

  callBackIoT = data => {
    if (JSON.parse(data[1]).token.substring(0, 3) === 'wc:' && this.scanFlag) {
      this.scanFlag = false;
      this.setupConnector(JSON.parse(data[1]).token);
    } else if (
      JSON.parse(data[1]).token.length === 47 ||
      (JSON.parse(data[1]).token.length === 48 && this.scanFlag)
    ) {
      this.scanFlag = false;
      this.setState({
        stage: 0.5,
        address: JSON.parse(data[1]).token,
      });
    }
  };

  async createTX() {
    this.setState({
      loading: 1,
    });
    const wsProvider = new WsProvider(this.state.token.websocket);
    this.api = await ApiPromise.create({provider: wsProvider});
    const balance = await this.api.query.system.account(
      this.context.value.polkaAccount,
    );
    if (this.state.token.label === 'aUSD') {
      const tokenBalance = await this.api.query.tokens.accounts(
        this.context.value.polkaAccount,
        {Token: 'AUSD'},
      );
      const transaction = this.api.tx.currencies.transfer(
        this.state.address,
        {Token: 'AUSD'},
        parseInt(
          parseFloat(this.state.value) *
            Math.pow(10, this.state.token.decimals),
        ),
      );
      const info = await this.api.tx.currencies
        .transfer(
          this.state.address,
          {Token: 'AUSD'},
          parseInt(
            parseFloat(this.state.value) *
              Math.pow(10, this.state.token.decimals),
          ),
        )
        .paymentInfo(this.context.value.polkaAccount);
      if (
        parseInt(balance.data.free.toString()) <=
          parseInt(info.partialFee.toString()) &&
        tokenBalance.free <=
          parseInt(
            parseFloat(this.state.value) *
              Math.pow(10, this.state.token.decimals),
          )
      ) {
        this.setState({
          loading: 0,
        });
      } else {
        this.setState({
          transaction,
          loading: 2,
          transactionDisplay: {
            kind: 'polkadot_signTransaction',
            name: this.state.token.label,
            decimals: this.state.token.decimals,
            value: this.state.value,
            gas: epsilonRound(
              info.partialFee * Math.pow(10, -this.state.token.decimals),
              6,
            ).toString(),
          },
        });
      }
    } else if (
      this.state.token.label === 'IBTC' ||
      this.state.token.label === 'INTR'
    ) {
      const tokenBalance = await this.api.query.tokens.accounts(
        this.context.value.polkaAccount,
        {Token: this.state.token.label},
      );
      const tx = this.api.tx.tokens.transfer(
        this.state.address,
        {Token: this.state.token.label},
        parseInt(
          parseFloat(this.state.value) *
            Math.pow(10, this.state.token.decimals),
        ),
      );
      const info = await this.api.tx.tokens
        .transfer(
          this.state.address,
          {Token: this.state.token.label},
          parseInt(
            parseFloat(this.state.value) *
              Math.pow(10, this.state.token.decimals),
          ),
        )
        .paymentInfo(this.context.value.polkaAccount);
      if (
        parseInt(balance.data.free.toString()) <=
          parseInt(info.partialFee.toString()) &&
        tokenBalance.free <=
          parseInt(
            parseFloat(this.state.value) *
              Math.pow(10, this.state.token.decimals),
          )
      ) {
        this.setState({
          loading: 0,
        });
      } else {
        this.setState({
          transaction: tx,
          loading: 2,
          transactionDisplay: {
            kind: 'polkadot_signTransaction',
            name: this.state.token.label,
            decimals: this.state.token.decimals,
            value: this.state.value,
            gas: epsilonRound(
              info.partialFee * Math.pow(10, -this.state.token.decimals),
              6,
            ).toString(),
          },
        });
      }
    } else if (this.state.token.label === 'USDT') {
      const tokenBalance = await this.api.query.assets.account(
        1984,
        '12s6UMSSfE2bNxtYrJc6eeuZ7UxQnRpUzaAh1gPQrGNFnE8h',
      );
      const tx = this.api.tx.assets.transfer(
        1984,
        this.state.address,
        parseInt(
          parseFloat(this.state.value) *
            Math.pow(10, this.state.token.decimals),
        ),
      );
      const info = await this.api.tx.assets
        .transfer(
          1984,
          this.state.address,
          parseInt(
            parseFloat(this.state.value) *
              Math.pow(10, this.state.token.decimals),
          ),
        )
        .paymentInfo(this.context.value.polkaAccount);
      let temp;
      try {
        temp = JSON.parse(JSON.stringify(tokenBalance)).balance;
      } catch {
        temp = 0;
      }
      if (
        parseInt(balance.data.free.toString()) <=
          parseInt(info.partialFee.toString()) ||
        temp <=
          parseInt(
            parseFloat(this.state.value) *
              Math.pow(10, this.state.token.decimals),
          )
      ) {
        this.setState({
          loading: 0,
        });
      } else {
        this.setState({
          transaction: tx,
          loading: 2,
          transactionDisplay: {
            kind: 'polkadot_signTransaction',
            name: this.state.token.label,
            decimals: this.state.token.decimals,
            value: this.state.value,
            gas: epsilonRound(
              info.partialFee * Math.pow(10, -this.state.token.decimals),
              6,
            ).toString(),
          },
        });
      }
    } else {
      const amount = this.web3.utils.toHex(
        parseInt(
          parseFloat(this.state.value) *
            Math.pow(10, this.state.token.decimals),
        ),
      );
      const tx = this.api.tx.balances.transfer(this.state.address, amount);
      const info = await this.api.tx.balances
        .transfer(this.state.address, amount)
        .paymentInfo(this.context.value.polkaAccount);
      if (
        parseInt(balance.data.free.toString()) <=
        parseInt(info.partialFee.toString())
      ) {
        console.log('nope');
        this.setState({
          loading: 0,
        });
      } else {
        this.setState({
          transaction: tx,
          loading: 2,
          transactionDisplay: {
            kind: 'polkadot_signTransaction',
            name: this.state.token.label,
            decimals: this.state.token.decimals,
            value: this.state.value,
            gas: epsilonRound(
              info.partialFee * Math.pow(10, -this.state.token.decimals),
              6,
            ).toString(),
          },
        });
      }
    }
  }

  async sendSignature(signature) {
    const response = {
      id: this.state.sessionRequestTransaction.id,
      result: {...signature},
      jsonrpc: '2.0',
    };
    await this.connector.respondSessionRequest({
      topic: this.state.session.topic,
      response,
    });
    console.log(response);
    this.setState({
      stage: 5,
    });
  }

  checkHash(hash) {
    this.setState({
      stage: 4,
    });
    let interval = null;
    interval = setInterval(async () => {
      const blockHash = await this.api.rpc.chain.getBlock();
      blockHash.block.extrinsics.forEach(async (ex, index) => {
        if (hash.toString() === ex.hash.toHex()) {
          this.setState({
            stage: 5,
            hash,
          });
          clearInterval(interval);
        }
      });
    }, 3000);
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
    const chainIndex = PolkaWalletConnect.findIndex(
      element =>
        element === params.requiredNamespaces.polkadot.chains[0].split(':')[1],
    );
    console.log(chainIndex);
    const namespaces = buildApprovedNamespaces({
      proposal: params,
      supportedNamespaces: {
        polkadot: {
          methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
          chains: PolkaWalletConnect.map(item => `polkadot:${item}`),
          events: ['chainChanged", "accountsChanged'],
          accounts: PolkaWalletConnect.map(
            item => `polkadot:${item}:${this.context.value.polkaAccount}`,
          ),
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
      token: tokenList[chainIndex],
    });
  }

  async setupConnector(token) {
    this.connector = await Web3Wallet.init({
      core: this.core, // <- pass the shared `core` instance
      metadata: {
        name: NODE_ENV_NETWORK_APPNAME + 'Wallet',
        description: NODE_ENV_NETWORK_APPNAME + 'Wallet Connector',
        url: `http://${NODE_ENV_NETWORK_APPNAME}.com/`,
        icons: ['https://i.ibb.co/m4RCzgF/logo-ETHcrop.png'],
      },
    });

    this.connector.on('session_request', async sessionRequest => {
      if (sessionRequest.params.request.method === 'polkadot_signTransaction') {
        try {
          const payload =
            sessionRequest.params.request.params.transactionPayload;
          const registry = new TypeRegistry();
          registry.setSignedExtensions(payload.signedExtensions);
          const txPayload = registry.createType('ExtrinsicPayload', payload, {
            version: payload.version,
          });
          this.setState({
            modal: true,
            sessionRequestTransaction: sessionRequest,
            transaction: txPayload,
            loading: 2,
            transactionDisplay: {
              kind: 'polkadot_signTransaction',
              name: this.state.token.label,
              decimals: this.state.token.decimals,
              value: '0',
              gas: '0',
            },
          });
        } catch (err) {
          console.log(err);
        }
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

  async componentWillUnmount() {
    await this.simulation.terminate();
    this.connector && (await this.disconnectSession());
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
              Parachain:{' '}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 24,
                width: '100%',
              }}>
              {this.state.token.network}
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
            onPress={() => this.props.navigation.navigate('PolkaAccount')}>
            <IconMC name="arrow-back-ios" size={36} color={headerColor} />
          </Pressable>
        </View>
        {this.state.mount && this.state.stage === 0 && (
          <View style={{position: 'absolute', top: 18, right: 18}}>
            <IotReciever
              publish={this.state.publish}
              sub_topics={[
                `/PolkaSend/WalletConnect/${this.context.value.polkaAccount}`,
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
                callbackWC={e => {
                  this.setupConnector(e);
                  this.setState({
                    scanFlag: false,
                  });
                }}
                callbackAddress={e =>
                  this.setState({
                    stage: 0.5,
                    address: e,
                    scanFlag: false,
                  })
                }
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
                items={polkaTokens.map((item, index) => ({
                  label: item,
                  value: polkaTokens[index],
                  decimals: polkaTokensZeros[index],
                  websocket: NODE_ENV_RPCS[index],
                  explorer: PolkaExporers[index],
                  native: polkaNativeTokens[index],
                }))}
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
              <View style={{width: '20%'}}></View>
              {/*
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
                */}
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
              style={[GlobalStyles.button]}
              onPress={() => {
                this.approveRequest();
              }}>
              <Text style={[GlobalStyles.buttonText]}>Accept</Text>
            </Pressable>
            <Pressable
              style={[GlobalStyles.button]}
              onPress={async () => {
                await this.rejectSession();
                this.props.navigation.navigate('WithdrawCryptoPolka');
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
                this.props.navigation.navigate('WithdrawCryptoPolka');
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
              Amount:{' '}
              {epsilonRound(
                ethers.utils.parseEther(this.state.transaction.value),
                6,
              ).toString()}{' '}
              {this.state.transaction.token ?? native}
            </Text>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 30,
                width: '80%',
              }}>
              Gas:{' '}
              {epsilonRound(
                ethers.utils.parseEther(this.state.transaction.gas),
                6,
              ).toString()}{' '}
              {native}
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
            api={this.api}
            transaction={this.state.transaction}
            hash={e => this.checkHash(e)}
            signature={e => this.sendSignature(e)}
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
              {'\n'} {this.state.token.native}
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
                Linking.openURL(
                  this.state.hash
                    ? this.state.token.explorer + '/tx/' + this.state.hash
                    : this.state.token.explorer +
                        '/account/' +
                        this.context.value.polkaAccount,
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
              style={[GlobalStyles.button]}
              onPress={() => {
                this.props.navigation.navigate('PolkaAccount');
              }}>
              <Text style={[GlobalStyles.buttonText]}>Done</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }
}

export default WithdrawCryptoPolka;
