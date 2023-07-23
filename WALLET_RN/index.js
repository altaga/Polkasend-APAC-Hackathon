/**
 * @format
 */

 import "react-native-get-random-values"
 import '@walletconnect/react-native-compat';
 import "@ethersproject/shims"
 import './shim.js'
 import { AppRegistry } from 'react-native';
 import App from './src/App';
 import { name as appName } from './app.json';
 import { LogBox } from 'react-native';

  // Debug Avoid Require Cycle 

 LogBox.ignoreLogs(['Require cycle:', "The provided value 'ms-stream' is not a valid 'responseType'.","The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'.", "REGISTRY:","API/INIT:"]);
 //LogBox.ignoreAllLogs(true)
 
 AppRegistry.registerComponent(appName, () => App);