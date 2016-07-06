var Handlebars = require('handlebars')
var util = require('util');

module.exports = {
  /**
   * Converts a string to uppercase
   * @name toUpperCase
   * @param {string} value the input string
   * @returns {string} the uppercase string
   * @api public
   */
  'toUpperCase': function (value) {
    return value ? value.toUpperCase() : ''
  },
  /**
   * This block-helper can be used to iterate objects sorted by key. It behaves like the built-in
   * `{{#each ...}}`-helper except that it can only be used for objects and the output is in a
   * deterministic order (i.e. sorted).
   *
   * Example template:
   *
   * ```handlebars
   * {{#eachSorted obj}}
   *    {{@index}} of {{@length}}: {{@key}}={{.}}
   * {{/eachSorted}}
   * ```
   *
   * With the data `{ b: 'another one', a: 'first' }`, ignoring newlines and indents, this will output
   *
   * ```text
   * 1 of 2: a=first
   * 2 of 2: b=another one
   * ```
   *
   * The helper will set the following @-values according to the Handlebars documentation:
   * `@first`, `@index`, `@key`, `@last`, `@length`
   * @name eachSorted
   * @returns {string}
   * @api public
   */
  'eachSorted': function (context, options) {
    var ret = ''
    var data
    if (typeof context !== 'object') {
      return ret
    }
    var keys = Object.keys(context)
    keys.sort(function (a, b) {
      // http://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
      a = String(a).toLowerCase()
      b = String(b).toLowerCase()
      if (a === b) return 0
      if (a > b) return 1
      return -1
    }).forEach(function (key, index) {
      if (options.data) {
        data = Handlebars.createFrame(options.data || {})
        data.index = index
        data.key = key
        data.length = keys.length
        data.first = index === 0
        data.last = index === keys.length - 1
      }
      ret = ret + options.fn(context[key], {data: data})
    })
    return ret
  },

  /**
   * Checks whether two values a equal as in (==)
   * @param value1
   * @param value2
   * @returns {boolean}
   */
  'equal': function (value1, value2) {
    return value1 == value2 // eslint-disable-line
  },

  /**
   * Block helper that compares to values. The body is executed if both value equal.
   * Example:
   *
   * ```hbs
   * {{#ifeq value 10}}
   *    Value is 10
   * {{else}}
   *    Value is not 10
   * {{/ifeq}}
   * ```
   *
   * @param {object} `v1` the first value
   * @param {object} `v2` the second value
   */
  'ifeq': function (v1, v2, options) {
    // http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
    if (v1 === v2) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  'json': function (value) {
    if (!value) {
      return ''
    }
    var schemaString = require('json-stable-stringify')(value, {space: 4})
    return '```json\r\n' + schemaString + '\n```';
  },
  'ifcontains': function (array, object, options) {
    if (array && array.indexOf(object) >= 0) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  /**
   * Replace all characters that may not be used in HTML id-attributes by '-'.
   * There is still the restriction that IDs may only start with letters, which
   * is not addressed by this helper.
   */
  'htmlId': function (value) {
    return value.replace(/[^A-Za-z0-9-_:.]/g, '-')
  },

  'swagger--collection-format': function (value, paramName) {
    return {
      'csv': 'comma separated (`' + paramName + '=aaa,bbb`)',
      'ssv': 'space separated (`' + paramName + '=aaa bbb`)',
      'tsv': 'tab separated (`' + paramName + '=aaa\\tbbb`)',
      'pipes': 'pipe separated (`' + paramName + '=aaa|bbb`)',
      'multi': 'multiple parameters (`' + paramName + '=aaa&' + paramName + '=bbb`)'
    }[value]
  },

  'swagger--response-code': function (code) {
    // Comments refer to the section number in rfc2616
    // If an rfc number is specified, the code is
    // documented in the specified rfc.
    return {
      '100': 'Continue', // 10.1.1
      '101': 'Switching Protocols', // 10.1.2
      '200': 'OK', // 10.2.1
      '201': 'Created', // 10.2.2
      '202': 'Accepted', // 10.2.3
      '203': 'Non-Authoritative Information', // 10.2.4
      '204': 'No Content', // 10.2.5
      '205': 'Reset Content', // 10.2.6
      '206': 'Partial Content', // 10.2.7
      '207': 'Multi-status', // rfc4918, 11.1
      '208': 'Already Reported', // rfc5842, 7.1
      '226': 'IM Used', // rfc3229, 10.4.1
      '300': 'Multiple Choices', // 10.3.1
      '301': 'Moved Permanently', // 10.3.2
      '302': 'Found', // 10.3.3
      '303': 'See Other', // 10.3.4
      '304': 'Not Modified', // 10.3.5
      '305': 'Use Proxy', // 10.3.6
      '306': '(Unused)', // 10.3.7
      '307': 'Temporary Redirect', // 10.3.8
      '400': 'Bad Request', // 10.4.1
      '401': 'Unauthorized', // 10.4.2
      '402': 'Payment Required', // 10.4.3
      '403': 'Forbidden', // 10.4.4
      '404': 'Not Found', // 10.4.5
      '405': 'Method Not Allowed', // 10.4.6
      '406': 'Not Acceptable', // 10.4.7
      '407': 'Proxy Authentication Required', // 10.4.8
      '408': 'Request Timeout', // 10.4.9
      '409': 'Conflict', // 10.4.10
      '410': 'Gone', // 10.4.11
      '411': 'Length Required', // 10.4.12
      '412': 'Precondition Failed', // 10.4.13
      '413': 'Request Entity Too Large', // 10.4.14
      '414': 'Request-URI Too Long', // 10.4.15
      '415': 'Unsupported Media Type', // 10.4.16
      '416': 'Requested Range Not Satisfiable', // 10.4.17
      '417': 'Expectation Failed', // 10.4.18
      '421': 'Misdirected Request', // rfc7540, 9.1.2
      '422': 'Unprocessable Entity', // rfc4918, 11.2
      '423': 'Locked', // rfc4918, 11.3
      '424': 'Failed Dependency', // rfc4918, 11.4
      '426': 'Upgrade Required', // rfc2817, 6
      '428': 'Precondition Required', // rfc6585, 3
      '429': 'Too Many Requests', // rfc6585, 4
      '431': 'Request Header Fields Too Large', // rfc6585, 5
      '500': 'Internal Server Error', // 10.5.1
      '501': 'Not Implemented', // 10.5.2
      '502': 'Bad Gateway', // 10.5.3
      '503': 'Service Unavailable', // 10.5.4
      '504': 'Gateway Timeout', // 10.5.5
      '505': 'HTTP Version Not Supported', // 10.5.6
      '506': 'Variant Also Negotiates',
      '507': 'Insufficient Storage', // rfc4918, 11.5
      '508': 'Loop Detected', // rfc5842, 7.2
      '510': 'Not Extended', // rfc2774, 7
      '511': 'Network Authentication Required' // rfc6585, 6
    }[code]
  },

  'json-schema--datatype': dataType,

  /**
   * Extract then name of a subschema from a $ref property
   * @param url
   * @returns {*}
   */
  'json-schema--subschema-name': function (url) {
    return url.replace('#/definitions/', '')
  },

  /**
   * Resolve a (local) json-schema-
   * @param reference
   */
  'json-schema--resolve-ref': function (reference, options) {
    reference = reference.trim()
    if (reference.lastIndexOf('#', 0) < 0) {
      console.warn('Remote references not supported yet. Reference must start with "#" (but was ' + reference + ')')
      return {}
    }
    var components = reference.split('#')
    // var url = components[0]
    var hash = components[1]
    var hashParts = hash.split('/')
    // TODO : Download remote json from url if url not empty
    var current = options.data.root
    hashParts.forEach(function (hashPart) {
      // Traverse schema from root along the path
      if (hashPart.trim().length > 0) {
        if (typeof current === 'undefined') {
          throw new Error("Reference '" + reference + "' cannot be resolved. '" + hashPart + "' is undefined.")
        }
        current = current[hashPart]
      }
    })
    return current
  },
  /**
   *
   * @param range a json-schema object with minimum, maximum, exclusiveMinimum, exclusiveMaximum
   * @param {number} [range.minimum]
   * @param {number} [range.maximum]
   * @param {boolean} [range.minimumExclusive]
   * @param {boolean} [range.maximumExclusive]
   * @param {Handlebars} engine the current handlebars engine
   */
  'json-schema--range': function (range) {
    var hasMinimum = range.minimum || range.minimum === 0
    var hasMaximum = range.maximum || range.maximum === 0

    if (!hasMinimum && !hasMaximum) {
      // There is no range
      return ''
    }

    var numberSet = ''
    if (range.type === 'integer') {
      numberSet = '\u2208 \u2124' // ELEMENT OF - DOUBLE-STRUCK CAPITAL Z
    } else if (range.type === 'number') {
      numberSet = '\u2208 \u211D' // ELEMENT OF - DOUBLE-STRUCK CAPITAL R
    }

    if (hasMinimum && !hasMaximum) {
      return util.format(', { x %s | x %s %d }',
        numberSet,
        range.minimumExclusive ? '>' : '\u2265',
        range.minimum)
    } else if (hasMaximum && !hasMinimum) {
      return util.format(', { x %s | x %s %d }',
        numberSet,
        range.maximumExclusive ? '<' : '\u2264',
        range.maximum)
    } else {
      // if (hasMaxmium && hasMinimum)
      return util.format(', { x %s | %d %s x %s %d }',
        numberSet,
        range.minimum,
        range.minimumExclusive ? '<' : '\u2264',
        range.maximumExclusive ? '<' : '\u2264',
        range.maximum)
    }
  }
};

/**
 * Returns a descriptive string for a datatype
 * @param value
 * @returns {String} a string like <code>string[]</code> or <code>object[][]</code>
 */
function dataType (value) {
  if (!value) return null
  if (value['anyOf'] || value['allOf'] || value['oneOf']) {
    return ''
  }
  if (!value.type) {
    return 'object'
  }
  if (value.type === 'array') {
    if (!value.items) {
      return 'array'
    }
    if (value.items.type) {
      return dataType(value.items) + '[]'
    } else {
      return 'object[]'
    }
  }
  return value.type
}
