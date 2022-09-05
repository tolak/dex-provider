const fs = require('fs')
const {
  Bridge,
  BridgePair,
  Dex,
  EvmChain,
  SubstrateChain,
  UniswapV2Extension,
} = require('../dist/index.js')

const engine = {
  dexs: [],
  bridges: [],
}

const Phala = new SubstrateChain(
  'Phala',
  'wss://api.phala.network/ws',
  null,
  null,
  null
)

const Ethereum = new EvmChain(
  'Ethereum',
  'https://mainnet.infura.io/v3/6d61e7957c1c489ea8141e947447405b',
  {
    id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
  }
)

const Moonbeam = new EvmChain(
  'Moonbeam',
  'https://rpc.api.moonbeam.network',
  {
    id: '0xacc15dc74880c9944775448304b263d191c6077f',
    name: 'Wrapped GLMR',
    symbol: 'WGLMR',
    decimals: 18,
  },
  {
    id: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  }
)

async function initializeBridges() {
  let bridge = new Bridge(Ethereum, Phala)
  let bridgePair0 = new BridgePair(
    {
      id: '0xe887376a93bda91ed66d814528d7aeefe59990a5',
      name: 'Phala Token',
      symbol: 'PHA',
      decimals: 18,
    },
    {
      id: 'MultiLocation {parents: 1, interiors: X1(Parachain(2035))}',
      name: 'Phala Token',
      symbol: 'PHA',
      decimals: 12,
    }
  )
  bridge.addBridgePair(bridgePair0)

  let bridgePair1 = new BridgePair(
    {
      id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      name: 'Tether USDT',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      id: 'MultiLocation {parents: 1, interiors: X3(Parachain(2035), GeneralKey(cb), GeneralKey(0xdac17f958d2ee523a2206206994597c13d831ec7))}',
      name: 'Tether USDT',
      symbol: 'cbUSDT',
      decimals: 6,
    }
  )
  bridge.addBridgePair(bridgePair1)
  engine.bridges.push(bridge)

  let bridge1 = new Bridge(Ethereum, Moonbeam)
  let bridge1Pair0 = new BridgePair(
    {
      id: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      id: '0x8f552a71efe5eefc207bf75485b356a0b3f01ec9',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    }
  )
  bridge1.addBridgePair(bridge1Pair0)
  engine.bridges.push(bridge1)
}

async function initializeDexs() {
  // Create Uniswrap instance
  let uniSwap = new Dex(
    'UniSwapV2',
    Ethereum,
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    new UniswapV2Extension(
      Ethereum,
      'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    )
  )
  await uniSwap.initialize()
  engine.dexs.push(uniSwap)

  // Create StellaSwap instance
  let stellaSwap = new Dex(
    'StellaSwap',
    Moonbeam,
    '0x68A384D826D3678f78BB9FB1533c7E9577dACc0E',
    new UniswapV2Extension(
      Moonbeam,
      'https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap'
    )
  )
  await stellaSwap.initialize()
  engine.dexs.push(stellaSwap)

  // Create BeamSwap instance
  let beamSwap = new Dex(
    'BeamSwap',
    Moonbeam,
    '0x985bca32293a7a496300a48081947321177a86fd',
    new UniswapV2Extension(
      Moonbeam,
      'https://api.thegraph.com/subgraphs/name/beamswap/beamswap-dex'
    )
  )
  await beamSwap.initialize()
  engine.dexs.push(beamSwap)
}

async function main() {
  console.log(`Start initialize all bridges...`)
  await initializeBridges()
  console.log(`Bridges initialized`)
  console.log(`Start initialize all dex...`)
  await initializeDexs()
  console.log(`✅ DEXs initialized`)

  // Now we got a swap engine ready
  let graph = {
    chains: [],
    bridges: [],
  }

  let ethereumPairs = {
    name: 'Ethereum',
    pairs: [],
  }
  let moonbeamPairs = {
    name: 'Moonbeam',
    pairs: [],
  }

  // Travel all DEX pairs
  console.log(`Start traveling all pairs...`)
  for (let dex of engine.dexs) {
    // Loopup Ethereum pairs
    if (dex.chain.name === 'Ethereum') {
      ethereumPairs.pairs = ethereumPairs.pairs.concat(dex.toJSON().pairs)
    }
    // Lookup Moonbeam pairs
    if (dex.chain.name === 'Moonbeam') {
      moonbeamPairs.pairs = moonbeamPairs.pairs.concat(dex.toJSON().pairs)
    }
  }
  graph.chains.push(ethereumPairs)
  graph.chains.push(moonbeamPairs)
  console.log(`✅ All pairs collected`)

  // Travel all bridges
  console.log(`Start traveling all bridges...`)
  for (let bridge of engine.bridges) {
    graph.bridges.push(bridge.toJSON())
  }
  console.log(`✅ All bridges collected`)

  // Dump to filesystem
  let fileName = 'graph.json'
  console.info(`Writing engine informatioin to ${fileName}`)
  fs.writeFileSync(fileName, JSON.stringify(graph, null, 2), {
    encoding: 'utf8',
    flag: 'w',
  })
  console.info(`✅ JSON file created`)
}

main()
  .catch(console.error)
  .finally(() => process.exit())
