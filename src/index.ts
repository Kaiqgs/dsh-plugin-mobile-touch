/**
 * Standalone plugin for DeepSeek Harness that optimizes touch UX and fast-tap delivery for iPad & mobile devices.
 * @module @anonyjcy/dsh-plugin-mobile-touch
 */

import type { Context } from '@deepseek-ai/cordis'
import { bootTouchInjection, buildBootScript } from './boot-script.ts'
import type { Config, IndexInjection } from './types.ts'

export { bootTouchInjection, buildBootScript } from './boot-script.ts'
export {
  DSH_HOME_DIR_NAME,
  DSH_HOME_ENV,
  PACKAGE_NAME,
  PLUGIN_ID,
  dshHomePath,
  expandHomePath,
  getPackageRootDir,
  installTouchPlugin,
  isTouchPluginInstalled,
  resolveDshHome,
  targetProfileDir,
  uninstallTouchPlugin,
  verifyTouchPlugin,
  type InstallOptions,
  type VerificationResult,
} from './installer.ts'
export type { Config, IndexInjection, IndexInjectionPlacement } from './types.ts'

/** Cordis plugin name. */
export const name = 'plugin-mobile-touch'

/**
 * Apply the mobile touch optimizer plugin to a Cordis Context.
 * Subscribes to webserver/index-inject to inject mobile touch optimizations into the DeepSeek Harness Web GUI.
 *
 * @param ctx - Cordis context.
 * @param config - plugin configuration options.
 */
export function apply(ctx: Context, config: Config = {}): void {
  if (config.disabled) return

  // `webserver/index-inject` is declared on Cordis' `Events` by
  // @deepseek-ai/dsh-host-webserver, which this package deliberately does not
  // depend on. Re-declaring it here would have to mirror that package's wider
  // `IndexInjection` union exactly, because interface merging requires
  // identical member types, and would break the moment a variant is added
  // upstream.
  // A local view of `ctx.on` keeps the listener typed without claiming
  // ownership of an event this package does not define.
  const onIndexInject = ctx.on as unknown as (
    event: 'webserver/index-inject',
    listener: (table: IndexInjection[]) => void,
  ) => void

  onIndexInject('webserver/index-inject', (table: IndexInjection[]) => {
    try {
      table.push(bootTouchInjection())
    } catch (error) {
      ctx.logger?.warn?.(`[plugin-mobile-touch] Failed to push boot touch injection: ${String(error)}`)
    }
  })
}

export default {
  name,
  apply,
}
