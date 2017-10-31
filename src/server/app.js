'use strict';

const http = require('http');
const fs = require('fs');
const open = require('open');
const getPort = require('get-port');
const express = require('express')
const app = express()

app.set('view engine', 'hbs');

require('./routes')(app);

getPort().then(PORT => {
  app.listen(PORT, function() {
    console.log('Example app listening on port ', PORT);
    open(`http://localhost:${PORT}`);
  });
});
