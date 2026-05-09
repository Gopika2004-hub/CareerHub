import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../db.json');

let cachedDb = null;

export function loadDb() {
  try {
    if (cachedDb) return cachedDb;
    
    // Try to read from root db.json
    const content = fs.readFileSync(dbPath, 'utf-8');
    cachedDb = JSON.parse(content);
    return cachedDb;
  } catch (err) {
    console.error('Failed to load db.json:', err.message);
    // Return default empty structure
    return {
      companies: [
        { id: 1, name: 'Google', logo_url: '/google.webp' },
        { id: 2, name: 'Amazon', logo_url: '/amazon.svg' },
        { id: 3, name: 'Microsoft', logo_url: '/microsoft.webp' }
      ],
      jobs: [],
      applications: [],
      savedJobs: [],
      profiles: [],
      employers: [],
      employerArchives: [],
      candidateArchives: [],
      nextCompanyId: 4,
      nextJobId: 1,
      nextAppId: 1,
      nextSavedJobId: 1,
      nextEmployerId: 1,
      adminPassword: 'Bala@2004',
      adminLogo: ''
    };
  }
}

export function clearCache() {
  cachedDb = null;
}
