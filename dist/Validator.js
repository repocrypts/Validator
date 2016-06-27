'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Rules = require('./Rules');

var _Rules2 = _interopRequireDefault(_Rules);

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
        key: 'getErrors',
        value: function getErrors() {
            return this.errors;
        }
    }, {
        key: 'parseRules',
        value: function parseRules(rules) {
            var self = this;
            var arr = [];

            rules.forEach(function (item) {
                arr.push({
                    name: item.name,
                    rules: self.parseEachRule(item.rules)
                });
            });

            return arr;
        }
    }, {
        key: 'parseEachRule',
        value: function parseEachRule(rule) {
            var self = this;
            var arr = [];

            rule.split('|').forEach(function (ruleAndArgs) {
                var args = ruleAndArgs.split(':');
                arr.push({
                    name: self.titleCase(args[0]),
                    params: args[1] ? args[1].split(',') : []
                });
            });

            return arr;
        }
    }, {
        key: 'titleCase',
        value: function titleCase(str, delimiter) {
            delimiter = delimiter || ' ';
            return str.split(delimiter).map(function (item) {
                return item[0].toUpperCase() + item.slice(1);
            }).join('');
        }
    }, {
        key: 'snakeCase',
        value: function snakeCase(str, delimiter) {
            delimiter = delimiter || '_';
            return str.replace(/((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))(?=[A-Z])/, '$1' + delimiter).toLowerCase();
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
            var self = this;
            var key = self.snakeCase(rule.name);
            var msg = self.customMessages[name + '.' + key];
            msg = msg || _Messages2.default[key];
            if (msg) {
                msg = msg.replace(':ATTR', name.toUpperCase()).replace(':Attr', self.titleCase(name)).replace(':attr', name);
            } else {
                msg = '';
            }

            // call replacer
            var replacer = _Replacers2.default['replace' + rule.name];
            if (typeof replacer === 'function') {
                msg = replacer.apply(_Replacers2.default, [msg, name, rule.name, rule.params]);
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
        key: 'validate',
        value: function validate(name, rule) {
            var method = _Rules2.default['validate' + rule.name];
            var value = this.getValue(name);

            if (typeof method === 'function') {
                return method.apply(_Rules2.default, [name, value, rule.params]);
            }

            return false;
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