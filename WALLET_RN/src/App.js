// In App.js in a new project

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
// Utils
import { ContextProvider } from "./utils/contextModule";
// Screens
import Setup from "./screens/setups"
import CryptoAccount from './screens/cryptoAccount';

import CryptoCheckPin from './screens/cryptoAccountComponents/cryptoCheckPin';
import CryptoCheckPinPolka from './screens/cryptoAccountComponentsPolka/cryptoCheckPinPolka';
import DepositCrypto from './screens/cryptoAccountComponents/depositCrypto';
import DepositCryptoPolka from './screens/cryptoAccountComponentsPolka/depositCryptoPolka';
import WithdrawCrypto from './screens/cryptoAccountComponents/withdrawCrypto';
import WithdrawCryptoPolka from './screens/cryptoAccountComponentsPolka/withdrawCryptoPolka';
import CryptoMainTransactions from './screens/cryptoAccountComponents/cryptoMainTransactions';
import CryptoMainTransactionsPolka from './screens/cryptoAccountComponentsPolka/cryptoMainTransactionsPolka';
import CheckPin from './screens/setupComponents/checkPin';
import Landing from './screens/landing';
import FiatAccount from './screens/fiatAccount';
import Swap from './screens/swap';
import DepositFiat from './screens/fiatAccountComponents/depositFiat';
//import WithdrawFiat from './screens/fiatAccountComponents/withdrawFiat';
import FiatCheckPin from './screens/fiatAccountComponents/fiatCheckPin';
import FiatMainTransactions from './screens/fiatAccountComponents/fiatMainTransactions';
import CashOut from './screens/fiatAccountComponents/cashout';
import SplashScreen from "react-native-splash-screen";
import PolkaAccount from './screens/polkaAccount';

const Stack = createNativeStackNavigator();

class App extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
  }
  render() {
    return (
      <ContextProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator
            //initialRouteName="Setup"
            initialRouteName="Setup"
            screenOptions={{
              headerShown: false,
              animation: 'none'
            }}
          >
            {
              // Setup
            }
            <Stack.Screen name="Setup" component={Setup} />
            <Stack.Screen name="CheckPin" component={CheckPin} />
            {
              // Mains
            }
            <Stack.Screen name="Landing" component={Landing} />
            <Stack.Screen name="CryptoAccount" component={CryptoAccount} />
            <Stack.Screen name="PolkaAccount" component={PolkaAccount} />
            <Stack.Screen name="FiatAccount" component={FiatAccount} />
            <Stack.Screen name="Swap" component={Swap} />
            {
              // Sub Crypto Account
            }
            <Stack.Screen name="DepositCrypto" component={DepositCrypto} />
            <Stack.Screen name="CryptoCheckPin" component={CryptoCheckPin} />
            <Stack.Screen name="CryptoTransactions" component={CryptoMainTransactions} />
            <Stack.Screen name="WithdrawCrypto" component={WithdrawCrypto} />
            {
              // Sub Polka
            }
            <Stack.Screen name="DepositCryptoPolka" component={DepositCryptoPolka} />
            <Stack.Screen name="CryptoCheckPinPolka" component={CryptoCheckPinPolka} />
            <Stack.Screen name="CryptoTransactionsPolka" component={CryptoMainTransactionsPolka} />
            <Stack.Screen name="WithdrawCryptoPolka" component={WithdrawCryptoPolka} />
            {
              //
              // Sub Fiat Account
              //<Stack.Screen name="WithdrawFiat" component={WithdrawFiat} />
            }
            <Stack.Screen name="DepositFiat" component={DepositFiat} />
            
            <Stack.Screen name="FiatCheckPin" component={FiatCheckPin} />
            <Stack.Screen name="FiatTransactions" component={FiatMainTransactions} />
            <Stack.Screen name="CashOut" component={CashOut} />
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    );
  }
}

export default App;