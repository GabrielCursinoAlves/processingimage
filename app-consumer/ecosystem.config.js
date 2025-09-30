const path = require('path');

module.exports = {
  apps: [
    {
      name: "consumerQueueReceive",
      script: path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.cjs'),
      args: ['--', path.join(__dirname, 'src', 'listener', 'ConsumerQueueListener.ts')],
      interpreter: 'node',
      exec_mode: "fork"
    },    
  ],
};