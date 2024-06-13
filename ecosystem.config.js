module.exports = {
  apps: [
    {
      name: "tic-tac-toe-server",
      script: "./server/dist/server/src/index.js",
      instances: 1,
      max_memory_restart: "300M",

      // Logging
      out_file: "./server-out.log",
      error_file: "./serve-error.log",
      merge_logs: true,
      log_date_format: "DD-MM HH:mm:ss Z",
      log_type: "json",

      // Env Specific Config
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
  ],
};
