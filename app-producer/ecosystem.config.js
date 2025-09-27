const path = require('path');

module.exports = {
  apps: [
    {
      name: "producerQueueSend",
      script: path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.cjs'),
      args: ['--', path.join(__dirname, 'src', 'relayer', 'RelayerClient.ts')],
      interpreter: 'node',
      exec_mode: "fork"
    },
    {
      name: "listenQueueCallback",
      script: path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.cjs'),
      args: ['--', path.join(__dirname, 'src', 'listener', 'ProducerQueueListener.ts')],
      interpreter: 'node',
      exec_mode: "fork"
    },
    
  ],
};