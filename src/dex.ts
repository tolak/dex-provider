import {gql, GraphQLClient} from 'graphql-request'
import {Decimal} from 'decimal.js'
import {sha256} from '@ethersproject/solidity'
import {
  DexJSON,
  PairJSON,
  IChain,
  IPair,
  IDex,
  IToken,
  Option,
  DexExtension,
} from './types'
import {Pair} from './pair'

export class UniswapV2Extension extends DexExtension {
  indexer: GraphQLClient
  chain: IChain

  constructor(chain: IChain, endpoint: string) {
    super()

    this.chain = chain
    this.indexer = new GraphQLClient(endpoint, {
      timeout: 300000,
    })
  }

  fetchPairCount(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.indexer
        .request(
          gql`
            {
              uniswapFactories {
                pairCount
              }
            }
          `
        )
        .then((data) => {
          if (data.uniswapFactories?.length > 0) {
            resolve(data.uniswapFactories[0].pairCount)
          } else {
            reject(new Error('Unknow error'))
          }
        })
        .catch((e) => {
          reject(
            new Error(
              'Error getting uniswapFactories from blockchain: ' +
                JSON.stringify(e)
            )
          )
        })
    })
  }

  fetchSinglePair(id: string): Promise<Option<IPair>> {
    return new Promise<Option<IPair>>((resolve, reject) => {
      this.indexer
        .request(
          gql`
            {
              pairs(where: {id: id}) {
                id
                token0 {
                  id
                  name
                  symbol
                  decimals
                }
                token1 {
                  id
                  name
                  symbol
                  decimals
                }
                reserve0
                reserve1
                token0Price
                token1Price
                volumeUSD
              }
            }
          `
        )
        .then((data) => {
          if (data.pairs?.length > 0) {
            const raw = data.pairs[0]
            resolve(
              new Pair(
                raw.id,
                raw.token0,
                raw.token1,
                raw.reserve0,
                raw.reserve1,
                raw.token0Price,
                raw.token1Price,
                raw.volumeUSD,
                null,
                null,
                null,
                null
              )
            )
          } else {
            resolve(null)
          }
        })
        .catch((e) => {
          reject(
            new Error(
              'Error getting pairs from blockchain: ' + JSON.stringify(e)
            )
          )
        })
    })
  }

  fetchLimitedPairs(limit: number): Promise<IPair[]> {
    return new Promise<IPair[]>((resolve, reject) => {
      this.indexer
        .request(
          gql`
                {
                    pairs (first: ${limit}, orderBy: volumeUSD, orderDirection: desc) {
                        id
                        token0 {
                            id
                            name
                            symbol
                            decimals
                        }
                        token1 {
                            id
                            name
                            symbol
                            decimals
                        }
                        reserve0
                        reserve1
                        token0Price
                        token1Price
                        volumeUSD
                    }
                }
                `
        )
        .then((data) => {
          if (data.pairs?.length > 0) {
            const pairs = data.pairs.map((raw: any) => {
              return new Pair(
                raw.id,
                raw.token0,
                raw.token1,
                raw.reserve0,
                raw.reserve1,
                raw.token0Price,
                raw.token1Price,
                raw.volumeUSD,
                null,
                null,
                null,
                null
              )
            })
            resolve(pairs)
          } else {
            resolve([])
          }
        })
        .catch((e) => {
          reject(
            new Error(
              'Error getting pairs from blockchain: ' + JSON.stringify(e)
            )
          )
        })
    })
  }

  // Fetch pairs according to creating block number range
  fetchRangePairs(from: number, to: number): Promise<IPair[]> {
    return new Promise<IPair[]>((resolve, reject) => {
      this.indexer
        .request(
          gql`
                  {
                      pairs (orderBy: createdAtBlockNumber, orderDirection: asc, where: {createdAtBlockNumber_gte: ${Number(
                        from
                      )}, createdAtBlockNumber_lt: ${Number(to)}}) {
                          id
                          token0 {
                              id
                              name
                              symbol
                              decimals
                          }
                          token1 {
                              id
                              name
                              symbol
                              decimals
                          }
                          reserve0
                          reserve1
                          token0Price
                          token1Price
                          volumeUSD
                      }
                  }
                  `
        )
        .then((data) => {
          if (data.pairs?.length > 0) {
            const pairs = data.pairs.map((raw: any) => {
              return new Pair(
                raw.id,
                raw.token0,
                raw.token1,
                raw.reserve0,
                raw.reserve1,
                raw.token0Price,
                raw.token1Price,
                raw.volumeUSD,
                null,
                null,
                null,
                null
              )
            })
            resolve(pairs)
          } else {
            resolve([])
          }
        })
        .catch((e) => {
          reject(
            new Error(
              'Error getting pairs from blockchain: ' + JSON.stringify(e)
            )
          )
        })
    })
  }
}

