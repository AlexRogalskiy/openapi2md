'use strict';

var _ = require('lodash');
var fs = require('fs');
var Handlebars = require('handlebars');

var httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch'];

var helpers = require('../handlebars/helpers');
Object.keys(helpers).forEach(function(name) {
  Handlebars.registerHelper(name, helpers[name]);
});

var handlebarsDir = __dirname + '/../handlebars'
var partialsDir = handlebarsDir + '/partials';
var partials = [
  'datatype',
  'list-of-labels',
  'model',
  'operation',
  'parameter-row',
  'parameters',
  'path',
  'paths',
  'request-body',
  'response',
  'responses',
  'security'
];
partials.forEach(function(name) {
  var partial = fs.readFileSync(partialsDir + '/' + name + '.hbs', 'utf8');
  Handlebars.registerPartial(name, partial);
});

var template = Handlebars.compile(fs.readFileSync(handlebarsDir + '/main.hbs', 'utf8'));
module.exports.convert = function(spec) {
  return template(preprocess(spec));
};

function preprocess(spec) {
 var copy = _.cloneDeep(spec);
 var tagsByName = _.keyBy(copy.tags, 'name');

 copy.tags = copy.tags || [];

 // The "body"-parameter in each operation is stored in a
 // separate field "_request_body".
 if (copy.paths) {
   Object.keys(copy.paths).forEach(function(pathName) {
     var path = copy.paths[pathName];
     var pathParameters = path.parameters || [];
     Object.keys(path).forEach(function(method) {
       if (httpMethods.indexOf(method) < 0) {
         delete path[method];
         return;
       }
       var operation = path[method];
       operation.path = pathName;
       operation.method = method;
       // Draw links from tags to operations referencing them
       var operationTags = operation.tags || ['default'];
       operationTags.forEach(function(tag) {
         if (!tagsByName[tag]) {
           // New implicit declaration of tag not defined in global "tags"-object
           // https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#user-content-swaggerTags
           var tagDefinition = {
             name: tag,
             operations: []
           };
           tagsByName[tag] = tagDefinition;
           copy.tags.push(tagDefinition);
         }
         if (tagsByName[tag]) {
           tagsByName[tag].operations = tagsByName[tag].operations || [];
           tagsByName[tag].operations.push(operation);
         }
       });
       // Join parameters with path-parameters
       operation.parameters = (operation.parameters || [])
         .concat(pathParameters)
         .filter(function(param) {
           if (param.in === 'body') {
             operation._request_body = param;
             return false;
           }
           return true;
         });
       // Show body section, if either a body-parameter or a consumes-property is present.
       operation._show_requst_body_section = operation._request_body || operation.consumes;
     });
   });
   // If there are multiple tags, we show the tag-based summary
   copy.showTagSummary = copy.tags.length > 1;
 }
 return copy;
};
