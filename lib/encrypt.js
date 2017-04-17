'use strict';

module.exports = {
  encrypt() {
    this.serverless.cli.log(`Secret Name: ${this.options.name}`);
    this.serverless.cli.log(`Plaintext:   ${this.options.text}`);
    this.serverless.cli.log(`Stage:       ${this.options.stage}`);

    let stage = this.options.stage;
    let regions = [ ];
    let config = this.serverless.service.custom['stage_configs'];

    if (this.options.allRegions) {
      let applicableRegions = config[stage]['kms_keys'] || { };
      regions = Object.keys(applicableRegions);
    }
    else if (this.options.region) {
      regions = [ push(this.options.region) ];
    }

    this.serverless.cli.log(`Target Regions: ${regions}`)

    this.results = [ ];

    let self = this;
    let originalRegion = this.options.region;

    return Promise.all(regions.map(function(region) {
      let keyId = config[stage]['kms_keys'][region];
      let params = { KeyId: keyId, Plaintext: self.options.text };

      // Trick SLS into using the region we want
      self.options.region = region;

      return self.provider.request('KMS', 'encrypt', params).then((ret) => {
        let encrypted = ret.CiphertextBlob.toString('base64');
        self.serverless.cli.log(`RESULT for ${stage}::${region}  --  ${encrypted}`);
        self.results.push({ name:self.options.name, stage:stage, region:region, encrypted:encrypted });
      });
    })).then(function() {
      self.options.region = originalRegion;
    });
  },
};
