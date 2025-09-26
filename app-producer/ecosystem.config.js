const path = require('path');

module.exports = {
  apps: [
    {
      name: "myApp",
      script: path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.cjs'),
      args: ['--', path.join(__dirname, 'src', 'relayer', 'RelayerClient.ts')],
      interpreter: 'node',
      exec_mode: "cluster",   
      instances: 1,
    },
  ],
};