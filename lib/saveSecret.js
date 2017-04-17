'use strict';

const BbPromise = require('bluebird');
const fs = require('fs');

module.exports = {
  saveSecret() {
    if (!this.options.save) {
      return BbPromise.resolve();
    }

    let secrets = {};

    if (fs.existsSync(this.secret_file)) {
      secrets = JSON.parse(fs.readFileSync(this.secret_file, 'utf8'));
    }

    this.results.forEach((result) => {
      let {name, stage, region, encrypted} = result;

      if (secrets[name]        === undefined) { secrets[name]        = { }; }
      if (secrets[name][stage] === undefined) { secrets[name][stage] = { }; }

      secrets[name][stage][region] = encrypted;
    });

    fs.writeFileSync(this.secret_file, JSON.stringify(secrets, null, 2));

    return BbPromise.resolve();
  },
};
