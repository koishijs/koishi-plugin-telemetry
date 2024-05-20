import type { Context } from 'koishi'
import { TelemetryIdClient } from '../client'
import { TypedEventEmitter } from '../types'
import { getMachineId } from '../utils/id/mid'
import { TelemetryBundle } from './bundle'
import type { TelemetryStorage } from './storage'

export type TelemetryIdEvents = {
  update: () => void
  failed: () => void
  machineReady: () => void
}

export class TelemetryId extends TypedEventEmitter<TelemetryIdEvents> {
  constructor(
    private ctx: Context,
    public storage: TelemetryStorage,
  ) {
    super()

    void this.init()

    ctx.plugin(TelemetryIdClient, this)
  }

  cmid: string | undefined = undefined
  menv: string | undefined = undefined
  mid: string | undefined = undefined
  bundleId: string | undefined = undefined
  instanceId: string | undefined = undefined
  sessionId: string | undefined = undefined

  private init = async () => {
    try {
      const { cmid, menv, mid } = await getMachineId(this.ctx)
      this.cmid = cmid
      this.menv = menv
      this.mid = mid

      this.emit('update')
      this.emit('machineReady')

      this.ctx.plugin(TelemetryBundle, this)
    } catch (e) {
      this.emit('failed')
    }
  }

  public setBundleId = (bundleId: string) => {
    this.bundleId = bundleId
    this.emit('update')
  }

  public setInstanceId = (instanceId: string) => {
    this.instanceId = instanceId
    this.emit('update')
  }

  public setSessionId = (sessionId: string) => {
    this.sessionId = sessionId
    this.emit('update')
  }

  public setFailed = () => this.emit('failed')
}
