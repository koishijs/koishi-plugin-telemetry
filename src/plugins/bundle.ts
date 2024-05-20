import type { Context, HTTP } from 'koishi'
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
    this.storage = id.storage
    this.basis = this.storage.basis
    this.post = this.basis.post

    void this.init()
  }

  public storage: TelemetryStorage
  public basis: TelemetryBasis
  public post: HTTP.Request2

  private init = async () => {
    if (this.storage.data.bundleId) {
      this.ctx.plugin(TelemetryInstance, this.id)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = (await this.post('/bundle', {
      coreMachineId: this.id.cmid,
      machineEnv: this.id.menv,
      machineId: this.id.mid,
    })) as BundleResponse

    if (!result.bundleId) return
    await this.storage.saveBundleId(result.bundleId)

    this.ctx.plugin(TelemetryInstance, this.id)
  }
}
