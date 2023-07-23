// Basic Imports
import React from "react";
import reactAutobind from "react-autobind";

const ContextModule = React.createContext();

// Context Provider Component

class ContextProvider extends React.Component {
  // define all the values you want to use in the context
  constructor(props) {
    super(props);
    this.state = {
      value: {
        // Crypto
        account: "",
        polkaAccount: "",
        ethBalance: 0,
        tokenBalances: {},
        ethUSD: 0,
        tokenUSD: {},
        // Polka
        tokenPolkaBalances: {
          ACA: 0,
          ASTR: 0,
          BNC: 0,
          DOT: 0,
          IBTC: 0,
          INTR: 0,
          PARA: 0,
          PHA: 0,
          RING: 0,
          USDT: 0,
          aUSD: 0,
        },
        tokenPolkaUSD: { // Seed Price 07/09/2023 // mm/dd/yyyy
          ACA: 0.072279,
          ASTR: 0.00264942,
          BNC: 0.188713,
          DOT: 5.01,
          IBTC: 31305,
          INTR: 0.01952513,
          PARA: 0.00646556,
          PHA: 0.105965,
          RING: 0.00000401,
          USDT: 0.998456,
          aUSD: 0.561073,
        },
        // Fiat
        ewallet: "ewallet_804007caaf988cd1eb25a7dc3f70ee9d",
        clabe: "032180000118359719",
        phone: "+52",
        fiatBalanceUSD: 0,
        fiatBalanceMXN: 0,
        // Others
        show: false,
        selected: 0,
      },
    };
    reactAutobind(this);
  }

  // Method to update manually the context state, this method isn't used in this example

  setValue = (value) => {
    this.setState({
      value: {
        ...this.state.value,
        ...value,
      },
    });
  };

  render() {
    const { children } = this.props;
    const { value } = this.state;
    // Fill this object with the methods you want to pass down to the context
    const { setValue } = this;

    return (
      <ContextModule.Provider
        // Provide all the methods and values defined above
        value={{
          value,
          setValue,
        }}
      >
        {children}
      </ContextModule.Provider>
    );
  }
}

// Dont Change anything below this line

export { ContextProvider };
export const ContextConsumer = ContextModule.Consumer;
export default ContextModule;
