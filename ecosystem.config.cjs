const path = require('path');

const backendDir = path.join(__dirname, 'backend');

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
      },
    },
  ],
};
