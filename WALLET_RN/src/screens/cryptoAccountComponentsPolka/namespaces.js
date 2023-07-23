export const namespaces = {
  polkadot: {
    methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
    chains: [
      'polkadot:91b171bb158e2d3848fa23a9f1c25182', // Polkadot
      'polkadot:fc41b9bd8ef8fe53d58c7ea67c794c7e', // Acala
      'polkadot:9eb76c5184c4ab8679d2d5d819fdf90b', // Astar 
      'polkadot:262e1b2ad728475fd6fe88e62d34c200', // Bifrost
      'polkadot:3cc73806aa66ef26e3ac31109e6bd17d', // Darwinia (Maybe)
      'polkadot:e61a41c53f5dcd0beb09df93b34402aa', // Parallel
      'polkadot:1bb969d85965e4bb5a651abbedf21a54', // Phala
      'polkadot:68d56f15f85d3136970ec16946040bc1', // Statemint
    ],
    events: ['chainChanged", "accountsChanged']
  }
};
