const { expect } = require('chai');
const sinon = require('sinon');
const compose = require('docker-compose');
const path = require('path');

before(function(done) {
  this.timeout(60000); // Increase timeout to 60 seconds for Docker
  compose.upAll({ cwd: path.join(__dirname), log: true }).then(
    () => {
      console.log('done')
      done();
    },
    (err) => {
      console.log('something went wrong:', err.message)
    }
  )
});

describe('compose.upAll', function() {
  it('Should return the home page', function() {
    
  });
});
