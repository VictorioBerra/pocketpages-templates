const { upOne, exec } = require('docker-compose');
const path = require('path');

module.exports = async () => {
  await upOne('mailhog', { cwd: path.join(__dirname), });
  await upOne('pocketbase', { cwd: path.join(__dirname), commandOptions: ['--build'] });

  // Create superuser
  await exec('pocketbase', './pocketbase superuser upsert test@test.com test_password1234');
};
