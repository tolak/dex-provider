export type Option<T> = T | null

// Potentially should use MultiLocation
export interface IChain {
  name: string
  nativeWrap: Option<IToken>
  stableCoin: Option<IToken>

  latestBlock: () => Promise<number>
}

export interface IBridgePair {
  token0: IToken
  token1: IToken

  /*********** Methods declaration**********/
  id(): string
  // Return bridge capacity of the given token0
  getToken0Capcity: () => Option<string>
  // Return bridge capacity of the given token1
  getToken1Capcity: () => Option<string>
}

export interface BridgeJSON {
  chain0: string
  chain1: string
  tokens: string[]
}

export interface IBridge {
  // Source chain
  chain0: IChain
  // Corresponding dest chain
  chain1: IChain
  // Crosschain assets pair list
  pairs: IBridgePair[]

  /*********** Methods declaration**********/
  // Add an crosschain asset pair
  addBridgePair: (pair: IBridgePair) => void
  // Return corresponding bridged asset for a given asset
  getBridgedAsset: (token: IToken) => Option<[IChain, IToken]>
  // Return all infomation as a JSON object
  toJSON(): BridgeJSON
}

export abstract class DexExtension {
  abstract fetchPairCount(): Promise<number>
  abstract fetchSinglePair(id: string): Promise<Option<IPair>>
  abstract fetchLimitedPairs(limit: number): Promise<IPair[]>
  abstract fetchRangePairs(from: number, to: number): Promise<IPair[]>
}

export interface PairJSON {
  // token0 symbol
  token0: string
  // token0 reserve on this trading pair
  reserve0: number
  // token0 address or other type of indentity
  token0Id: string
  // token1 symbol
  token1: string
  // token1 reserve on this trading pair
  reserve1: number
  // token1 address or other type of indentity
  token1Id: string
  // Capcity of the pair in the DEX
  cap: number
  // Trading rate calculated based on result of (reserve1/reserve0)
  rate: number
  // DEX name that pair inside
  dex: string
}

export interface DexJSON {
  chain: string
  pairs: PairJSON[]
}

export interface IDex {
  // Name of the DEX
  name: string
  // The chain that DEX deployed on
  chain: IChain
  // Factory contract address or a location(e.g. Pallet location on Polkadot ecosystem),
  // should be used as the only indentification of a Dex
  factory: string
  // Trading pair mapping<pairId, Pair>
  pairs: Map<string, IPair>

  /*********** Methods declaration**********/
  // Return trading pair list that including the specific token
  getTokenPairs: (token: IToken) => IPair[]
  // Return trading pair by given token pair, return pair according to given sequence
  getPair(token0: IToken, token1: IToken): Option<IPair>
  // Return whole token pair list
  getPairs: () => IPair[]
  // Perspectively return capcity of the pair, calculated from local cache
  getCapcities: (pair: IPair) => Option<string>
  // Return all infomation as a JSON object
  toJSON(): DexJSON
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
  // Total volume USD
  volumeUSD: Option<string>
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
  // Perspectively return token prices represented by another asset, not USD
  getPrices: () => [Option<string>, Option<string>]
  // Return total fee paid according to current trading status, dynamic fetch&calculate from blockchain
  getFee: (token: IToken) => Option<string>
  // Return trading rate of token0
  getRate0: () => string
  // Return trading rate of token1
  getRate1: () => string
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
