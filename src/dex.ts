import {gql, GraphQLClient} from 'graphql-request'
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
      if (token.id === this.pairs[i].token0.id) {
        pairs.push(this.pairs[i])
        continue
      }
      if (token.id === this.pairs[i].token1.id) {
        // Revert pair
        pairs.push(this.pairs[i].flip())
        continue
      }
    }
    return pairs
  }

  getPairs(): IPair[] {
    return this.pairs
  }
}
