import type { Context } from 'koishi'
import { Schema } from 'koishi'
import { TelemetryBasis } from './plugins'

export const name = 'telemetry'

export const filter = false

export const inject = {
  optional: ['notifier'],
}

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.plugin(TelemetryBasis)
}
