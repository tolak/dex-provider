import {gql, GraphQLClient} from 'graphql-request'
import {Decimal} from 'decimal.js'
import {Chain, IPair, IDex, IToken, Option, DexExtension} from './types'
import {Pair} from './pair'

export class UniswapV2Extension extends DexExtension {
  indexer: GraphQLClient

  constructor(endpoint: string) {
    super()

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

  fetchPairs(): Promise<IPair[]> {
    return new Promise<IPair[]>((resolve, reject) => {
      reject(new Error('Unimplemented'))
    })
  }

  fetchLimitedPairs(limit: number): Promise<IPair[]> {
    return new Promise<IPair[]>((resolve, reject) => {
      this.indexer
        .request(
          gql`
                {
                    pairs (first: ${limit}, orderBy: createdAtTimestamp, orderDirection: desc) {
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

  fetchRangePairs(from: number, to: number): Promise<IPair[]> {
    return new Promise<IPair[]>((resolve, reject) => {
      reject(new Error('Unimplemented'))
    })
  }
}

export class Dex<Ex extends DexExtension> implements IDex {
  name: string
  chain: Chain
  factory: string
  pairs: IPair[]
  pairCount: number
  ex: Ex

  constructor(name: string, chain: Chain, factory: string, ex: Ex) {
    this.name = name
    this.chain = chain
    this.factory = factory
    this.pairs = []
    this.pairCount = 0
    this.ex = ex
  }

  // Return promise with pair count
  initialize(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.ex
        .fetchPairCount()
        .then((count) => {
          this.pairCount = count
          console.info(
            `Got ${count} trading pairs from ${this.name}, start fetching them...`
          )
          // TODO: Instead of fetching whole trading pairs for one time, we divide it to several steps
          this.ex
            // Fetch first 100 trading paris
            .fetchLimitedPairs(200)
            .then((pairs) => {
              //   if (pairs.length === count) {
              this.pairs = pairs
              console.info(`Dex ${this.name} on ${this.chain} initialized`)
              resolve(count)
              //   } else {
              //     reject(new Error('Broken trading pairs'))
              //   }
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
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
    for (let i = 0; i < this.pairs.length; i++) {
      if (token0.id.toLowerCase() === this.pairs[i].token0.id.toLowerCase()) {
        if (token1.id.toLowerCase() === this.pairs[i].token0.id.toLowerCase()) {
          return this.pairs[i]
        }
      }
      if (token1.id.toLowerCase() === this.pairs[i].token0.id.toLowerCase()) {
        if (token0.id.toLowerCase() === this.pairs[i].token1.id.toLowerCase()) {
          // Return flipped pair
          return this.pairs[i].flip()
        }
      }
    }
    return null
  }

  getPairs(): IPair[] {
    return this.pairs
  }

  getCapcities(pair: IPair): [Option<string>, Option<string>] {
    let chainNativeWrap: IToken
    let chainUSDT: IToken
    if (this.chain.nativeWrap === null || this.chain.usdt === null)
      return [null, null]
    else {
      chainNativeWrap = this.chain.nativeWrap
      chainUSDT = this.chain.usdt
    }

    const nativeWrapUSDTPair = this.getPair(chainNativeWrap, chainUSDT)
    if (nativeWrapUSDTPair === null) {
      return [null, null]
    }

    let token0Capcity: Option<string> = null
    let token1Capcity: Option<string> = null

    // Calculate capacity of token0
    if (pair.token0.id.toLowerCase() === chainNativeWrap.id.toLowerCase()) {
      token0Capcity = new Decimal(nativeWrapUSDTPair.token0Price)
        .mul(new Decimal(pair.reserve0))
        .toFixed(6)
    } else if (pair.token0.id.toLowerCase() === chainUSDT.id.toLowerCase()) {
      token0Capcity = new Decimal(pair.reserve0).toFixed(6)
    } else {
      const token0NativewrapPair = this.getPair(pair.token0, chainNativeWrap)
      if (token0NativewrapPair !== null) {
        token0Capcity = new Decimal(token0NativewrapPair.token0Price)
          .mul(new Decimal(nativeWrapUSDTPair.token0Price))
          .mul(new Decimal(pair.reserve0))
          .toFixed(6)
      }
    }

    // Calculate capacity of token1
    if (pair.token1.id.toLowerCase() === chainNativeWrap.id.toLowerCase()) {
      token1Capcity = new Decimal(nativeWrapUSDTPair.token0Price)
        .mul(new Decimal(pair.reserve1))
        .toFixed(6)
    } else if (pair.token1.id.toLowerCase() === chainUSDT.id.toLowerCase()) {
      token1Capcity = new Decimal(pair.reserve1).toFixed(6)
    } else {
      const token1NativewrapPair = this.getPair(pair.token1, chainNativeWrap)
      if (token1NativewrapPair !== null) {
        token1Capcity = new Decimal(token1NativewrapPair.token0Price)
          .mul(new Decimal(nativeWrapUSDTPair.token0Price))
          .mul(new Decimal(pair.reserve1))
          .toFixed(6)
      }
    }
    return [token0Capcity, token1Capcity]
  }
}
