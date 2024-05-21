import type { Context, HTTP, Logger } from 'koishi'
import { sleep } from 'koishi'
import { getInstanceEnv } from '../utils/id/ienv'
import type { TelemetryBasis } from './basis'
import type { TelemetryId } from './id'
import { TelemetrySession } from './session'
import type { TelemetryStorage } from './storage'

interface InstanceResponse {
  instanceId: string
  chToken: string
}

export class TelemetryInstance {
  constructor(
    private ctx: Context,
    public id: TelemetryId,
  ) {
    this.#l = ctx.logger('telemetry/instance')
    this.storage = id.storage
    this.basis = this.storage.basis
    this.post = this.basis.post

    void this.#init()
  }

  #l: Logger

  public storage: TelemetryStorage
  public basis: TelemetryBasis
  public post: HTTP.Request2

  #init = async () => {
    try {
      const instanceEnv = await getInstanceEnv(this.ctx)

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const result = (await this.post('/inst', {
        coreMachineId: this.id.cmid,
        machineEnv: this.id.menv,
        machineId: this.id.mid,
        instanceEnv,
        bundleId: this.storage.data.bundleId,
      })) as InstanceResponse

      if (!result.instanceId || !result.chToken) {
        this.id.setFailed()
        return
      }

      this.id.setInstanceId(result.instanceId)

      if (!this.storage.data.instanceId) {
        await this.storage.saveInstanceId(result.instanceId)
      } else if (result.instanceId !== this.storage.data.instanceId) {
        const oldInstanceId = this.storage.data.instanceId
        await this.storage.saveInstanceId(result.instanceId)
        void this.post('/instch', {
          chToken: result.chToken,
          oldInstanceId,
        }).catch(() => this.#l.debug('instch failed'))
      }

      await sleep(5000)

      this.ctx.plugin(TelemetrySession, this.id)
    } catch (e) {
      this.#l.debug('instance failed')
      this.id.setFailed()
      return
    }
  }
}
