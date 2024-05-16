import type { Context, HTTP } from 'koishi'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import type { O } from 'ts-toolbelt'
import { exists } from '../utils/fs'
import type { TelemetryBasis } from './basis'

export type TelemetryData = O.Partial<TelemetryDataIntl, 'deep'>

interface TelemetryDataIntl {
  nonoob: boolean
  privacy: number
  readAlerts: number[]
}

const defaultTelemetryData: TelemetryDataIntl = {
  nonoob: false,
  privacy: 0,
  readAlerts: [],
}

export class TelemetryStorage {
  constructor(
    ctx: Context,
    public basis: TelemetryBasis,
  ) {
    this.ready = (async () => {
      // Load storage
      if (!(await exists(this.storagePath))) {
        this.data = structuredClone(defaultTelemetryData)
        await writeFile(this.storagePath, JSON.stringify(this.data))
      } else {
        this.data = JSON.parse(
          (await readFile(this.storagePath)).toString(),
        ) as TelemetryData
      }

      if (!this.data.nonoob) {
        void oob(basis.http)
        this.data.nonoob = true
        await this.save()
      }
    })()
  }

  private storagePath = join(cwd(), 'data/telemetry.json')

  public data: TelemetryData

  public save = async () => {
    await writeFile(this.storagePath, JSON.stringify(this.data))
  }

  private ready: Promise<void>

  public whenReady = () => Promise.all([this.basis.whenReady(), this.ready])
}

const oob = async (http: HTTP) => {
  await http.post('/oob', {})
}
