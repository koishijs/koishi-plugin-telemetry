import type { Context } from 'koishi'
import { TelemetryIdClient } from '../client'
import { getMachineId } from '../utils/id/mid'

export class TelemetryId {
  constructor(ctx: Context) {
    this.ready = (async () => {
      const { cmid, menv, mid } = await getMachineId(ctx)
      this.cmid = cmid
      this.menv = menv
      this.mid = mid
    })()

    ctx.plugin(TelemetryIdClient, this)
  }

  cmid: string
  menv: string
  mid: string

  ready: Promise<void>

  whenReady = () => this.ready
}
