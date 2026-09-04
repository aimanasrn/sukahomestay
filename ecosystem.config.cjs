module.exports = {
  apps: [{ name: 'suka-homestay-api', cwd: './server', script: 'dist/src/server.js', instances: 2, exec_mode: 'cluster', env_production: { NODE_ENV: 'production', PORT: 4000 }, max_memory_restart: '500M', time: true }],
};
