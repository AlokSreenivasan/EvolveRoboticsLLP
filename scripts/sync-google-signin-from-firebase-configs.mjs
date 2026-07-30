#!/usr/bin/env node
/**
 * Sync Google Sign-In client IDs from Firebase config files into app sources.
 *
 * Reads:
 *   - android/app/google-services.json  (web client_type 3)
 *   - ios/GoogleService-Info.plist       (CLIENT_ID / REVERSED_CLIENT_ID)
 * Writes:
 *   - src/config/googleSignIn.ts
 *   - ios/Evolve/Info.plist             (CFBundleURLSchemes)
 *
 * Usage: node scripts/sync-google-signin-from-firebase-configs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function readJson(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) fail(`Missing ${rel}`);
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function readText(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) fail(`Missing ${rel}`);
  return fs.readFileSync(full, 'utf8');
}

function plistString(plist, key) {
  const re = new RegExp(
    `<key>${key}</key>\\s*<string>([^<]+)</string>`,
  );
  const match = plist.match(re);
  return match?.[1]?.trim() ?? null;
}

const android = readJson('android/app/google-services.json');
const clients = android?.client?.[0]?.oauth_client ?? [];
const other =
  android?.client?.[0]?.services?.appinvite_service?.other_platform_oauth_client ??
  [];
const allOauth = [...clients, ...other];

const webClient =
  allOauth.find(c => c.client_type === 3)?.client_id ??
  clients.find(c => typeof c.client_id === 'string' && c.client_id.includes('.apps.googleusercontent.com'))
    ?.client_id;

if (!webClient) {
  fail(
    'No web OAuth client (client_type 3) in android/app/google-services.json. ' +
      'Enable Google Sign-In in Firebase Console, add Android SHA-1/SHA-256, then re-download google-services.json.',
  );
}

const plist = readText('ios/GoogleService-Info.plist');
const reversedClientId = plistString(plist, 'REVERSED_CLIENT_ID');
const iosClientId = plistString(plist, 'CLIENT_ID');

if (!reversedClientId || !iosClientId) {
  fail(
    'GoogleService-Info.plist is missing CLIENT_ID / REVERSED_CLIENT_ID. ' +
      'Enable Google Sign-In in Firebase Console, then re-download the iOS plist.',
  );
}

const googleSignInPath = path.join(root, 'src/config/googleSignIn.ts');
fs.writeFileSync(
  googleSignInPath,
  [
    '/** Web OAuth client ID from Firebase (required for Google idToken → Firebase Auth). */',
    `export const GOOGLE_WEB_CLIENT_ID =`,
    `  '${webClient}';`,
    '',
    '/** iOS OAuth client ID from GoogleService-Info.plist (CLIENT_ID). */',
    `export const GOOGLE_IOS_CLIENT_ID =`,
    `  '${iosClientId}';`,
    '',
  ].join('\n'),
  'utf8',
);

const infoPlistPath = path.join(root, 'ios/Evolve/Info.plist');
let infoPlist = readText('ios/Evolve/Info.plist');
const schemeRe =
  /(<key>CFBundleURLSchemes<\/key>\s*<array>\s*<string>)[^<]*(<\/string>)/;
if (!schemeRe.test(infoPlist)) {
  fail('Could not find CFBundleURLSchemes in ios/Evolve/Info.plist');
}
infoPlist = infoPlist.replace(schemeRe, `$1${reversedClientId}$2`);
fs.writeFileSync(infoPlistPath, infoPlist, 'utf8');

const projectId =
  android?.project_info?.project_id ?? plistString(plist, 'PROJECT_ID');

console.log('Synced Google Sign-In config:');
console.log(`  project:            ${projectId}`);
console.log(`  webClientId:        ${webClient}`);
console.log(`  ios CLIENT_ID:      ${iosClientId}`);
console.log(`  REVERSED_CLIENT_ID: ${reversedClientId}`);
console.log('Updated:');
console.log('  - src/config/googleSignIn.ts');
console.log('  - ios/Evolve/Info.plist');
