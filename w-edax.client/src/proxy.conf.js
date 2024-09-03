const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:55161';

const PROXY_CONFIG = [
  {
    context: [
      "/api/**", // Ensure this matches your API path
    ],
    target,
    secure: false,
    logLevel: "debug" // Optional: helps in debugging proxy issues
  }
];

module.exports = PROXY_CONFIG;
