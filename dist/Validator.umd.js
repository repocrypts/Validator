(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Validator"] = factory();
	else
		root["Validator"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Rules = __webpack_require__(1);
	
	var _Rules2 = _interopRequireDefault(_Rules);
	
	var _Messages = __webpack_require__(2);
	
	var _Messages2 = _interopRequireDefault(_Messages);
	
	var _Replacers = __webpack_require__(3);
	
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
	        this.validations = new _Rules2.default(this);
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
	                    name: self.titleCase(args[0], '_'),
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

/***/ },
/* 1 */
/***/ function(module, exports) {

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

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _accepted$active_url$;
	
	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	
	exports.default = (_accepted$active_url$ = {
	    "accepted": "The :attr must be accepted.",
	    "active_url": "The :attr is not a valid URL.",
	    "after": "The :attr must be a date after :date.",
	    "alpha": "The :attr may only contain letters.",
	    "alpha_dash": "The :attr may only contain letters, numbers, and dashes.",
	    "alpha_num": "The :attr may only contain letters and numbers.",
	    "array": "The :attr must have selected elements.",
	    "before": "The :attr must be a date before :date.",
	    "between": "The :attr must be between :min - :max.",
	    "confirmed": "The :attr confirmation does not match.",
	    "count": "The :attr must have exactly :count selected elements.",
	    "countbetween": "The :attr must have between :min and :max selected elements.",
	    "countmax": "The :attr must have less than :max selected elements.",
	    "countmin": "The :attr must have at least :min selected elements.",
	    "date_between": "The :attr must be between :start and :end.",
	    "date_format": "The :attr must have a valid date format.",
	    "different": "The :attr and :other must be different.",
	    "digits": "The :attr must be :digits digits.",
	    "digits_between": "The :attr must be between :min and :max digits.",
	    "email": "The :attr format is invalid",
	    "integer": "The :attr must be an integer",
	    "min": "The :attr must be at least :min characters",
	    "exists": "The selected :attr is invalid.",
	    "greater_than": "The :attr must be > :value",
	    "less_than": "The :attr must be < :value",
	    "image": "The :attr must be an image.",
	    "in": "The selected :attr is invalid."
	}, _defineProperty(_accepted$active_url$, "integer", "The :attr must be an integer."), _defineProperty(_accepted$active_url$, "ip", "The :attr must be a valid IP address."), _defineProperty(_accepted$active_url$, "match", "The :attr format is invalid."), _defineProperty(_accepted$active_url$, "max", "The :attr must not exceed :max."), _defineProperty(_accepted$active_url$, "not_in", "The selected :attr is invalid."), _defineProperty(_accepted$active_url$, "numeric", "The :attr must be a number."), _defineProperty(_accepted$active_url$, "regex", "The :attr format is invalid."), _defineProperty(_accepted$active_url$, "required", "The :attr field is required."), _defineProperty(_accepted$active_url$, "required_if", "The :attr field is required when :other is :value."), _defineProperty(_accepted$active_url$, "required_with", "The :attr field is required when :values is present."), _defineProperty(_accepted$active_url$, "required_without", "The :attr field is required when :values is not present."), _defineProperty(_accepted$active_url$, "same", "The :attr and :other must match."), _defineProperty(_accepted$active_url$, "size", "The :attr must be :size."), _defineProperty(_accepted$active_url$, "unique", "The :attr has already been taken."), _defineProperty(_accepted$active_url$, "url", "The :attr format is invalid."), _accepted$active_url$);

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Replacers = function () {
	  function Replacers() {
	    _classCallCheck(this, Replacers);
	  }
	
	  _createClass(Replacers, null, [{
	    key: 'replaceMin',
	    value: function replaceMin(msg, attr, rule, params) {
	      return msg.replace(':min', params[0]);
	    }
	  }]);
	
	  return Replacers;
	}();
	
	exports.default = Replacers;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=Validator.umd.js.map