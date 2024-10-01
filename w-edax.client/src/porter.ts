const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const getContainerPort = (containerName: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    console.log('Waiting for 5 seconds before fetching container port...');
    setTimeout(() => {
      console.log(`Running Docker command to get port mapping for container: ${containerName}`);
      exec(`docker port ${containerName}`, (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          console.error(`Error getting container port for ${containerName}: ${stderr}`);
          return reject(null);
        }
        const output = stdout.trim();
        const match = /8081\/tcp -> 0.0.0.0:(\d+)/.exec(output);
        if (match) {
          resolve(match[1]);
        } else {
          console.error(`Could not find port in Docker output for ${containerName}`);
          reject(null);
        }
      });
    }, 5000);
  });
};

const updateEnvironmentFile = (port: string): void => {
  const envFilePath = path.resolve(__dirname, '.', 'environments', 'environment.ts');
  const envContent = `
export const environment = {
  production: false,
  apiUrl: 'https://localhost:${port}/api',
  firebaseConfig: {
    apiKey: "AIzaSyDBK2cJVX4WsmwIoLxuykYk2NZiMj-TiyM",
    authDomain: "w-edax-b.firebaseapp.com",
    projectId: "w-edax-b",
    storageBucket: "w-edax-b.appspot.com",
    messagingSenderId: "584318493435",
    appId: "1:584318493435:web:5c46a3b3e03cc474c2465e",
    measurementId: "G-070YVYCRS2"
  }
};
  `;
  fs.writeFileSync(envFilePath, envContent.trim());
  console.log(`Updated ${envFilePath} with port ${port}`);
};

const updateProxyConfFile = (port: string): void => {
  const proxyFilePath = path.resolve(__dirname, '.', 'proxy.conf.js');
  const proxyContent = `
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? \`https://localhost:\${env.ASPNETCORE_HTTPS_PORT}\` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:${port}';

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
  `;
  fs.writeFileSync(proxyFilePath, proxyContent.trim());
  console.log(`Updated ${proxyFilePath} with port ${port}`);
};

(async () => {
  const containerNames = ['W-EDAX.Server_1', 'W-EDAX.Server']; // Check both container names

  for (const containerName of containerNames) {
    try {
      const port = await getContainerPort(containerName);
      if (port) {
        console.log(`Port found for container ${containerName}: ${port}`);
        updateEnvironmentFile(port);
        updateProxyConfFile(port);
        break; // Exit loop if a valid port is found
      }
    } catch (error) {
      console.error(`Failed to get port for ${containerName}:`, error);
    }
  }

  console.log('Finished checking containers.');
})();
