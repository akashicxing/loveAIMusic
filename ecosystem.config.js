module.exports = {
  apps: [{
    name: 'loveaimusic',
    script: 'npm',
    args: 'start',
    cwd: '/opt/app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env.production',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
