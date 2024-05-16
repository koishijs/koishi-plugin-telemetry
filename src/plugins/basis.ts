import type { Context, HTTP } from 'koishi'
import { TelemetryStorage } from './storage'

export interface Hello {
  ver: 1
  privacyVer: number
  alerts: HelloAlert[]
}

export interface HelloAlert {
  id: number
  title: string
  content: string
}

export class TelemetryBasis {
  constructor(ctx: Context) {
    const l = ctx.logger('telemetry/basis')

    this.http = ctx.http.extend({
      baseURL: 'https://d.ilharper.com/cordis/v1',
    })

    ctx.plugin(TelemetryStorage, this)

    this.ready = (async () => {
      try {
        this.hello = await this.http.post('/hello', {})
      } catch (e) {
        l.debug('hello failed')
        l.debug(e)
      }
    })()
  }

  public http: HTTP

  public hello: Hello

  private ready: Promise<void>

  public whenReady = () => this.ready
}
