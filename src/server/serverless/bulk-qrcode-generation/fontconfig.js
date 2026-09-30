import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// sharp 0.35 ships its own fontconfig and no fonts. Lambda has none either,
// so PNG text renders as empty boxes unless this file is visible to it.
const fontDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'assets/fonts',
)
const configDir = '/tmp/bulk-qr-fontconfig'
const cacheDir = path.join(configDir, 'cache')
fs.mkdirSync(cacheDir, { recursive: true })
fs.writeFileSync(
  path.join(configDir, 'fonts.conf'),
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${cacheDir}</cachedir>
  <alias>
    <family>sans-serif</family>
    <prefer><family>IBM Plex Sans</family></prefer>
  </alias>
  <config></config>
</fontconfig>
`,
)
process.env.FONTCONFIG_FILE = path.join(configDir, 'fonts.conf')
process.env.FONTCONFIG_PATH = configDir
