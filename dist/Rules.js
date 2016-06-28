'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rules = function () {
    function Rules() {
        _classCallCheck(this, Rules);
    }

    _createClass(Rules, [{
        key: 'constractor',
        value: function constractor() {
            this.validator = null;
        }
    }], [{
        key: 'setValidator',
        value: function setValidator(validator) {
            this.validator = validator;
        }
    }, {
        key: 'data',
        value: function data(name) {
            return this.validator.data[name];
        }
    }, {
        key: 'isImplicit',
        value: function isImplicit(rule) {
            return this.implicitRules.indexOf(rule) > -1;
        }
    }, {
        key: 'hasRule',
        value: function hasRule(name, rules) {
            return rules.indexOf(name) >= 0;
        }
    }, {
        key: 'requireParameterCount',
        value: function requireParameterCount(count, params, rule) {
            if (params.length < count) {
                console.error('Validation rule ' + rule + ' requires at least ' + count + ' parameters');
            }
        }
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
            return this.data[name] !== 'undefined';
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

            var i = 0;
            var re = params[0];

            if (!(re instanceof RegExp)) {
                re = re.replace(/\/?([^\/]*)\/?/, "$1");
                re = new RegExp(re);
            }

            for (var i = 0; i < value.length; i++) {
                if (value[i] !== null && value[i].match(re) !== null) {
                    return true;
                }
            }

            return false;
        }
    }, {
        key: 'validateRegex',
        value: function validateRegex(name, value, params) {
            return this.validateMatch(name, value, params);
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

            if (hasNumeric && !isNaN(parseInt(value))) {
                return value;
            }

            // for array and string
            return value.length;
        }
    }, {
        key: 'validateIn',
        value: function validateIn(name, value, params) {
            this.requireParameterCount(1, params, 'in');

            return params.indexOf(value) >= 0;
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
            var params = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            return this.validateMatch(name, value, /^-?\d+(\.\d*)?$/);
        }
    }, {
        key: 'validateInteger',
        value: function validateInteger(name, value) {
            var params = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            return this.validateMatch(name, value, /^-?\d+$/);
        }
    }, {
        key: 'validateEmail',
        value: function validateEmail(name, value) {
            var params = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            return this.validateMatch(name, value, /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i);
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
    }]);

    return Rules;
}();

exports.default = Rules;