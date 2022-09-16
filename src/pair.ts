import {IToken, IPair, Option} from './types'
import {Decimal} from 'decimal.js'

export class Pair implements IPair {
  id: string
  token0: IToken
  token1: IToken
  reserve0: string
  reserve1: string
  volumeUSD: Option<string>
  capcity0: Option<string>
  capcity1: Option<string>
  swapFee: Option<string>
  devFee: Option<string>

  constructor(
    id: string,
    token0: IToken,
    token1: IToken,
    reserve0: string,
    reserve1: string,
    volumeUSD: Option<string>,
    capcity0: Option<string>,
    capcity1: Option<string>,
    swapFee: Option<string>,
    devFee: Option<string>
  ) {
    this.id = id
    this.token0 = token0
    this.token1 = token1
    this.reserve0 = reserve0
    this.reserve1 = reserve1
    this.volumeUSD = volumeUSD
    this.capcity0 = capcity0
    this.capcity1 = capcity1
    this.swapFee = swapFee
    this.devFee = devFee
  }

  flip(): Pair {
    return new Pair(
      this.id,
      this.token1,
      this.token0,
      this.reserve1,
      this.reserve0,
      this.volumeUSD,
      this.capcity1,
      this.capcity0,
      this.swapFee,
      this.devFee
    )
  }

  getReserves(): [string, string] {
    return [this.reserve0, this.reserve1]
  }

  updateReserves(): [string, string] {
    // TODO: fetch latest  data from blockchain
    return [this.reserve0, this.reserve1]
  }

  getPrices(): [Option<string>, Option<string>] {
    // TODO: fetch from blockchain or set manually
    return [null, null]
  }

  getFee(token: IToken): Option<string> {
    // TODO: fetch from blockchain or set manually
    return null
  }

  getRate0(): string {
    return new Decimal(this.reserve1).div(new Decimal(this.reserve0)).toFixed(6)
  }

  getRate1(): string {
    return new Decimal(this.reserve0).div(new Decimal(this.reserve1)).toFixed(6)
  }
}
