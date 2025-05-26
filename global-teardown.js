const { downAll,logs } = require('docker-compose');
const path = require('path');

module.exports = async () => {
  const serviceLogs = await logs('pocketbase');
  console.log(serviceLogs);
  await downAll({ cwd: path.join(__dirname), log: true });
};
