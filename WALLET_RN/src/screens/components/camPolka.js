import React, {Component} from 'react';
import reactAutobind from 'react-autobind';
import {Camera} from 'react-native-camera-kit';

class Cam extends Component {
  constructor(props) {
    super(props);
    reactAutobind(this);
    this.flag = true;
  }

  componentDidUpdate(prevProps){
    const reset = this.props.reset
    const prevReset = prevProps.reset
    if(reset === true && reset !== prevReset)
    {
      this.flag = true
    }
  }

  render() {
    return (
      <Camera
        style={{height: '100%', width: '100%'}}
        scanBarcode={this.props.scanFlag}
        onReadCode={event => {
          if (!this.flag) return;
          this.flag = false;
          let temp = event.nativeEvent.codeStringValue;
          if (temp.length === 47 || temp.length === 48 || temp.indexOf('wc:') > -1) {
            if (temp.length === 47 || temp.length === 48) this.props.callbackAddress(temp);
            if (temp.indexOf('wc:') > -1) this.props.callbackWC(temp);
          } else {
            this.flag = true;
          }
        }}
        showFrame={false}
      />
    );
  }
}

export default Cam;
