'use strict';

const fs = require('fs');

module.exports = {
  decrypt() {
    let secretName = this.options.name;
    let stage      = this.options.stage;
    let region     = this.options.region;

    const secrets = JSON.parse(fs.readFileSync(this.secret_file, 'utf8'));

    if (secrets[secretName] === undefined) {
      this.serverless.cli.log(`ERROR: Could not find secret named ${secretName}`);
      return;
    }
    if (secrets[secretName][stage] === undefined) {
      this.serverless.cli.log(`ERROR: Could not find stage named ${stage}`);
      return;
    }
    if (secrets[secretName][stage][region] === undefined) {
      this.serverless.cli.log(`ERROR: Could not find region named ${region}`);
      return;
    }

    let encrypted = secrets[secretName][stage][region];

    const params = {
      CiphertextBlob: new Buffer(encrypted, 'base64'),
    };

    return this.provider.request(
      'KMS',
      'decrypt',
      params,
      this.options.stage, this.options.region
    ).then((ret) => {
      this.serverless.cli.log(`DECRYPTED ${secretName}::${stage}::${region}: ${ret.Plaintext.toString('utf-8')}`);
    });
  },
};
