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

      let data = { [stage]: { [name]: { [region]: encrypted } } };
      Object.assign(secrets, data);
    });

    fs.writeFileSync(this.secret_file, JSON.stringify(secrets, null, 2));

    return BbPromise.resolve();
  },
};
