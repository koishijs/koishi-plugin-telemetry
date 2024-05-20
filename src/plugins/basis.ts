import type { Context, HTTP, Logger } from 'koishi'
import { inspect } from 'node:util'
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
  constructor(
    private ctx: Context,
    public root: Root,
  ) {
    this.#postLogger = ctx.logger('telemetry/post')

    this.http = ctx.http.extend({
      endpoint: 'https://d.ilharper.com/cordis/v1',
    })

    this.ready = this.init()

    if (root.config.mode === 'readonly') return

    ctx.plugin(TelemetryStorage, this)
  }

  private init = async () => {
    const l = this.ctx.logger('telemetry/basis')

    try {
      this.hello = await this.post('/hello', {})
    } catch (e) {
      l.debug('hello failed')
      l.debug(e)
    }
  }

  private http: HTTP

  public hello: Hello = undefined as unknown as Hello

  private ready: Promise<void>

  public whenReady = () => this.ready

  #postLogger: Logger

  public post: HTTP.Request2 = async (
    url: string,
    data?: unknown,
    config?: HTTP.RequestConfig,
  ) => {
    try {
      const result = (await this.http.post(url, data, {
        ...(config || {}),
        headers: {
          ...(config?.headers || {}),
          'X-XSRF-TOKEN': getXsrfToken(),
        },
      })) as unknown

      this.#postLogger.debug(`${url} success, data:`)
      this.#postLogger.debug(data)
      this.#postLogger.debug('response:')
      this.#postLogger.debug(result)

      return result
    } catch (e) {
      this.#postLogger.debug(`${url} failed:`)
      this.#postLogger.debug(inspect(e))
      this.#postLogger.debug('data:')
      this.#postLogger.debug(data)

      throw new Error('出现了一个异常（这不会影响 Koishi 的正常运行）。')
    }
  }
}
