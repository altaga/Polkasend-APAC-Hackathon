/**
 * @format
 */
import "react-native-get-random-values";
import "@ethersproject/shims";
import '@walletconnect/react-native-compat';
import './shim.js';

import { AppRegistry, LogBox } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App.js';

LogBox.ignoreLogs(['Require cycle:', "The provided value 'ms-stream' is not a valid 'responseType'.","The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'." ]);

AppRegistry.registerComponent(appName, () => App);
