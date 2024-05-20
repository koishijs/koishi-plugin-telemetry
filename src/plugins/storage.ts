import type { Context, HTTP } from 'koishi'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import type { O } from 'ts-toolbelt'
import { TelemetryOobClient } from '../client'
import type { Root } from '../types'
import { exists } from '../utils/fs'
import type { TelemetryBasis } from './basis'
import { TelemetryId } from './id'

export type TelemetryData = O.Partial<TelemetryDataIntl, 'deep'>

interface TelemetryDataIntl {
  nonoob: boolean
  privacy: number
  readAlerts: number[]
  bundleId: string
  instanceId: string
}

const defaultTelemetryData: TelemetryData = {
  nonoob: false,
  privacy: 0,
  readAlerts: [],
}

export class TelemetryStorage {
  constructor(
    private ctx: Context,
    public basis: TelemetryBasis,
  ) {
    this.root = basis.root

    this.privacyReady = new Promise<void>((res) => {
      this.commitPrivacyReady = res
    })

    void this.init()
  }

  private init = async () => {
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
      void oob(this.basis.post)
      this.data.nonoob = true
      await this.save()

      this.ctx.logger('telemetry').success(`
欢迎使用 Koishi！
telemetry 服务是一组可选的 Koishi 服务，旨在通过分析您的 Koishi 使用情况来改善 Koishi 的使用体验、提供精确的插件使用量数据，并仅在您需要时为您提供支持。
拒绝同意将影响我们提供的相关数据和功能，但不会影响 Koishi 的基础功能。
要了解更多信息，请打开 Koishi 控制台并参阅我们的隐私政策。在您点击「同意」前，telemetry 服务不会启动。
`)
    }

    // OOB. Pop OOB client.
    if (!this.data.privacy) this.ctx.plugin(TelemetryOobClient, this)

    await this.basis.whenReady()

    if (this.data.privacy)
      if (this.data.privacy < this.basis.hello.privacyVer)
        // Privacy updated. Pop OOB client.
        this.ctx.plugin(TelemetryOobClient, this)
      // Stored privacy ver equals remote. Directly commit privacy.
      else this.commitPrivacyReady()

    await this.privacyReady

    this.ctx.plugin(TelemetryId, this)
  }

  private privacyReady: Promise<void> = undefined as unknown as Promise<void>

  public commitPrivacyReady: () => void = undefined as unknown as () => void

  private storagePath = join(cwd(), 'data/telemetry.json')

  public data: TelemetryData = undefined as unknown as TelemetryData

  public root: Root

  private save = async () => {
    await writeFile(this.storagePath, JSON.stringify(this.data))
  }

  public saveBundleId = async (bundleId: string) => {
    this.data.bundleId = bundleId
    return this.save()
  }

  public saveInstanceId = async (instanceId: string) => {
    this.data.instanceId = instanceId
    return this.save()
  }
}

const oob = async (post: HTTP.Request2) => {
  await post('/oob', {})
}
