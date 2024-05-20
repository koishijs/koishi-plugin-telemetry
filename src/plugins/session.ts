import type { Context, HTTP } from 'koishi'
import type { TelemetryBasis } from './basis'
import type { TelemetryId } from './id'
import type { TelemetryStorage } from './storage'

interface SessionResponse {
  sessionId: string
}

export class TelemetrySession {
  constructor(
    private ctx: Context,
    public id: TelemetryId,
  ) {
    this.storage = id.storage
    this.basis = this.storage.basis
    this.post = this.basis.post

    void this.#init()
  }

  public storage: TelemetryStorage
  public basis: TelemetryBasis
  public post: HTTP.Request2

  #init = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const result = (await this.post('/session', {
      instanceId: this.storage.data.instanceId,
    })) as SessionResponse

    if (!result.sessionId) {
      this.id.setFailed()
      return
    }

    this.id.setSessionId(result.sessionId)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.ctx.setInterval(
      () => {
        void this.post('/alive', {
          sessionId: this.id.sessionId,
        })
      },
      30 * 60 * 1000,
    )
  }
}
