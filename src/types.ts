export type Option<T> = T | null

// Potentially should use MultiLocation
export type Chain = string

export interface Dex {
  // Name of the DEX
  name: string
  // The chain that DEX deployed on
  chain: Chain
  // Factory contract address or a location(e.g. Pallet location on Polkadot ecosystem),
  // should be used as the only indentification of a Dex
  factory: string
  // GraphQL indexer api
  indexer: Option<string>
  // Trading pair list
  pairs: Pair[]

  /*********** Methods declaration**********/
  // Return trading pair list that including the specific token
  getTokenPairs: (token: string) => Pair[]
}

export interface Pair {
  // Address or other representation of a trading pair, should be the only indentification of the pair
  id: string
  // Base trading token
  token0: Token
  // Quote trading token
  token1: Token
  // Liquidity(balance of pair address) of base trading token
  reserve0: string
  // Liquidity(balance of pair address) of quote trading token
  reserve1: string
  // Capacity of token0, represented by USD
  capcity0: string
  // Capacity of token1, represented by USD
  capcity1: string
  // Potential swap fee
  swapFee: Option<string>
  // Potential Dev fee
  devFee: Option<string>

  /*********** Methods declaration**********/
  // Perspectively return reserve of trading tokens0, and token1
  getReserves: () => [string, string]
  // Fetch latest reserve data from indexer or blockchain, and return it
  updateReserves: () => [string, string]
  // Perspectively return token prices represented by USD, dynamic fetch&calculate from blockchain
  getPrices: () => [string, string]
  // Return total fee paid according to current trading status, dynamic fetch&calculate from blockchain
  getFee: (token: Token) => string
}

export interface Token {
  // Address or a location of the token, should be the only indentification of the asset
  id: string
  // Name of the asset
  name: string
  // Symbol of the asset
  symbol: string
  // Decimals of the asset
  decimals: number
}
