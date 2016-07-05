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
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Messages = __webpack_require__(1);
	
	var _Messages2 = _interopRequireDefault(_Messages);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Validator = function () {
	    function Validator(data, rules) {
	        var customMessages = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
	
	        _classCallCheck(this, Validator);
	
	        this.data = data;
	        this.rules = this.parseRules(rules);
	        this.failedRules = [];
	        this.errors = null;
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
	            this.errors = [];
	            this.failedRules = [];
	
	            this.rules.forEach(function (item) {
	                var name = item.name.toLowerCase();
	                item.rules.forEach(function (rule) {
	                    self.validate(name, rule);
	                });
	            });
	
	            return this.errors.length === 0;
	        }
	    }, {
	        key: 'fails',
	        value: function fails() {
	            return !this.passes();
	        }
	    }, {
	        key: 'valid',
	        value: function valid() {
	            if (!this.errors) {
	                this.passes();
	            }
	
	            var arr = [];
	            for (var key in this.data) {
	                if (!this.hasError(key)) {
	                    arr.push(key);
	                }
	            }
	
	            return arr;
	        }
	    }, {
	        key: 'invalid',
	        value: function invalid() {
	            if (!this.errors) {
	                this.passes();
	            }
	
	            var arr = [];
	            for (var key in this.data) {
	                if (this.hasError(key)) {
	                    arr.push(key);
	                }
	            }
	
	            return arr;
	        }
	    }, {
	        key: 'getErrorMsg',
	        value: function getErrorMsg(name, rule) {
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
	
	            msg = _Messages2.default[key];
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
	            var replacer = this['replace' + rule.name];
	            if (typeof replacer === 'function') {
	                msg = replacer.apply(this, [msg, name, rule.name, rule.params]);
	            }
	
	            return msg;
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
	            var value = this.getValue(name);
	            var method = this['validate' + rule.name];
	
	            if (typeof method !== 'function') {
	                console.error('"' + rule.name + '" validation rule does not exist!');
	            }
	
	            // return method.apply(this, [name, value, rule.params])
	            if (!method.apply(this, [name, value, rule.params])) {
	                this.addFailure(name, rule);
	            }
	        }
	        /*
	            isValidatable(rule, name, value) {
	                return this.presentOrRuleIsImplicit(rule, name, value) &&
	                       this.passesOptionalCheck(name) &&
	                       this.hasNotFailedPreviousRuleIfPresenceRule(rule, name)
	            }
	        
	            presentOrRuleIsImplicit(rule, name, value) {
	                return this.validateRequired(name, value) || this.isImplicit(rule)
	            }
	        
	            passesOptionalCheck(name) {
	                return true
	            }
	        
	            hasNotFailedPreviousRuleIfPresenceRule(rule, name) {
	                return true
	            }
	        */
	
	    }, {
	        key: 'addFailure',
	        value: function addFailure(name, rule) {
	            this.addError(name, rule);
	
	            this.failedRules.push({
	                name: name,
	                rule: rule.name,
	                params: rule.params
	            });
	        }
	    }, {
	        key: 'addError',
	        value: function addError(name, rule) {
	            var msg = this.getMessage(name, rule);
	
	            msg = this.doReplacements(msg, name, rule);
	
	            this.errors.push({
	                name: name,
	                rule: rule.name,
	                message: msg
	            });
	        }
	
	        /** Validation Rules **/
	
	    }, {
	        key: 'validateSometimes',
	        value: function validateSometimes() {
	            return true;
	        }
	    }, {
	        key: 'validateBail',
	        value: function validateBail() {
	            return true;
	        }
	    }, {
	        key: 'shouldStopValidating',
	        value: function shouldStopValidating(name) {
	            if (!this.hasRule(name, ['Bail'])) {
	                return false;
	            }
	
	            return this.hasError(name);
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
	
	        /*---- Replacers ----*/
	
	    }, {
	        key: 'strReplace',
	        value: function strReplace(find, replace, string) {
	            if (!Array.isArray(find)) {
	                find = [find];
	            }
	            if (!Array.isArray(replace)) {
	                replace = [replace];
	            }
	            for (var i = 0; i < find.length; i++) {
	                string = string.replace(find[i], replace[i]);
	            }
	
	            return string;
	        }
	    }, {
	        key: 'getDisplayableValue',
	        value: function getDisplayableValue(name, value) {
	            return value;
	        }
	    }, {
	        key: 'getDataNameList',
	        value: function getDataNameList(values) {
	            var names = [];
	
	            for (var key in values) {
	                names.push({
	                    key: this.getDataName(values[key])
	                });
	            }
	
	            return names;
	        }
	    }, {
	        key: 'getDataName',
	        value: function getDataName(name) {
	            return name;
	        }
	    }, {
	        key: 'replaceBetween',
	        value: function replaceBetween(msg, name, rule, params) {
	            return this.strReplace([':min', ':max'], params, msg);
	        }
	    }, {
	        key: 'replaceDifferent',
	        value: function replaceDifferent(msg, name, rule, params) {
	            return this.replaceSame(msg, name, rule, params);
	        }
	    }, {
	        key: 'replaceDigits',
	        value: function replaceDigits(msg, name, rule, params) {
	            return this.strReplace(':digits', params[0], msg);
	        }
	    }, {
	        key: 'replaceDigitsBetween',
	        value: function replaceDigitsBetween(msg, name, rule, params) {
	            return this.replaceBetween(msg, name, rule, params);
	        }
	    }, {
	        key: 'replaceMin',
	        value: function replaceMin(msg, name, rule, params) {
	            return this.strReplace(':min', params[0], msg);
	        }
	    }, {
	        key: 'replaceMax',
	        value: function replaceMax(msg, name, rule, params) {
	            return this.strReplace(':max', params[0], msg);
	        }
	    }, {
	        key: 'replaceIn',
	        value: function replaceIn(msg, name, rule, params) {
	            var self = this;
	            params = params.map(function (value) {
	                return self.getDisplayableValue(name, value);
	            });
	
	            return this.strReplace(':values', params.join(', '), msg);
	        }
	    }, {
	        key: 'replaceNotIn',
	        value: function replaceNotIn(msg, name, rule, params) {
	            return this.replaceIn(msg, name, rule, params);
	        }
	
	        // replaceInArray()
	        // replaceMimes()
	
	    }, {
	        key: 'replaceRequiredWith',
	        value: function replaceRequiredWith(msg, name, rule, params) {
	            params = this.getDataNameList(params);
	
	            return this.strReplace(':values', params.join(' / '), msg);
	        }
	    }, {
	        key: 'replaceRequiredWithAll',
	        value: function replaceRequiredWithAll(msg, name, rule, params) {
	            return this.replaceRequiredWith(msg, name, rule, params);
	        }
	    }, {
	        key: 'replaceRequiredWithout',
	        value: function replaceRequiredWithout(msg, name, rule, params) {
	            return this.replaceRequiredWith(msg, name, rule, params);
	        }
	    }, {
	        key: 'replaceRequiredWithoutAll',
	        value: function replaceRequiredWithoutAll(msg, name, rule, params) {
	            return this.replaceRequiredWith(msg, name, rule, params);
	        }
	    }, {
	        key: 'replaceRequiredIf',
	        value: function replaceRequiredIf(msg, name, rule, params) {
	            params[1] = this.getDisplayableValue(params[0], this.data[params[0]]);
	
	            params[0] = this.getDataName(params[0]);
	
	            return this.strReplace([':other', ':value'], params, msg);
	        }
	    }, {
	        key: 'replaceRequiredUnless',
	        value: function replaceRequiredUnless(msg, name, rule, params) {
	            var other = this.getDataName(params.shift());
	
	            return this.strReplace([':other', ':values'], [other, params.join(', ')], msg);
	        }
	    }, {
	        key: 'replaceSame',
	        value: function replaceSame(msg, name, rule, params) {
	            return this.strReplace(':other', name, msg);
	        }
	    }, {
	        key: 'replaceSize',
	        value: function replaceSize(msg, name, rule, params) {
	            return this.strReplace(':size', params[0], msg);
	        }
	    }, {
	        key: 'replaceBefore',
	        value: function replaceBefore(msg, name, rule, params) {
	            if (isNaN(Date.parse(params[0]))) {
	                return this.strReplace(':date', this.getDataName(params[0]), msg);
	            }
	
	            return this.strReplace(':date', params[0], msg);
	        }
	    }, {
	        key: 'replaceAfter',
	        value: function replaceAfter(msg, name, rule, params) {
	            return this.replaceBefore(msg, name, rule, params);
	        }
	    }, {
	        key: 'dependsOnOtherFields',
	        value: function dependsOnOtherFields(rule) {
	            return this.dependentRules.indexOf(rule);
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    'accepted': 'The :attr must be accepted.',
	    // 'active_url'           : 'The :attr is not a valid URL.',
	    'after': 'The :attr must be a date after :date.',
	    'alpha': 'The :attr may only contain letters.',
	    'alpha_dash': 'The :attr may only contain letters, numbers, and dashes.',
	    'alpha_num': 'The :attr may only contain letters and numbers.',
	    'array': 'The :attr must be an array.',
	    'before': 'The :attr must be a date before :date.',
	    'between': {
	        'numeric': 'The :attr must be between :min and :max.',
	        'file': 'The :attr must be between :min and :max kilobytes.',
	        'string': 'The :attr must be between :min and :max characters.',
	        'array': 'The :attr must have between :min and :max items.'
	    },
	    'boolean': 'The :attr field must be true or false.',
	    'confirmed': 'The :attr confirmation does not match.',
	    'date': 'The :attr is not a valid date.',
	    'date_format': 'The :attr does not match the format :format.',
	    'different': 'The :attr and :other must be different.',
	    'digits': 'The :attr must be :digits digits.',
	    'digits_between': 'The :attr must be between :min and :max digits.',
	    'email': 'The :attr must be a valid email address.',
	    'exists': 'The selected :attr is invalid.',
	    'filled': 'The :attr field is required.',
	    'image': 'The :attr must be an image.',
	    'in': 'The selected :attr is invalid.',
	    'integer': 'The :attr must be an integer.',
	    'ip': 'The :attr must be a valid IP address.',
	    'json': 'The :attr must be a valid JSON string.',
	    'max': {
	        'numeric': 'The :attr may not be greater than :max.',
	        'file': 'The :attr may not be greater than :max kilobytes.',
	        'string': 'The :attr may not be greater than :max characters.',
	        'array': 'The :attr may not have more than :max items.'
	    },
	    'mimes': 'The :attr must be a file of type: :values.',
	    'min': {
	        'numeric': 'The :attr must be at least :min.',
	        'file': 'The :attr must be at least :min kilobytes.',
	        'string': 'The :attr must be at least :min characters.',
	        'array': 'The :attr must have at least :min items.'
	    },
	    'not_in': 'The selected :attr is invalid.',
	    'numeric': 'The :attr must be a number.',
	    'regex': 'The :attr format is invalid.',
	    'required': 'The :attr field is required.',
	    'required_if': 'The :attr field is required when :other is :value.',
	    'required_unless': 'The :attr field is required unless :other is in :values.',
	    'required_with': 'The :attr field is required when :values is present.',
	    'required_with_all': 'The :attr field is required when :values is present.',
	    'required_without': 'The :attr field is required when :values is not present.',
	    'required_without_all': 'The :attr field is required when none of :values are present.',
	    'same': 'The :attr and :other must match.',
	    'size': {
	        'numeric': 'The :attr must be :size.',
	        'file': 'The :attr must be :size kilobytes.',
	        'string': 'The :attr must be :size characters.',
	        'array': 'The :attr must contain :size items.'
	    },
	    'string': 'The :attr must be a string.',
	    // 'timezone'             : 'The :attr must be a valid zone.',
	    // 'unique'               : 'The :attr has already been taken.',
	    'url': 'The :attr format is invalid.'
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=Validator.umd.js.map