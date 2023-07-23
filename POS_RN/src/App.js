// In App.js in a new project

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StatusBar} from 'react-native';
import { getBundleId } from 'react-native-device-info';
// Utils
import {ContextProvider} from './utils/contextModule';
// Screens
import Setup from './screens/setups';
import Payments from './screens/payments';
import DepositCrypto from './screens/depositCrypto';
import DepositFiat from './screens/depositFiat';
import CryptoAccount from './screens/cryptoAccount';
import WalletConnectPolka from './screens/wcComponentPolka';
//import WithdrawCrypto from './screens/cryptoAccountComponents/withdrawCrypto';
import CryptoMainTransactions from './screens/cryptoAccountComponents/cryptoMainTransactions';
import FiatAccount from './screens/fiatAccount';
import FiatMainTransactions from './screens/fiatAccountComponents/fiatMainTransactions';
//import WithdrawFiat from './screens/fiatAccountComponents/withdrawFiat';

import SplashScreen from 'react-native-splash-screen';
import PolkaAccount from './screens/polkaAccount';
import DepositCryptoPolka from './screens/cryptoAccountComponentsPolka/depositCryptoPolka';
import CryptoCheckPinPolka from './screens/cryptoAccountComponentsPolka/cryptoCheckPinPolka';
import CryptoMainTransactionsPolka from './screens/cryptoAccountComponentsPolka/cryptoMainTransactionsPolka';
import PaymentsBlockchain from './screens/paymentsSelector';
import WalletConnectETH from './screens/wcComponentETH';
import Test from './screens/test';

const Stack = createNativeStackNavigator();

class App extends React.Component {
  componentDidMount() {
    console.log("Bundle Name: " + getBundleId())
    SplashScreen.hide();
  }

  render() {
    return (
      <ContextProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator
            initialRouteName="Setup"
            screenOptions={{
              headerShown: false,
              animation: 'none',
            }}>
            {
              // Setup
            }
            <Stack.Screen name="Setup" component={Setup} />
            <Stack.Screen name="Test" component={Test} />
            {
              // Mains
            }
            <Stack.Screen name="Payments" component={Payments} />
            <Stack.Screen name="CryptoAccount" component={CryptoAccount} />
            <Stack.Screen name="FiatAccount" component={FiatAccount} />
            <Stack.Screen name="PolkaAccount" component={PolkaAccount} />
            {
              // Sub Payments
            }
            <Stack.Screen name="DepositCrypto" component={DepositCrypto} />
            <Stack.Screen name="DepositFiat" component={DepositFiat} />
            <Stack.Screen name="WalletConnectETH" component={WalletConnectETH} />
            <Stack.Screen name="WalletConnectPolka" component={WalletConnectPolka} />
            <Stack.Screen name="PaymentsBlockchain" component={PaymentsBlockchain} />
            {
              // Sub Polka
            }
            <Stack.Screen name="DepositCryptoPolka" component={DepositCryptoPolka} />
            <Stack.Screen name="CryptoCheckPinPolka" component={CryptoCheckPinPolka} />
            <Stack.Screen name="CryptoTransactionsPolka" component={CryptoMainTransactionsPolka} />
            {
              // Sub Crypto Account
            }
            {
              // <Stack.Screen name="CryptoCashOut" component={WithdrawCrypto} />
            }
            <Stack.Screen
              name="CryptoTransactions"
              component={CryptoMainTransactions}
            />
            {
              // Sub Fiat Account
            }
            <Stack.Screen
              name="FiatTransactions"
              component={FiatMainTransactions}
            />
            {
              //<Stack.Screen name="WithdrawFiat" component={WithdrawFiat} />
            }
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    );
  }
}

export default App;
