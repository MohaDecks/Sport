const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const envPath = path.join(backendDir, '.env');

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;

  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const backendEnv = loadEnvFile(envPath);

module.exports = {
  apps: [
    {
      name: 'dsms-api',
      cwd: backendDir,
      script: path.join(backendDir, 'src/server.js'),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        ...backendEnv,
      },
    },
  ],
};
