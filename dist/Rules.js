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
            var dateRules = ['Before', 'After', 'DateBetween'];
            var sizeRules = ['Size', 'Between', 'Min', 'Max'];
            var numericRules = ['Numeric', 'Integer'];
            var implicitRules = ['Required', 'Filled', 'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll', 'RequiredIf', 'RequiredUnless', 'Accepted', 'Present'];

            var dependentRules = ['RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll', 'RequiredIf', 'RequiredUnless', 'Confirmed', 'Same', 'Different', 'Unique', 'Before', 'After'];
        }
    }], [{
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
        key: 'validateMin',
        value: function validateMin(name, value, params) {
            return value.length >= params[0];
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
    }]);

    return Rules;
}();

exports.default = Rules;