export class Dex<Ex extends DexExtension> implements IDex {
  name: string
  chain: IChain
  factory: string
  pairs: IPair[]
  pairCount: number
  ex: Ex
  // Mapping string of concat(token0.id, token1.id) to pair address
  ids: Map<string, string>

  constructor(name: string, chain: IChain, factory: string, ex: Ex) {
    this.name = name
    this.chain = chain
    this.factory = factory
    this.pairs = []
    this.pairCount = 0
    this.ex = ex
    this.ids = new Map<string, string>()
  }

  // Generate key of `ids` map according to given pair token address/indentity
  generateIdKey(token0: string, token1: string): string {
    const concatId: string =
      token0.toLowerCase() < token1.toLowerCase()
        ? token0 + token1
        : token1 + token0

    return sha256(['string'], [concatId])
  }

  // Return promise with pair count
  async initialize(): Promise<number> {
    this.pairCount = await this.ex.fetchPairCount()
    console.info(
      `Got ${this.pairCount} trading pairs from ${this.name}, start fetching top 1000 volume USD of them...`
    )

    const pairs = await this.ex.fetchLimitedPairs(1000)
    pairs.map((pair) => {
      const key = this.generateIdKey(pair.token0.id, pair.token1.id)
      this.ids.set(key, pair.id)
    })
    this.pairs = pairs
    console.info(`Got ${this.pairs.length} pairs from indexer`)
    return Promise.resolve(this.pairs.length)
  }

  getTokenPairs(token: IToken): IPair[] {
    const pairs: IPair[] = []
    for (let i = 0; i < this.pairs.length; i++) {
      if (token.id.toLowerCase() === this.pairs[i].token0.id) {
        pairs.push(this.pairs[i])
        continue
      }
      if (token.id.toLowerCase() === this.pairs[i].token1.id.toLowerCase()) {
        // Revert pair
        pairs.push(this.pairs[i].flip())
        continue
      }
    }
    return pairs
  }

  getPair(token0: IToken, token1: IToken): Option<IPair> {
    const id = this.ids.get(this.generateIdKey(token0.id, token1.id))
    if (id !== undefined) {
      for (let i = 0; i < this.pairs.length; i++) {
        if (id.toLowerCase() === this.pairs[i].id.toLowerCase()) {
          return token0.id.toLowerCase() ===
            this.pairs[i].token0.id.toLowerCase()
            ? this.pairs[i]
            : this.pairs[i].flip()
        }
      }
      // Shouldn't be here
      return null
    } else {
      console.debug(
        `Tring to get pair of token[${token0.name}-${token1.name}], but not found`
      )
      return null
    }
  }

  getPairs(): IPair[] {
    return this.pairs
  }

  getCapcities(pair: IPair): Option<string> {
    let chainNativeWrap: IToken
    let chainUSDT: IToken
    if (this.chain.nativeWrap === null || this.chain.usdt === null) return null
    else {
      chainNativeWrap = this.chain.nativeWrap
      chainUSDT = this.chain.usdt
    }

    const nativeWrapUSDTPair = this.getPair(chainNativeWrap, chainUSDT)
    if (nativeWrapUSDTPair === null) {
      return null
    }

    let cap: Option<string> = null
    // Calculate capacity of pair
    if (pair.token0.id.toLowerCase() === chainNativeWrap.id.toLowerCase()) {
      cap = new Decimal(nativeWrapUSDTPair.token1Price)
        .mul(new Decimal(pair.reserve0))
        .toFixed(6)
    } else if (
      pair.token1.id.toLowerCase() === chainNativeWrap.id.toLowerCase()
    ) {
      cap = new Decimal(nativeWrapUSDTPair.token1Price)
        .mul(new Decimal(pair.reserve1))
        .toFixed(6)
    } else if (pair.token0.id.toLowerCase() === chainUSDT.id.toLowerCase()) {
      cap = new Decimal(pair.reserve0).toFixed(6)
    } else if (pair.token1.id.toLowerCase() === chainUSDT.id.toLowerCase()) {
      cap = new Decimal(pair.reserve1).toFixed(6)
    } else {
      const token0NativewrapPair = this.getPair(pair.token0, chainNativeWrap)
      if (token0NativewrapPair !== null) {
        cap = new Decimal(token0NativewrapPair.token1Price)
          .mul(new Decimal(nativeWrapUSDTPair.token1Price))
          .mul(new Decimal(pair.reserve0))
          .toFixed(6)
      }
    }
    return cap
  }

  toJSON(): DexJSON {
    const pairs: PairJSON[] = []
    for (const pair of this.pairs) {
      pairs.push({
        token0: pair.token0.symbol,
        token0Id: pair.token0.id,
        token1: pair.token1.symbol,
        token1Id: pair.token1.id,
        cap: Number(this.getCapcities(pair)),
        rate: Number(pair.token1Price),
        dex: this.name,
      })
    }

    return {
      chain: this.name,
      pairs: pairs,
    }
  }
}
