import {IChain, IBridge, IBridgePair, IToken, Option} from './types'

export class BridgePair implements IBridgePair {
  token0: IToken
  token1: IToken

  constructor(token0: IToken, token1: IToken) {
    this.token0 = token0
    this.token1 = token1
  }

  getToken0Capcity(): Option<string> {
    // TODO: calculate by price oracle and onchain data
    return '10000'
  }

  getToken1Capcity(): Option<string> {
    // TODO: calculate by price oracle and onchain data
    return '20000'
  }
}

export class Bridge implements IBridge {
  chain0: IChain
  chain1: IChain
  pairs: IBridgePair[]
  pairBounding: Map<[IToken, IToken], boolean>

  constructor(chain0: IChain, chain1: IChain) {
    this.chain0 = chain0
    this.chain1 = chain1
    this.pairs = []
    this.pairBounding = new Map<[IToken, IToken], boolean>()
  }

  addBridgePair(pair: IBridgePair) {
    if (
      this.pairBounding.has([pair.token0, pair.token1]) ||
      this.pairBounding.has([pair.token1, pair.token0])
    ) {
      throw new Error('Pair already exist')
    }
    this.pairs.push(pair)
    // Two way bouding
    // FIXME: not working
    this.pairBounding.set([pair.token0, pair.token1], true)
    this.pairBounding.set([pair.token1, pair.token0], true)
  }

  // Return corresponding bridged asset for a given asset
  getBridgedAsset(token: IToken): Option<[IChain, IToken]> {
    // let pair: keyof IBridgePair
    for (let i = 0; i < this.pairs.length; i++) {
      const pair: IBridgePair = this.pairs[i]
      if (pair.token0.id.toLowerCase() === token.id.toLowerCase())
        return [this.chain1, pair.token1]
      if (pair.token1.id.toLowerCase() === token.id.toLowerCase())
        return [this.chain0, pair.token0]
    }
    return null
  }
}
