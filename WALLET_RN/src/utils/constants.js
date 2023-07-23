import acala from "./tokenLogos/acala.png"
import astar from "./tokenLogos/astar.png"
import ausd from "./tokenLogos/ausd.png"
import bnc from "./tokenLogos/bnc.png"
import dot from "./tokenLogos/dot.png"
import glmr from "./tokenLogos/glmr.png"
import ibtc from "./tokenLogos/ibtc.png"
import intr from "./tokenLogos/intr.png"
import para from "./tokenLogos/para.png"
import pha from "./tokenLogos/pha.png"
import ring from "./tokenLogos/ring.png"
import usdt from "./tokenLogos/usdt.png"

export const rpcs = {
    ACA: {
        symbol: "ACA",
        icon:acala,
        gecko: "acala",
        contract: "0xffffFFffa922Fef94566104a6e5A35a4fCDDAA9f",
        key: 'Acala',
        name: 'Acala',
        ws: 'wss://acala-rpc-0.aca-api.network',
        weight: 1000000000,
        parachainId: 2000,
        moonAssetId: 0,
        ss58Format: 10,
        genesisHash: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c'
    },
    ASTR: {
        symbol: "ASTR",
        icon:astar,
        gecko: "acestarter",
        contract: "0xFfFFFfffA893AD19e540E172C10d78D4d479B5Cf",
        key: 'Astar',
        name: 'Astar',
        ws: 'wss://rpc.astar.network',
        weight: 1000000000,
        parachainId: 2006,
        moonAssetId: 18446744073709551619n,
        palletInstance: 10,
        ss58Format: 5,
        genesisHash: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6'
    },
    AUSD: {
        symbol: "AUSD",
        icon:ausd,
        gecko: "acala-dollar",
        contract: "0xfFfFFFFF52C56A9257bB97f4B2b6F7B2D624ecda",
        key: 'Acala',
        name: 'Acala',
        ws: 'wss://acala-rpc-0.aca-api.network',
        weight: 1000000000,
        parachainId: 2000,
        moonAssetId: 0,
        ss58Format: 10,
        genesisHash: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c'
    },
    BNC: {
        symbol: "BNC",
        icon:bnc,
        gecko: "bifrost-native-coin",
        contract: "0xFFffffFf7cC06abdF7201b350A1265c62C8601d2",
        key: 'BifrostPolkadot',
        name: 'Bifrost',
        ws: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
        weight: 1000000000,
        parachainId: 2030,
        moonAssetId: 1,
        ss58Format: 6,
        genesisHash: '0x262e1b2ad728475fd6fe88e62d34c200abe6fd693931ddad144059b1eb884e5b'
    },
    DOT: {
        symbol: "DOT",
        icon:dot,
        gecko: "polkadot",
        contract: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
        key: 'Polkadot',
        name: 'Polkadot',
        ws: 'wss://rpc.polkadot.io',
        weight: 1000000000,
        parachainId: 0,
        ss58Format: 42,
        genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
    },
    GLMR: {
        symbol: "GLMR",
        icon:glmr,
        gecko: "moonbeam",
        name: 'Moonbeam',
        rpc: `https://moonbeam-mainnet.gateway.pokt.network/v1/lb/${process.env.REACT_APP_POCKET_API}`,
        chainId: 1284, // 0x504 in hex,
    },
    IBTC: {
        symbol: "IBTC",
        icon:ibtc,
        gecko: "interbtc",
        contract: "0xFFFFFfFf5AC1f9A51A93F5C527385edF7Fe98A52",
        key: 'Interlay',
        name: 'Interlay',
        ws: 'wss://interlay.api.onfinality.io/public-ws',
        weight: 1000000000,
        parachainId: 2032,
        ss58Format: 2032,
        genesisHash: '0xbf88efe70e9e0e916416e8bed61f2b45717f517d7f3523e33c7b001e5ffcbc72'
    },
    INTR: {
        symbol: "INTR",
        icon:intr,
        gecko: "interlay",
        contract: "0xFffFFFFF4C1cbCd97597339702436d4F18a375Ab",
        key: 'Interlay',
        name: 'Interlay',
        ws: 'wss://interlay.api.onfinality.io/public-ws',
        weight: 1000000000,
        parachainId: 2032,
        ss58Format: 2032,
        genesisHash: '0xbf88efe70e9e0e916416e8bed61f2b45717f517d7f3523e33c7b001e5ffcbc72'
    },
    PARA: {
        symbol: "PARA",
        icon:para,
        gecko: "parallel-finance",
        contract: "0xFfFffFFF18898CB5Fe1E88E668152B4f4052A947",
        key: 'Parallel',
        name: 'Parallel',
        ws: 'wss://rpc.parallel.fi',
        weight: 1000000000,
        parachainId: 2012,
        moonAssetId: 114,
        ss58Format: 172,
        genesisHash: '0xe61a41c53f5dcd0beb09df93b34402aada44cb05117b71059cce40a2723a4e97'
    },
    PHA: {
        symbol: "PHA",
        icon:pha,
        gecko: "pha",
        contract: "0xFFFfFfFf63d24eCc8eB8a7b5D0803e900F7b6cED",
        key: 'Phala',
        name: 'Phala',
        ws: 'wss://api.phala.network/ws',
        weight: 1000000000,
        parachainId: 2035,
        moonAssetId: 1,
        ss58Format: 30,
        genesisHash: '0x1bb969d85965e4bb5a651abbedf21a54b6b31a21f66b5401cc3f1e286268d736'
    },
    RING: {
        symbol: "RING",
        icon:ring,
        gecko: "ring",
        contract: "0xFfffFfff5e90e365eDcA87fB4c8306Df1E91464f",
        key: 'Darwinia',
        name: 'Darwinia',
        ws: 'wss://parachain-rpc.darwinia.network',
        weight: 1000000000,
        parachainId: 2046,
        ss58Format: 18,
        genesisHash: '0xe71578b37a7c799b0ab4ee87ffa6f059a6b98f71f06fb8c84a8d88013a548ad6'
    },
    USDT: {
        symbol: "USDT",
        icon:usdt,
        gecko: "tether",
        contract: "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d",
        key: 'Statemint',
        name: 'Statemint',
        ws: 'wss://statemint-rpc.polkadot.io',
        weight: 1000000000,
        parachainId: 1000,
        palletInstance: 50,
        ss58Format: 42,
        genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f'
    }
}