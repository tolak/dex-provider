const {
  Bridge,
  BridgePair,
  EvmChain,
  SubstrateChain,
} = require('../dist/index.js')

async function main() {
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
    },
    {
      id: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    }
  )

  const Phala = new SubstrateChain(
    'Phala',
    'wss://api.phala.network/ws',
    null,
    null,
    null
  )

  let bridge = new Bridge(Ethereum, Phala)
  let bridgePair0 = new BridgePair(
    {
      id: '0xe887376a93bda91ed66d814528d7aeefe59990a5',
      name: 'Phala Token',
      symbol: 'PHA',
      decimals: 18,
    },
    {
      id: 'MultiLocation {parents: 1, interiors: X1(Parachain(2004))}',
      name: 'Khala Token',
      symbol: 'kPHA',
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
      id: 'MultiLocation {parents: 1, interiors: X3(Parachain(2004), GeneralKey(cb), GeneralKey(0xdac17f958d2ee523a2206206994597c13d831ec7))}',
      name: 'Tether USDT',
      symbol: 'cbUSDT',
      decimals: 6,
    }
  )
  bridge.addBridgePair(bridgePair1)

  console.log(`Capacity PHA on this bridge: ${bridgePair0.getToken0Capcity()}`)
  console.log(`Capacity kPHA on this bridge: ${bridgePair0.getToken1Capcity()}`)

  console.log(
    `Bridge asset of PHA: ${JSON.stringify(
      bridge.getBridgedAsset(bridgePair0.token0),
      null,
      2
    )}`
  )
  console.log(
    `Bridge asset of kPHA: ${JSON.stringify(
      bridge.getBridgedAsset(bridgePair0.token1),
      null,
      2
    )}`
  )

  console.log(
    `Dump bridge to json: ${JSON.stringify(bridge.toJSON(), null, 2)}`
  )
}

main()
  .catch(console.error)
  .finally(() => process.exit())
