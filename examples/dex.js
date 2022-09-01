const {Dex, UniswapV2Extension} = require('../dist/index.js')

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

  const Moonbeam = {
    name: 'Moonbeam',
    nativeWrap: {
      id: '0xacc15dc74880c9944775448304b263d191c6077f',
      name: 'Wrapped GLMR',
      symbol: 'WGLMR',
      decimals: 18,
    },
    usdt: {
      id: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
    },
    usdc: {
      id: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
  }

  // Create Uniswrap instance
  let uniSwap = new Dex(
    'UniSwapV2',
    Ethereum,
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    new UniswapV2Extension(
      'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    )
  )
  await uniSwap.initialize()
  console.log(
    `Pairs on UniswapV2: ${JSON.stringify(uniSwap.getPairs(), null, 2)}`
  )

  let usdtPairs = uniSwap.getTokenPairs({
    id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
  })
  console.log(
    `Pairs on UniswapV2 contain USDT: ${JSON.stringify(usdtPairs, null, 2)}`
  )
  if (usdtPairs.length > 0) {
    console.log(
      `Capacity of first usdt pair: ${JSON.stringify(
        usdtPairs[0],
        null,
        2
      )}, result is: ${uniSwap.getCapcities(usdtPairs[0])}`
    )
  }

  // Create StellaSwap instance
  let stellaSwap = new Dex(
    'StellaSwap',
    Moonbeam'
    '0x68A384D826D3678f78BB9FB1533c7E9577dACc0E',
    new UniswapV2Extension(
      'https://api.thegraph.com/subgraphs/name/stellaswap/stella-swap'
    )
  )
  await stellaSwap.initialize()
  console.log(
    `Pairs on StellaSwap: ${JSON.stringify(stellaSwap.getPairs(), null, 2)}`
  )
  console.log(
    `Pairs on StellaSwap contain USDT: ${JSON.stringify(
      stellaSwap.getTokenPairs({
        id: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
      }),
      null,
      2
    )}`
  )

  // Create BeamSwap instance
  let beamSwap = new Dex(
    'BeamSwap',
    Moonbeam,
    '0x985bca32293a7a496300a48081947321177a86fd',
    new UniswapV2Extension(
      'https://api.thegraph.com/subgraphs/name/beamswap/beamswap-dex'
    )
  )
  await beamSwap.initialize()
  console.log(
    `Pairs on BeamSwap: ${JSON.stringify(beamSwap.getPairs(), null, 2)}`
  )
  console.log(
    `Pairs on BeamSwap contain USDT: ${JSON.stringify(
      beamSwap.getTokenPairs({
        id: '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
      }),
      null,
      2
    )}`
  )
}

main()
  .catch(console.error)
  .finally(() => process.exit())
