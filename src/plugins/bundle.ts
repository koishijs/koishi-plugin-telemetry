import type { Context, HTTP, Logger } from 'koishi'
import { sleep } from 'koishi'
import type { TelemetryBasis } from './basis'
import type { TelemetryId } from './id'
import { TelemetryInstance } from './instance'
import type { TelemetryStorage } from './storage'

interface BundleResponse {
  bundleId: string
}

export class TelemetryBundle {
  constructor(
    private ctx: Context,
    public id: TelemetryId,
  ) {
    this.#l = ctx.logger('telemetry/bundle')
    this.storage = id.storage
    this.basis = this.storage.basis
    this.post = this.basis.post

    void this.init()
  }

  #l: Logger

  public storage: TelemetryStorage
  public basis: TelemetryBasis
  public post: HTTP.Request2

  private init = async () => {
    if (this.storage.data.bundleId) {
      this.id.setBundleId(this.storage.data.bundleId)
      this.ctx.plugin(TelemetryInstance, this.id)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const result = (await this.post('/bundle', {
        coreMachineId: this.id.cmid,
        machineEnv: this.id.menv,
        machineId: this.id.mid,
      })) as BundleResponse

      if (!result.bundleId) {
        this.id.setFailed()
        return
      }
      this.id.setBundleId(result.bundleId)
      await this.storage.saveBundleId(result.bundleId)
    } catch (e) {
      this.#l.debug('bundle failed')
      this.id.setFailed()
      return
    }

    await sleep(5000)

    this.ctx.plugin(TelemetryInstance, this.id)
  }
}
