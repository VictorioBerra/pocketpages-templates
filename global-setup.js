const { buildOne, upAll } = require('docker-compose');
const path = require('path');

module.exports = async () => {
  await buildOne('pocketbase', { cwd: path.join(__dirname), log: true });
  await upAll({ cwd: path.join(__dirname), log: true });
};
