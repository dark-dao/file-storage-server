'use strict';
var siege = require('siege');
siege()
  .on(5007)
  // .concurrent(5)
  .for(500).times
  .get('/file/e3955153-ab38-4c3e-b60e-ac375dd2fa91')
  .attack();
