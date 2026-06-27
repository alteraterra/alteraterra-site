// ponytail: bypass Supabase email rate limit by minting a magic link via admin API.
// Usage: node scripts/mint-magic-link.mjs <email>
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const FRONTEND_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// load .env.local
const envPath = resolve(FRONTEND_DIR, '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const URL_ = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2] || 'oscarmottaquintana@gmail.com';
const redirectTo = process.argv[3] || 'http://localhost:3000/admin';

if (!URL_ || !KEY) { console.error('Missing env'); process.exit(1); }

const { createClient } = createRequire(import.meta.url)('@supabase/supabase-js');
const supa = createClient(URL_, KEY, { auth: { persistSession: false } });

const { data, error } = await supa.auth.admin.generateLink({
  type: 'magiclink',
  email,
  options: { redirectTo },
});

if (error) { console.error('Error:', error.message); process.exit(1); }
console.log('\nPaste this into your browser:\n');
console.log(data.properties?.action_link || data.action_link);
console.log('');
