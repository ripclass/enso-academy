// scripts/setup-gcp-tts.ts
// One-off setup script for Google Cloud Text-to-Speech service account.
// Run with: pnpm tsx scripts/setup-gcp-tts.ts
//
// Drives a visible Chromium browser through GCP Console. The user must be
// already logged in via the system Chrome profile. If 2FA/CAPTCHA fires,
// the user intervenes manually in the visible browser; the script waits.

import { chromium } from 'playwright'
import * as fs from 'fs/promises'
import * as path from 'path'

const PROJECT_NAME = 'enso-academy'
const SERVICE_ACCOUNT_NAME = 'enso-academy-tts'
const KEY_OUTPUT_PATH = path.resolve(process.cwd(), '.secrets/gcp-tts-service-account.json')

async function main() {
  console.log('Launching Chromium with persistent context (using your existing Chrome profile)...')
  console.log(`(Target project: ${PROJECT_NAME}, service account: ${SERVICE_ACCOUNT_NAME})`)
  console.log('NOTE: close all running Chrome windows first — Chrome locks its profile directory.')
  console.log('')

  // Use launchPersistentContext so Playwright uses your existing Chrome login state.
  // The user_data_dir path varies by OS; try the standard locations.
  const userDataDir = process.env.CHROME_USER_DATA_DIR || (
    process.platform === 'win32'
      ? path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/User Data')
      : process.platform === 'darwin'
      ? path.join(process.env.HOME || '', 'Library/Application Support/Google/Chrome')
      : path.join(process.env.HOME || '', '.config/google-chrome')
  )

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--profile-directory=Default'],
    viewport: { width: 1400, height: 900 },
  })

  const page = await context.newPage()

  console.log('Navigating to GCP Console...')
  await page.goto('https://console.cloud.google.com/')

  console.log('')
  console.log('=== MANUAL CHECKPOINT ===')
  console.log('If you see a login page or 2FA prompt, complete it now.')
  console.log('Once you can see the GCP Console dashboard, press Enter here to continue.')
  console.log('')

  await new Promise(resolve => {
    process.stdin.once('data', () => resolve(null))
  })

  // The exact selectors below depend on the current GCP Console UI.
  // Because the UI changes, the script logs each step and pauses for manual
  // intervention if a selector fails. Treat this as a guided manual flow.

  console.log('Step A: Select or create project enso-academy')
  console.log('  -> In the GCP Console, click the project selector at the top')
  console.log('  -> Select existing "enso-academy" project, or create new one')
  console.log('  -> Press Enter when project is selected')
  await new Promise(resolve => process.stdin.once('data', () => resolve(null)))

  console.log('Step B: Enable the Text-to-Speech API')
  console.log('  -> Navigate to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com')
  await page.goto('https://console.cloud.google.com/apis/library/texttospeech.googleapis.com')
  console.log('  -> Click "Enable" if not already enabled')
  console.log('  -> Press Enter when API is enabled')
  await new Promise(resolve => process.stdin.once('data', () => resolve(null)))

  console.log('Step C: Create service account')
  console.log('  -> Navigate to: https://console.cloud.google.com/iam-admin/serviceaccounts')
  await page.goto('https://console.cloud.google.com/iam-admin/serviceaccounts')
  console.log('  -> Click "Create Service Account"')
  console.log(`  -> Name: ${SERVICE_ACCOUNT_NAME}`)
  console.log('  -> Role: "Cloud Text-to-Speech User" (search for it)')
  console.log('  -> Click "Done"')
  console.log('  -> Press Enter when service account is created')
  await new Promise(resolve => process.stdin.once('data', () => resolve(null)))

  console.log('Step D: Create and download JSON key')
  console.log('  -> Click the newly-created service account')
  console.log('  -> Go to "Keys" tab')
  console.log('  -> Click "Add Key" -> "Create new key" -> JSON -> "Create"')
  console.log('  -> The browser will download the JSON file to your default downloads folder')
  console.log('  -> Move/copy the downloaded JSON to:')
  console.log(`    ${KEY_OUTPUT_PATH}`)
  console.log('  -> Press Enter when the JSON key is in the correct location')
  await new Promise(resolve => process.stdin.once('data', () => resolve(null)))

  // Verify the file exists
  try {
    const stat = await fs.stat(KEY_OUTPUT_PATH)
    console.log(`OK Service account key file found at ${KEY_OUTPUT_PATH} (${stat.size} bytes)`)
  } catch {
    console.error(`FAILED Could not find key file at ${KEY_OUTPUT_PATH}`)
    console.error('  Move the downloaded JSON to that path and re-run this script.')
    await context.close()
    process.exit(1)
  }

  console.log('')
  console.log('=== SETUP COMPLETE ===')
  console.log('Next steps will be handled by the main prompt:')
  console.log('  1. Add .secrets/ to .gitignore')
  console.log('  2. Set GOOGLE_APPLICATION_CREDENTIALS in .env.local')
  console.log('  3. Set GOOGLE_APPLICATION_CREDENTIALS_JSON in Vercel (as inline JSON)')
  console.log('')

  await context.close()
}

main().catch(err => {
  console.error('Setup failed:', err)
  process.exit(1)
})
