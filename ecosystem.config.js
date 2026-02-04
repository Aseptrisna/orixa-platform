module.exports = {
  apps: [
    {
      name: 'orixa-api',
      cwd: './apps/api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 8023
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      time: true,
      max_memory_restart: '500M'
    },
    {
      name: 'orixa-web',
      cwd: './apps/web',
      script: 'node_modules/.bin/serve',
      args: '-s dist -l 8022',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      merge_logs: true,
      time: true,
      max_memory_restart: '300M'
    }
  ]
};
