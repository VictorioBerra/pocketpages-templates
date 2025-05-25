const { downAll } = require('docker-compose');
const path = require('path');

module.exports = async () => {
  await downAll({ cwd: path.join(__dirname), log: true });
};
