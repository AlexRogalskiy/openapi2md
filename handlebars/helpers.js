var jsonschema = require('./helpers/jsonschema');
var misc = require('./helpers/misc');
var swagger = require('./helpers/swagger');

module.exports = {
  'toUpperCase': misc.toUpperCase,
  'eachSorted': misc.eachSorted,
  'equal': misc.equal,
  'ifeq': misc.ifeq,
  'json': misc.json,
  'ifcontains': misc.ifcontains,
  'htmlId': misc.htmlId,

  'swagger--collection-format': swagger.collectionFormat,
  'swagger--response-code': swagger.responseCode,

  'json-schema--datatype': jsonschema.dataType,
  'json-schema--subschema-name': jsonschema.subschemaName,
  'json-schema--resolve-ref': jsonschema.resolveRef,
  'json-schema--range': jsonschema.range
};
