export type Option<T> = T | null

// Potentially should use MultiLocation
export type Chain = string

export interface IBridgePair {
  token0: IToken
  token1: IToken

  /*********** Methods declaration**********/
  // Return bridge capacity of the given token0
  getToken0Capcity: () => Option<string>
  // Return bridge capacity of the given token1
  getToken1Capcity: () => Option<string>
}

export interface IBridge {
  // Source chain
  chain0: Chain
  // Corresponding dest chain
  chain1: Chain
  // Crosschain assets pair list
  pairs: IBridgePair[]

  /*********** Methods declaration**********/
  // Add an crosschain asset pair
  addBridgePair: (pair: IBridgePair) => void
  // Return corresponding bridged asset for a given asset
  getBridgedAsset: (token: IToken) => Option<[Chain, IToken]>
}

export abstract class DexExtension {
  abstract fetchPairCount(): Promise<number>
  abstract fetchPairs(): Promise<IPair[]>
  abstract fetchLimitedPairs(limit: number): Promise<IPair[]>
  abstract fetchRangePairs(from: number, to: number): Promise<IPair[]>
}

export interface IDex {
  // Name of the DEX
  name: string
  // The chain that DEX deployed on
  chain: Chain
  // Factory contract address or a location(e.g. Pallet location on Polkadot ecosystem),
  // should be used as the only indentification of a Dex
  factory: string
  // Trading pair list
  pairs: IPair[]

  /*********** Methods declaration**********/
  // Return trading pair list that including the specific token
  getTokenPairs: (token: IToken) => IPair[]
  // Return whole token pair list
  getPairs: () => IPair[]
}

export interface IPair {
  // Address or other representation of a trading pair, should be the only indentification of the pair
  id: string
  // Base trading token
  token0: IToken
  // Quote trading token
  token1: IToken
  // Liquidity(balance of pair address) of base trading token
  reserve0: string
  // Liquidity(balance of pair address) of quote trading token
  reserve1: string
  // Price of token0 represented by USD
  token0Price: string
  // Price of token1 represented by USD
  token1Price: string
  // Capacity of token0, represented by USD
  capcity0: Option<string>
  // Capacity of token1, represented by USD
  capcity1: Option<string>
  // Potential swap fee
  swapFee: Option<string>
  // Potential Dev fee
  devFee: Option<string>

  /*********** Methods declaration**********/
  // Flip the whole trading pair
  flip(): IPair
  // Perspectively return reserve of trading tokens0, and token1
  getReserves: () => [string, string]
  // Fetch latest reserve data from indexer or blockchain, and return it
  updateReserves: () => [string, string]
  // Perspectively return token prices represented by USD, dynamic fetch&calculate from blockchain or other 3rd parties
  getPrices: () => [Option<string>, Option<string>]
  // Return total fee paid according to current trading status, dynamic fetch&calculate from blockchain
  getFee: (token: IToken) => Option<string>
  // Perspectively return capcity of token0 and token1, dynamic fetch&calculate from blockchain or other 3rd parties
  getCapcities: () => [Option<string>, Option<string>]
}

export interface IToken {
  // Address or a location of the token, should be the only indentification of the asset
  id: string
  // Name of the asset
  name: string
  // Symbol of the asset
  symbol: string
  // Decimals of the asset
  decimals: number
}
