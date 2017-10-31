// Set up routes for the app
const express = require('express')
const path = require('path');

module.exports = function(app) {
  app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

  app.use(function(req, res, next) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  });
}
