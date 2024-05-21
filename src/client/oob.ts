import type {} from '@koishijs/plugin-console'
import type { Context } from 'koishi'
import { sleep } from 'koishi'
import { resolve } from 'node:path'
import type { TelemetryStorage } from '../plugins'

export const name = 'telemetry-oob-client'

export const inject = ['console']

declare module '@koishijs/plugin-console' {
  interface Events {
    'dismiss'(reason: number): void
    'accept'(): void
  }
}

export function apply(ctx: Context, storage: TelemetryStorage) {
  ctx.console.addListener('dismiss', (reason) => {
    void (async () => {
      try {
        await Promise.any([
          storage.basis.post('/dismiss', {
            reason,
          }),
          sleep(3000),
        ])
      } catch (e) {
        // Ignore
      }

      storage.root.update((config) => {
        config.mode = 'readonly'
        return config
      })
    })()
  })

  ctx.console.addListener('accept', () => {
    void storage.commitPrivacy()

    ctx.scope.dispose()
  })

  ctx.console.addEntry({
    dev: resolve(__dirname, '../../clients/oob/client/index.ts'),
    prod: resolve(__dirname, '../../clients/oob/dist'),
  })
}
