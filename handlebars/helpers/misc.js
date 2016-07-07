var Handlebars = require('handlebars')

module.exports = {
  /**
   * Converts a string to uppercase
   * @name toUpperCase
   * @param {string} value the input string
   * @returns {string} the uppercase string
   * @api public
   */
  toUpperCase: function(value) {
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
  eachSorted: function(context, options) {
    var ret = ''
    var data
    if (typeof context !== 'object') {
      return ret
    }
    var keys = Object.keys(context)
    keys.sort(function(a, b) {
      // http://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
      a = String(a).toLowerCase()
      b = String(b).toLowerCase()
      if (a === b) return 0
      if (a > b) return 1
      return -1
    }).forEach(function(key, index) {
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
  equal: function(value1, value2) {
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
  ifeq: function(v1, v2, options) {
    // http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
    if (v1 === v2) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  json: function(value) {
    if (!value) {
      return ''
    }
    var schemaString = require('json-stable-stringify')(value, {space: 4})
    return '```json\r\n' + schemaString + '\n```';
  },

  ifcontains: function(array, object, options) {
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
  htmlId: function(value) {
    return value.replace(/[^A-Za-z0-9-_:.]/g, '-')
  }
};
