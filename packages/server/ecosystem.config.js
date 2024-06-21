module.exports = {
  apps: [{
    name: 'tic-tac-toe-server',
    script: './dist/index.js',
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
  }],
}
