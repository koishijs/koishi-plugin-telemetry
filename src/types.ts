import { Schema } from 'koishi'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export interface Root {
  config: Config
}
