import type { Context } from 'koishi'
import { TelemetryIdClient } from '../client'
import { getMachineId } from '../utils/id/mid'

export class TelemetryId {
  constructor(ctx: Context) {
    this.whenReady = async () => {
      const { cmid, menv, mid } = await getMachineId(ctx)
      this.cmid = cmid
      this.menv = menv
      this.mid = mid
    }

    ctx.plugin(TelemetryIdClient, this)
  }

  cmid: string
  menv: string
  mid: string

  whenReady: () => Promise<void>
}
