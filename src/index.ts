import type { Context } from 'koishi'
import { Schema } from 'koishi'
import { TelemetryId } from './plugins'

export const name = 'telemetry'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.plugin(TelemetryId)
}
