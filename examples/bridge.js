const {Bridge, BridgePair} = require('../dist/index.js')

/********* Test ouput ********/
// Capacity PHA on this bridge: 10000
// Capacity kPHA on this bridge: 20000
// Bridge asset of PHA: [
//   "Phala",
//   {
//     "id": "MultiLocation {parents: 1, interiors: X1(Parachain(2004))}",
//     "name": "Khala Token",
//     "symbol": "kPHA",
//     "decimals": 12
//   }
// ]
// Bridge asset of kPHA: [
//   "Ethereum",
//   {
//     "id": "0xe887376a93bda91ed66d814528d7aeefe59990a5",
//     "name": "Phala Token",
//     "symbol": "PHA",
//     "decimals": 18
//   }
// ]

async function main() {
  let bridge = new Bridge('Ethereum', 'Phala')
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
