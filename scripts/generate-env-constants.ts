// scripts/generate-env.ts
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAP_KEY = process.env['GOOGLE_MAP_KEY'];
const FIREBASE_API_KEY = process.env['FIREBASE_API_KEY'];

if (!GOOGLE_MAP_KEY || !FIREBASE_API_KEY) {
  console.error('❌ Missing env vars in .env file');
  process.exit(1);
}

const content = `
// ⚠️ Auto-generated from .env – do not edit
export const GOOGLE_MAP_KEY = '${GOOGLE_MAP_KEY}';
export const FIREBASE_API_KEY = '${FIREBASE_API_KEY}';
`;

fs.writeFileSync('./src/environments/env-constants.ts', content);
console.log('✅ env-constants.ts generated');
