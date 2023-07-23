export const namespaces = {
  eip155: {
    methods: ["eth_sendTransaction", "eth_signTransaction", "eth_sign", "personal_sign", "eth_signTypedData"],
    chains: ['eip155:1:0x59b0428573A5115FBC65E237bF8b9800dA21EBCc'],
    events: ['chainChanged', 'accountsChanged']
  },
};
