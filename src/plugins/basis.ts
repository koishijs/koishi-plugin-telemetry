import type { Context, HTTP } from 'koishi'
import type { Root } from '../types'
import { getXsrfToken } from '../utils/xsrf'
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
  constructor(ctx: Context, root: Root) {
    const l = ctx.logger('telemetry/basis')

    this.http = ctx.http.extend({
      baseURL: 'https://d.ilharper.com/cordis/v1',
    })

    this.ready = (async () => {
      try {
        this.hello = await this.post('/hello', {})
      } catch (e) {
        l.debug('hello failed')
        l.debug(e)
      }
    })()

    if (root.config.mode === 'readonly') return

    ctx.plugin(TelemetryStorage, this)
  }

  private http: HTTP

  public hello: Hello = undefined as unknown as Hello

  private ready: Promise<void>

  public whenReady = () => this.ready

  public post: HTTP.Request2 = async (
    url: string,
    data?: unknown,
    config?: HTTP.RequestConfig,
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.http.post(url, data, {
      ...(config || {}),
      headers: {
        ...(config?.headers || {}),
        'X-XSRF-TOKEN': getXsrfToken(),
      },
    })
}
