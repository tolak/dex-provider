import {IChain, IToken, Option} from './types'
import {ethers} from 'ethers'
import {ApiPromise, WsProvider} from '@polkadot/api'

export class EvmChain implements IChain {
  name: string
  provider: ethers.providers.JsonRpcProvider
  nativeWrap: Option<IToken>
  usdt: Option<IToken>
  usdc: Option<IToken>

  constructor(
    name: string,
    rpc: string,
    nativeWrap: Option<IToken>,
    usdt: Option<IToken>,
    usdc: Option<IToken>
  ) {
    this.name = name
    this.provider = new ethers.providers.JsonRpcProvider(rpc)
    this.nativeWrap = nativeWrap
    this.usdt = usdt
    this.usdc = usdc
  }

  latestBlock(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.provider
        .getBlockNumber()
        .then((block) => {
          resolve(Number(block))
        })
        .catch((err) => reject(err))
    })
  }
}

export class SubstrateChain implements IChain {
  name: string
  provider: WsProvider
  nativeWrap: Option<IToken>
  usdt: Option<IToken>
  usdc: Option<IToken>

  constructor(
    name: string,
    rpc: string,
    nativeWrap: Option<IToken>,
    usdt: Option<IToken>,
    usdc: Option<IToken>
  ) {
    this.name = name
    this.provider = new WsProvider(rpc)
    this.nativeWrap = nativeWrap
    this.usdt = usdt
    this.usdc = usdc
  }

  latestBlock(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ApiPromise.create({provider: this.provider})
        .then((api) => {
          api.rpc.chain
            .getHeader()
            .then((header) => {
              resolve(Number(header.number))
            })
            .catch((err) => reject(err))
        })
        .catch((err) => reject(err))
    })
  }
}
