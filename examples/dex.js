const {Dex, UniswapV2Extension} = require('../dist/index.js')

/********* Test ouput ********/

async function main() {
  // Create Uniswrap instance
  let uniSwap = new Dex(
    'UniSwapV2',
    'Ethereum',
    '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    new UniswapV2Extension(
      'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
    )
  )
  await uniSwap.initialize()
  console.log(
    `Pairs on UniswapV2: ${JSON.stringify(uniSwap.getPairs(), null, 2)}`
  )
  console.log(
    `Pairs on UniswapV2 contain USDT: ${JSON.stringify(
      uniSwap.getTokenPairs({
        id: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
      }),
      null,
      2
    )}`
  )

  // Create StellaSwap instance
  let stellaSwap = new Dex(
    'StellaSwap',
    'Moonbeam',
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
    'Moonbeam',
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
