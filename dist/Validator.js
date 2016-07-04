'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Messages = require('./Messages');

var _Messages2 = _interopRequireDefault(_Messages);

var _Replacers = require('./Replacers');

var _Replacers2 = _interopRequireDefault(_Replacers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Validator = function () {
    function Validator(data, rules) {
        var customMessages = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        _classCallCheck(this, Validator);

        this.data = data;
        this.rules = this.parseRules(rules);
        this.errors = [];
        this.customMessages = customMessages;
    }

    _createClass(Validator, [{
        key: 'isImplicit',
        value: function isImplicit(rule) {
            return this.implicitRules.indexOf(rule) > -1;
        }
    }, {
        key: 'hasData',
        value: function hasData(name) {
            return typeof this.data[name] !== 'undefined';
        }
    }, {
        key: 'hasRule',
        value: function hasRule(name, rules) {
            return this.getRule(name, rules) !== null;
        }
    }, {
        key: 'getRule',
        value: function getRule(name, rulesToCheck) {
            var a = this.rules.filter(function (item) {
                return item.name === name;
            });

            if (a.length === 0) {
                return null;
            } else {
                a = a[0];
            }

            if (!Array.isArray(rulesToCheck)) {
                rulesToCheck = [rulesToCheck];
            }

            var b = a.rules.filter(function (rule) {
                return rulesToCheck.indexOf(rule.name) >= 0;
            });

            return b.length === 0 ? null : [b[0].name, b[0].params];
        }
    }, {
        key: 'requireParameterCount',
        value: function requireParameterCount(count, params, rule) {
            if (params.length < count) {
                throw new Error('Validation rule ' + rule + ' requires at least ' + count + ' parameters');
            }
        }
    }, {
        key: 'parseRules',
        value: function parseRules(rules) {
            var self = this;
            var arr = [];

            rules.forEach(function (item) {
                arr.push({
                    name: item.name,
                    rules: self.parseItemRules(item.rules)
                });
            });

            return arr;
        }
    }, {
        key: 'parseItemRules',
        value: function parseItemRules(rule) {
            var self = this;
            var arr = [];

            rule.split('|').forEach(function (ruleAndArgs) {
                if (ruleAndArgs.trim()) {
                    var args = ruleAndArgs.split(':');
                    arr.push({
                        name: self.titleCase(args[0], '_'),
                        params: args[1] ? args[1].split(',') : []
                    });
                }
            });

            return arr;
        }
    }, {
        key: 'titleCase',
        value: function titleCase(str, delimiter) {
            delimiter = delimiter || ' ';
            return str.split(delimiter).map(function (item) {
                return item[0].toUpperCase() + item.slice(1).toLowerCase();
            }).join('');
        }
    }, {
        key: 'snakeCase',
        value: function snakeCase(str, delimiter) {
            delimiter = delimiter || '_';
            return str.replace(/((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))(?=[A-Z])/g, '$1' + delimiter).toLowerCase();
        }
    }, {
        key: 'getValue',
        value: function getValue(name) {
            if (typeof this.data[name] === 'undefined') {
                return '';
            }

            return this.data[name];
        }
    }, {
        key: 'passes',
        value: function passes() {
            var self = this;
            var allValid = true;
            this.errors = [];

            this.rules.forEach(function (item) {
                var name = item.name.toLowerCase();
                item.rules.forEach(function (rule) {
                    var isValid = self.validate(name, rule);
                    allValid = allValid && isValid;

                    if (!isValid) {
                        // console.log(rule.name, rule.params + '** invalid')
                        self.errors.push({
                            name: name,
                            rule: rule.name,
                            message: self.getErrorMsg(name, rule)
                        });
                    }
                });
            });

            return allValid;
        }
    }, {
        key: 'getErrorMsg',
        value: function getErrorMsg(name, rule) {
            var key = this.snakeCase(rule.name);
            var msg = this.getMessage(name, rule);

            return this.doReplacements(msg, name, rule);
        }
    }, {
        key: 'getMessage',
        value: function getMessage(name, rule) {
            var key = this.snakeCase(rule.name);
            var msg = this.customMessages[name + '.' + key];

            if (typeof msg !== 'undefined') {
                return msg;
            }

            // message might has sub-rule
            if ((typeof msg === 'undefined' ? 'undefined' : _typeof(msg)) === 'object') {
                var type = this.getDataType(name);
                msg = _Messages2.default[key][type];
            }

            return typeof msg === 'undefined' ? '' : msg;
        }
    }, {
        key: 'getDataType',
        value: function getDataType(name) {
            if (this.hasRule(name, this.numericRules)) {
                return 'numeric';
            } else if (this.hasRule(name, ['Array'])) {
                return 'array';
            }
            /* SKIP file type */

            return 'string';
        }
    }, {
        key: 'doReplacements',
        value: function doReplacements(msg, name, rule) {
            if (msg.trim() === '') {
                return '';
            }

            msg = msg.replace(':ATTR', name.toUpperCase()).replace(':Attr', this.titleCase(name)).replace(':attr', name);

            // call replacer
            var replacer = _Replacers2.default['replace' + rule.name];
            if (typeof replacer === 'function') {
                msg = replacer.apply(_Replacers2.default, [msg, name, rule.name, rule.params]);
            } else {
                throw new Error(replacer + ' function does not exist.');
            }

            return msg;
        }
    }, {
        key: 'fails',
        value: function fails() {
            return !this.passes();
        }
    }, {
        key: 'hasError',
        value: function hasError() {
            var name = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            if (name === null) {
                return this.errors.length > 0;
            }

            var errors = this.errors.filter(function (error) {
                return error.name === name.toLowerCase();
            });

            return errors.length > 0;
        }
    }, {
        key: 'getErrors',
        value: function getErrors() {
            return this.errors;
        }
    }, {
        key: 'validate',
        value: function validate(name, rule) {
            var method = this['validate' + rule.name];
            var value = this.getValue(name);

            if (typeof method === 'function') {
                return method.apply(this, [name, value, rule.params]);
            } else {
                console.error('"' + rule.name + '" validation rule does not exist!');
            }

            return false;
        }

        /** Validation Rules **/

    }, {
        key: 'validateRequired',
        value: function validateRequired(name, value, params) {
            if (value === null) {
                return false;
            } else if (typeof value === 'string' && value.trim() === '') {
                return false;
            } else if (Array.isArray(value) && value.length < 1) {
                return false;
            }

            return true;
        }
    }, {
        key: 'validatePresent',
        value: function validatePresent(name, value, params) {
            return typeof this.data[name] !== 'undefined';
        }
    }, {
        key: 'validateFilled',
        value: function validateFilled(name, value) {
            if (this.hasData(name)) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'anyFailingRequired',
        value: function anyFailingRequired(names) {
            var self = this;
            var result = false;

            names.forEach(function (name) {
                if (!self.validateRequired(name, self.getValue(name))) {
                    result = true;
                    return;
                }
            });

            return result;
        }
    }, {
        key: 'allFailingRequired',
        value: function allFailingRequired(names) {
            var self = this;
            var result = true;

            names.forEach(function (name) {
                if (self.validateRequired(name, self.getValue(name))) {
                    result = false;
                    return;
                }
            });

            return result;
        }
    }, {
        key: 'validateRequiredWith',
        value: function validateRequiredWith(name, value, params) {
            if (!this.allFailingRequired(params)) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'validateRequiredWithAll',
        value: function validateRequiredWithAll(name, value, params) {
            if (!this.anyFailingRequired(params)) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'validateRequiredWithout',
        value: function validateRequiredWithout(name, value, params) {
            if (this.anyFailingRequired(params)) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'validateRequiredWithoutAll',
        value: function validateRequiredWithoutAll(name, value, params) {
            if (this.allFailingRequired(params)) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'validateRequiredIf',
        value: function validateRequiredIf(name, value, params) {
            this.requireParameterCount(2, params, 'required_if');

            var data = this.getValue(params[0]);
            if (typeof data === 'boolean') {
                data = data.toString();
            }

            var values = params.slice(1);

            if (values.indexOf(data) >= 0) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'validateRequiredUnless',
        value: function validateRequiredUnless(name, value, params) {
            this.requireParameterCount(2, params, 'required_unless');

            var data = this.getValue(params[0]);

            var values = params.slice(1);

            if (values.indexOf(data) < 0) {
                return this.validateRequired(name, value);
            }

            return true;
        }
    }, {
        key: 'getPresentCount',
        value: function getPresentCount(names) {
            var self = this;
            var count = 0;

            names.forEach(function (name) {
                if (typeof self.data[name] !== 'undefined') {
                    count++;
                }
            });

            return count;
        }
    }, {
        key: 'validateMatch',
        value: function validateMatch(name, value, params) {
            if (!(params instanceof Array)) {
                params = [params];
            }

            if (!(value instanceof Array)) {
                value = [value];
            }

            var re = params[0];

            if (!(re instanceof RegExp)) {
                re = re.split('/');
                re = new RegExp(re[1], re[2]);
            }

            return re.test(value);
        }
    }, {
        key: 'validateRegex',
        value: function validateRegex(name, value, params) {
            return this.validateMatch(name, value, params);
        }
    }, {
        key: 'validateAccepted',
        value: function validateAccepted(name, value) {
            var acceptable = ['yes', 'on', '1', 1, true, 'true'];

            return this.validateRequired(name, value) && acceptable.indexOf(value) >= 0;
        }
    }, {
        key: 'validateArray',
        value: function validateArray(name, value) {
            if (typeof this.data[name] === 'undefined') {
                return true;
            }

            return value === null || Array.isArray(value);
        }
    }, {
        key: 'validateConfirmed',
        value: function validateConfirmed(name, value) {
            return this.validateSame(name, value, [name + '_confirmation']);
        }
    }, {
        key: 'validateSame',
        value: function validateSame(name, value, params) {
            this.requireParameterCount(1, params, 'same');

            var other = this.data[params[0]];

            return typeof other !== 'undefined' && value === other;
        }
    }, {
        key: 'validateDifferent',
        value: function validateDifferent(name, value, params) {
            this.requireParameterCount(1, params, 'different');

            var other = this.data[params[0]];

            return typeof other !== 'undefined' && value !== other;
        }
    }, {
        key: 'validateDigits',
        value: function validateDigits(name, value, params) {
            this.requireParameterCount(1, params, 'digits');

            return this.validateNumeric(name, value) && value.toString().length == params[0];
        }
    }, {
        key: 'validateDigitsBetween',
        value: function validateDigitsBetween(name, value, params) {
            this.requireParameterCount(2, params, 'digits_between');

            var len = value.toString().length;

            return this.validateNumeric(name, value) && len >= params[0] && len <= params[1];
        }
    }, {
        key: 'validateSize',
        value: function validateSize(name, value, params) {
            this.requireParameterCount(1, params, 'size');

            return this.getSize(name, value) == params[0];
        }
    }, {
        key: 'validateBetween',
        value: function validateBetween(name, value, params) {
            this.requireParameterCount(2, params, 'between');

            var size = this.getSize(name, value);

            return size >= params[0] && size <= params[1];
        }
    }, {
        key: 'validateMin',
        value: function validateMin(name, value, params) {
            this.requireParameterCount(1, params, 'min');

            return this.getSize(name, value) >= params[0];
        }
    }, {
        key: 'validateMax',
        value: function validateMax(name, value, params) {
            this.requireParameterCount(1, params, 'max');

            return this.getSize(name, value) <= params[0];
        }
    }, {
        key: 'getSize',
        value: function getSize(name, value) {
            var hasNumeric = this.hasRule(name, this.numericRules);

            if (hasNumeric && !isNaN(parseFloat(value))) {
                return parseFloat(value);
            }

            // for array and string
            return value.length;
        }
    }, {
        key: 'validateIn',
        value: function validateIn(name, value, params) {
            if (Array.isArray(value) && this.hasRule(name, 'Array')) {
                var arr = this.arrayDiff(value, params);
                return arr.length === 0;
            }

            return params.indexOf(value) >= 0;
        }
    }, {
        key: 'arrayDiff',
        value: function arrayDiff(arr1, arr2) {
            var diff = [];
            arr1.forEach(function (item) {
                if (arr2.indexOf(item) < 0) {
                    diff.push(item);
                }
            });
            return diff;
        }
    }, {
        key: 'validateNotIn',
        value: function validateNotIn(name, value, params) {
            this.requireParameterCount(1, params, 'not_in');

            return !this.validateIn(name, value, params);
        }
    }, {
        key: 'validateNumeric',
        value: function validateNumeric(name, value) {
            return this.validateMatch(name, value, /^-?\d+(\.\d*)?$/);
        }
    }, {
        key: 'validateInteger',
        value: function validateInteger(name, value) {
            return this.validateMatch(name, value, /^-?\d+$/);
        }
    }, {
        key: 'validateString',
        value: function validateString(name, value) {
            if (!this.hasData(name)) {
                return true;
            }

            return value === null || typeof value === 'string';
        }
    }, {
        key: 'validateEmail',
        value: function validateEmail(name, value) {
            return this.validateMatch(name, value, /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i);
        }
    }, {
        key: 'validateIp',
        value: function validateIp(name, value) {
            var segments = value.split('.');

            if (segments.length === 4 && this.validateBetween(name, segments[0], [1, 255]) && this.validateBetween(name, segments[1], [0, 255]) && this.validateBetween(name, segments[2], [0, 255]) && this.validateBetween(name, segments[3], [1, 255])) {
                return true;
            }

            return false;
        }
    }, {
        key: 'validateUrl',
        value: function validateUrl(name, value) {
            return this.validateMatch(name, value, /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i);
        }
    }, {
        key: 'validateAlpha',
        value: function validateAlpha(name, value) {
            return this.validateMatch(name, value, /^([a-z])+$/i);
        }
    }, {
        key: 'validateAlphaNum',
        value: function validateAlphaNum(name, value) {
            return this.validateMatch(name, value, /^([a-z0-9])+$/i);
        }
    }, {
        key: 'validateAlphaDash',
        value: function validateAlphaDash(name, value) {
            return this.validateMatch(name, value, /^([a-z0-9_\-])+$/i);
        }
    }, {
        key: 'validateBefore',
        value: function validateBefore(name, value, params) {
            this.requireParameterCount(1, params, 'before');

            if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
                return false;
            }

            var date = this.hasData(params[0]) ? this.getValue(params[0]) : params[0];

            if (!this.validateDate(name, date)) {
                console.error(params[0] + ' does not appear to be a date.');
                return false;
            }

            return Date.parse(value) < Date.parse(date);
        }
    }, {
        key: 'validateAfter',
        value: function validateAfter(name, value, params) {
            this.requireParameterCount(1, params, 'after');

            if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
                return false;
            }

            var date = this.hasData(params[0]) ? this.getValue(params[0]) : params[0];

            if (!this.validateDate(name, date)) {
                console.error(params[0] + ' does not appear to be a date.');
                return false;
            }

            return Date.parse(value) > Date.parse(date);
        }
    }, {
        key: 'validateDate',
        value: function validateDate(name, value) {
            if (value instanceof Date) {
                return true;
            }

            if (typeof value !== 'string' && typeof value !== 'number') {
                return false;
            }

            return !isNaN(Date.parse(value));
        }
    }, {
        key: 'validateBoolean',
        value: function validateBoolean(name, value) {
            if (!this.hasData(name)) {
                return true;
            }

            var acceptable = [true, false, 0, 1, '0', '1'];

            return value === null || acceptable.indexOf(value) >= 0;
        }
    }, {
        key: 'validateJson',
        value: function validateJson(name, value) {
            try {
                JSON.parse(value);
                return true;
            } catch (err) {
                return false;
            }
        }
    }, {
        key: 'dateRules',
        get: function get() {
            return ['Before', 'After', 'DateBetween'];
        }
    }, {
        key: 'sizeRules',
        get: function get() {
            return ['Size', 'Between', 'Min', 'Max'];
        }
    }, {
        key: 'numericRules',
        get: function get() {
            return ['Numeric', 'Integer'];
        }
    }, {
        key: 'implicitRules',
        get: function get() {
            return ['Required', 'Filled', 'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll', 'RequiredIf', 'RequiredUnless', 'Accepted', 'Present'];
        }
    }, {
        key: 'dependentRules',
        get: function get() {
            return ['RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll', 'RequiredIf', 'RequiredUnless', 'Confirmed', 'Same', 'Different', 'Unique', 'Before', 'After'];
        }
    }], [{
        key: 'make',
        value: function make(data, rules) {
            var customMessages = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

            return new Validator(data, rules, customMessages);
        }
    }]);

    return Validator;
}();

exports.default = Validator;