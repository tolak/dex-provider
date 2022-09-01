const {Bridge, BridgePair} = require('../dist/index.js')

async function main() {
  const Ethereum = {
    name: 'Ethereum',
    nativeWrap: {
      id: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
    usdt: {
      id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
    },
    usdc: {
      id: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  }

  const Phala = {
    name: 'Phala',
    nativeWrap: null,
    usdt: null,
    usdc: null,
  }

  let bridge = new Bridge(Ethereum, Phala)
  let bridgePair = new BridgePair(
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
  bridge.addBridgePair(bridgePair)

  console.log(`Capacity PHA on this bridge: ${bridgePair.getToken0Capcity()}`)
  console.log(`Capacity kPHA on this bridge: ${bridgePair.getToken1Capcity()}`)

  console.log(
    `Bridge asset of PHA: ${JSON.stringify(
      bridge.getBridgedAsset(bridgePair.token0),
      null,
      2
    )}`
  )
  console.log(
    `Bridge asset of kPHA: ${JSON.stringify(
      bridge.getBridgedAsset(bridgePair.token1),
      null,
      2
    )}`
  )
}

main()
  .catch(console.error)
  .finally(() => process.exit())
