#!/usr/bin/env node

var chalk = require('chalk');
// var debug = require('debug')('openapi2md:cli');
var fs = require('fs');
var process = require('process');
var program = require('commander')
var Q = require('q');
var request = require('request');
var yaml = require('js-yaml');

var _package = require('../package');

program
  .version(_package.version)
  .usage('[options] <file>')
  .description(_package.description)
  .option('-o, --output <path>', 'output file path')
  .parse(process.argv)

load(program.args.length ? program.args[0] : undefined)
  .then(require('../lib/index').convert)
  .then(function(output) {
    // TODO: --output file
    console.log(output); // eslint-disable-line no-console
  })
  .catch(function(error) {
    console.error(chalk.red(error)); // eslint-disable-line no-console
  })
  .done();

function load(arg) {
  var deferred = Q.defer();
  if (arg === undefined || arg === '-') {
    // stdin
    var buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
      buf += chunk;
    });
    process.stdin.on('end', function() {
      deferred.resolve(buf);
    }).resume();
  } else if (arg.match(/^https?:\/\//)) {
    // http request
    request(arg, function(error, response, body) {
      if (error) {
        deferred.reject(error);
      } else if (response.statusCode === 200) {
        deferred.resolve(body);
      } else {
        deferred.reject('unexpected status code '+ response.statusCode);
      }
    });
  } else {
    // file path
    fs.readFile(arg, 'utf8', deferred.makeNodeResolver());
  }
  return deferred.promise.then(function(data) {
    return yaml.safeLoad(data, {json: true});
  });
}
