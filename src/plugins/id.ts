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

  cmid: string = undefined as unknown as string
  menv: string = undefined as unknown as string
  mid: string = undefined as unknown as string

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
}
