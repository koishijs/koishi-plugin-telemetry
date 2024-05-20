import type { Context } from 'koishi'
import { TelemetryIdClient } from '../client'
import { getMachineId } from '../utils/id/mid'
import { TelemetryBundle } from './bundle'
import type { TelemetryStorage } from './storage'

export class TelemetryId {
  constructor(
    private ctx: Context,
    public storage: TelemetryStorage,
  ) {
    void this.init()

    ctx.plugin(TelemetryIdClient, this)
  }

  cmid: string = undefined as unknown as string
  menv: string = undefined as unknown as string
  mid: string = undefined as unknown as string

  private init = async () => {
    const { cmid, menv, mid } = await getMachineId(this.ctx)
    this.cmid = cmid
    this.menv = menv
    this.mid = mid

    this.ctx.plugin(TelemetryBundle, this)
  }
}
