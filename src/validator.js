import messages from './messages';

class Validator {
    constructor(data, rules, customMessages = {}, customNames = {}) {
        this.setData(data);
        this.rules = this.parseRules(rules);
        this.failedRules = [];
        this.errors = null;
        this.customRules = {};
        this.customMessages = customMessages;
        this.customNames = customNames;
        this.customValues = {};
    }

    get dateRules() {
        return ['Before', 'After', 'DateBetween'];
    }

    get sizeRules() {
        return ['Size', 'Between', 'Min', 'Max'];
    }

    get numericRules() {
        return ['Numeric', 'Integer'];
    }

    get implicitRules() {
        return [
            'Required',
            'Filled',
            'RequiredWith',
            'RequiredWithAll',
            'RequiredWithout',
            'RequiredWithoutAll',
            'RequiredIf',
            'RequiredUnless',
            'Accepted',
            'Present',
        ];
    }

    get dependentRules() {
        return [
            'RequiredWith',
            'RequiredWithAll',
            'RequiredWithout',
            'RequiredWithoutAll',
            'RequiredIf',
            'RequiredUnless',
            'Confirmed',
            'Same',
            'Different',
            'Unique',
            'Before',
            'After',
        ];
    }

    static make(data, rules, customMessages = [], customNames) {
        return new Validator(data, rules, customMessages, customNames);
    }

    extend(ruleName, callback, customMessage) {
        this.customRules[this.titleCase(ruleName, '_')] = callback;

        if (customMessage) {
            this.customMessages[this.snakeCase(ruleName)] = customMessage;
        }
    }

    setData(data) {
        this.data = data;
    }

    parseRules(rules) {
        let self = this;
        let arr = [];

        for (let key in rules) {
            arr.push({
                name: key,
                rules: self.parseItemRules(rules[key]),
            });
        }
        return arr;
    }

    parseItemRules(itemRules) {
        let self = this;
        let rules = [];

        if (typeof itemRules === 'string') {
            itemRules = itemRules.split('|');
        }

        itemRules.forEach(function (ruleAndArgs) {
            if (ruleAndArgs.trim()) {
                let args = ruleAndArgs.split(':');

                rules.push({
                    name: self.titleCase(args[0], '_'),
                    params: args[1] ? args[0] === 'regex' ? args[1] : args[1].split(',') : [],
                });
            }
        });

        return rules;
    }

    titleCase(str, delimiter) {
        delimiter = delimiter || ' ';
        return str
            .split(delimiter)
            .map(function (item) {
                return item[0].toUpperCase() + item.slice(1).toLowerCase();
            })
            .join('');
    }

    snakeCase(str, delimiter) {
        delimiter = delimiter || '_';
        return str.replace(/(.)(?=[A-Z])/gu, '$1' + delimiter).toLowerCase();
    }

    getValue(name) {
        if (typeof this.data[name] === 'undefined') {
            return '';
        }

        return this.data[name];
    }

    isEmptyObject(obj) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }

    isImplicit(rule) {
        return this.implicitRules.indexOf(rule) > -1;
    }

    hasData(name) {
        return typeof this.data[name] !== 'undefined';
    }

    hasRule(name, rules) {
        return this.getRule(name, rules) !== null;
    }

    getRule(name, rulesToCheck) {
        let a = this.rules.filter(function (item) {
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

        let b = a.rules.filter(function (rule) {
            return rulesToCheck.indexOf(rule.name) >= 0;
        });

        return b.length === 0 ? null : [b[0].name, b[0].params];
    }

    requireParameterCount(count, params, rule) {
        if (params.length < count) {
            throw new Error(
                'Validation rule ' +
                rule +
                ' requires at least ' +
                count +
                ' parameters'
            );
        }
    }

    isEmptyValueAndContainsNullableRule(item) {
        return (
            !this.getValue(item.name) &&
            item.rules.filter((rule) => rule.name === 'Nullable').length > 0
        );
    }

    passes() {
        let self = this;
        this.errors = {};
        this.failedRules = {};

        const hasRequiredFields = this.rules.some(item => (
            item.rules.some(rule => (
                rule.name === 'Required'
            ))
        ))

        if (this.isEmptyObject(this.data) && !hasRequiredFields) {
            return true;
        }

        this.rules.forEach(function (item) {
            let name = item.name;

            if (self.isEmptyValueAndContainsNullableRule(item)) {
                return false;
            }

            item.rules
                .filter((rule) => rule.name !== 'Nullable')
                .forEach(function (rule) {
                    self.validate(name, rule);
                });
        });

        return this.isEmptyObject(this.errors);
    }

    fails() {
        return !this.passes();
    }

    valid() {
        if (this.errors === null) {
            this.passes();
        }

        let arr = [];
        for (let key in this.data) {
            if (!this.hasError(key)) {
                arr.push(key);
            }
        }

        return arr;
    }

    invalid() {
        if (this.errors === null) {
            this.passes();
        }

        let arr = [];
        for (let key in this.errors) {
            arr.push(key);
        }

        return arr;
    }

    getErrorMsg(name, rule) {
        let msg = this.getMessage(name, rule);

        return this.doReplacements(msg, name, rule);
    }

    getMessage(name, rule) {
        // 1) return custom message if defined
        let msg = this.getCustomMessage(name, rule);
        if (typeof msg !== 'object' && typeof msg !== 'undefined') {
            return msg;
        }

        let key = this.snakeCase(rule.name);

        // 2) then, use the default message for that rule, and re-test
        msg = messages[key];

        // 3) check if the message has subtype
        if (typeof msg === 'object') {
            let subtype = this.getDataType(name);
            msg = messages[key][subtype];
        }

        return typeof msg === 'undefined' ? '' : msg;
    }

    /**
     * return user-defined custom message for a given rule, or undefined
     */
    getCustomMessage(name, rule) {
        let ruleName = this.snakeCase(rule.name);
        let msg = this.customMessages[name + '.' + ruleName];

        // first, check for custom message for specific attribute rule
        // then, check for custom message for rule
        return typeof msg === 'undefined' ? this.customMessages[ruleName] : msg;
    }

    getDataType(name) {
        if (this.hasRule(name, this.numericRules)) {
            return 'numeric';
        } else if (this.hasRule(name, ['Array'])) {
            return 'array';
        }
        /* SKIP file type */

        return 'string';
    }

    doReplacements(msg, name, rule) {
        if (msg.trim() === '') {
            return '';
        }

        name = this.getDataName(name);

        msg = msg
            .replace(':ATTR', name.toUpperCase())
            .replace(':Attr', this.titleCase(name))
            .replace(':attr', name);

        // call replacer
        let replacer = this['replace' + rule.name];
        if (typeof replacer === 'function') {
            msg = replacer.apply(this, [msg, name, rule.name, rule.params]);
        }

        return msg;
    }

    validate(name, rule) {
        let value = this.getValue(name);
        let method = this.findRuleMethod(rule);

        // return method.apply(this, [name, value, rule.params])
        if (!method.apply(this, [name, value, rule.params])) {
            this.addFailure(name, rule);
        }
    }

    findRuleMethod(rule) {
        let method = this['validate' + rule.name];
        if (!method) {
            method = this.customRules[rule.name];
        }

        if (typeof method !== 'function') {
            console.error(
                '"' + rule.name + '" validation rule does not exist!'
            );
        }
        return method;
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

    addFailure(name, rule) {
        this.addError(name, rule);

        if (typeof this.failedRules[name] === 'undefined') {
            this.failedRules[name] = {};
        }
        this.failedRules[name][rule.name] = rule.params;
    }

    addError(name, rule) {
        // if (!Object.keys(this.data).find((data) => data === name)) {
        //     return;
        // }

        let msg = this.getMessage(name, rule);

        if (typeof msg === 'object') {
            console.log('***** ', JSON.stringify(rule), JSON.stringify(msg));
        }
        msg = this.doReplacements(msg, name, rule);

        if (!this.hasError(name)) {
            this.errors[name] = [];
        }

        this.errors[name].push(msg);
    }

    hasError(name = null) {
        if (name === null) {
            return !this.isEmptyObject(this.errors);
        }

        return this.getError(name) === null ? false : true;
    }

    getError(name) {
        return typeof this.errors[name] === 'undefined'
            ? null
            : this.errors[name];
    }

    getErrors() {
        return this.errors;
    }

    /** Validation Rules **/

    validateSometimes() {
        return true;
    }

    validateBail() {
        return true;
    }

    shouldStopValidating(name) {
        if (!this.hasRule(name, ['Bail'])) {
            return false;
        }

        return this.hasError(name);
    }

    validateRequired(name, value, params) {
        if (value === null) {
            return false;
        } else if (typeof value === 'string' && value.trim() === '') {
            return false;
        } else if (Array.isArray(value) && value.length < 1) {
            return false;
        }

        return true;
    }

    validatePresent(name, value, params) {
        return typeof this.data[name] !== 'undefined';
    }

    validateFilled(name, value) {
        if (this.hasData(name)) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    anyFailingRequired(names) {
        let self = this;
        let result = false;

        names.forEach(function (name) {
            if (!self.validateRequired(name, self.getValue(name))) {
                result = true;
                return;
            }
        });

        return result;
    }

    allFailingRequired(names) {
        let self = this;
        let result = true;

        names.forEach(function (name) {
            if (self.validateRequired(name, self.getValue(name))) {
                result = false;
                return;
            }
        });

        return result;
    }

    validateRequiredWith(name, value, params) {
        if (!this.allFailingRequired(params)) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    validateRequiredWithAll(name, value, params) {
        if (!this.anyFailingRequired(params)) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    validateRequiredWithout(name, value, params) {
        if (this.anyFailingRequired(params)) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    validateRequiredWithoutAll(name, value, params) {
        if (this.allFailingRequired(params)) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    validateRequiredIf(name, value, params) {
        this.requireParameterCount(2, params, 'required_if');

        let data = this.getValue(params[0]);
        if (typeof data === 'boolean') {
            data = data.toString();
        }

        let values = params.slice(1);

        if (values.indexOf(data) >= 0) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    validateRequiredUnless(name, value, params) {
        this.requireParameterCount(2, params, 'required_unless');

        let data = this.getValue(params[0]);

        let values = params.slice(1);

        if (values.indexOf(data) < 0) {
            return this.validateRequired(name, value);
        }

        return true;
    }

    getPresentCount(names) {
        let self = this;
        let count = 0;

        names.forEach(function (name) {
            if (typeof self.data[name] !== 'undefined') {
                count++;
            }
        });

        return count;
    }

    validateMatch(name, value, params) {
        if (!(params instanceof Array)) {
            params = [params];
        }

        if (!(value instanceof Array)) {
            value = [value];
        }

        let re = params[0];

        if (!(re instanceof RegExp)) {
            re = re.split('/');
            re = new RegExp(re[1], re[2]);
        }

        return re.test(value);
    }

    validateRegex(name, value, params) {
        return this.validateMatch(name, value, params);
    }

    validateAccepted(name, value) {
        let acceptable = ['yes', 'on', '1', 1, true, 'true'];

        return (
            this.validateRequired(name, value) && acceptable.indexOf(value) >= 0
        );
    }

    validateArray(name, value) {
        if (typeof this.data[name] === 'undefined') {
            return true;
        }

        return value === null || Array.isArray(value);
    }

    validateConfirmed(name, value) {
        return this.validateSame(name, value, [name + '_confirmation']);
    }

    validateSame(name, value, params) {
        this.requireParameterCount(1, params, 'same');

        let other = this.data[params[0]];

        return typeof other !== 'undefined' && value === other;
    }

    validateDifferent(name, value, params) {
        this.requireParameterCount(1, params, 'different');

        let other = this.data[params[0]];

        return typeof other !== 'undefined' && value !== other;
    }

    validateDigits(name, value, params) {
        this.requireParameterCount(1, params, 'digits');

        return (
            this.validateNumeric(name, value) &&
            value.toString().length == params[0]
        );
    }

    validateDigitsBetween(name, value, params) {
        this.requireParameterCount(2, params, 'digits_between');

        let len = value.toString().length;

        return (
            this.validateNumeric(name, value) &&
            len >= params[0] &&
            len <= params[1]
        );
    }

    validateSize(name, value, params) {
        this.requireParameterCount(1, params, 'size');

        return this.getSize(name, value) == params[0];
    }

    validateBetween(name, value, params) {
        this.requireParameterCount(2, params, 'between');

        let size = this.getSize(name, value);

        return size >= params[0] && size <= params[1];
    }

    validateMin(name, value, params) {
        this.requireParameterCount(1, params, 'min');

        return this.getSize(name, value) >= params[0];
    }

    validateMax(name, value, params) {
        this.requireParameterCount(1, params, 'max');

        return this.getSize(name, value) <= params[0];
    }

    getSize(name, value) {
        let hasNumeric = this.hasRule(name, this.numericRules);

        if (!value) {
            return 0;
        }

        if (hasNumeric && !isNaN(parseFloat(value))) {
            return parseFloat(value);
        }

        // for array and string
        return value.length;
    }

    validateIn(name, value, params) {
        if (Array.isArray(value) && this.hasRule(name, 'Array')) {
            let arr = this.arrayDiff(value, params);
            return arr.length === 0;
        }

        return params.indexOf(value) >= 0;
    }

    arrayDiff(arr1, arr2) {
        let diff = [];
        arr1.forEach(function (item) {
            if (arr2.indexOf(item) < 0) {
                diff.push(item);
            }
        });
        return diff;
    }

    validateNotIn(name, value, params) {
        this.requireParameterCount(1, params, 'not_in');

        return !this.validateIn(name, value, params);
    }

    validateNumeric(name, value) {
        return this.validateMatch(name, value, /^-?\d+(\.\d*)?$/);
    }

    validateInteger(name, value) {
        return this.validateMatch(name, value, /^-?\d+$/);
    }

    validateString(name, value) {
        if (!this.hasData(name)) {
            return true;
        }

        return value === null || typeof value === 'string';
    }

    validateEmail(name, value) {
        return this.validateMatch(
            name,
            value,
            /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,8}$/i
        );
    }

    validateIp(name, value) {
        let segments = value.split('.');

        if (
            segments.length === 4 &&
            this.validateBetween(name, segments[0], [1, 255]) &&
            this.validateBetween(name, segments[1], [0, 255]) &&
            this.validateBetween(name, segments[2], [0, 255]) &&
            this.validateBetween(name, segments[3], [1, 255])
        ) {
            return true;
        }

        return false;
    }

    validateUrl(name, value) {
        return this.validateMatch(
            name,
            value,
            /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i
        );
    }

    validateAlpha(name, value) {
        return this.validateMatch(name, value, /^([a-z])+$/i);
    }

    validateAlphaNum(name, value) {
        return this.validateMatch(name, value, /^([a-z0-9])+$/i);
    }

    validateAlphaDash(name, value) {
        return this.validateMatch(name, value, /^([a-z0-9_\-])+$/i);
    }

    validateBefore(name, value, params) {
        this.requireParameterCount(1, params, 'before');

        if (
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            !(value instanceof Date)
        ) {
            return false;
        }

        let date = this.hasData(params[0])
            ? this.getValue(params[0])
            : params[0];

        if (!this.validateDate(name, date)) {
            return false;
        }

        return Date.parse(value) < Date.parse(date);
    }

    validateBeforeOrEqual(name, value, params) {
        this.requireParameterCount(1, params, 'before_or_equal');

        if (
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            !(value instanceof Date)
        ) {
            return false;
        }

        let date = this.hasData(params[0])
            ? this.getValue(params[0])
            : params[0];

        if (!this.validateDate(name, date)) {
            return false;
        }

        return Date.parse(value) <= Date.parse(date);
    }

    validateAfter(name, value, params) {
        this.requireParameterCount(1, params, 'after');

        if (
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            !(value instanceof Date)
        ) {
            return false;
        }

        let date = this.hasData(params[0])
            ? this.getValue(params[0])
            : params[0];

        if (!this.validateDate(name, date)) {
            return false;
        }

        return Date.parse(value) > Date.parse(date);
    }

    validateAfterOrEqual(name, value, params) {
        this.requireParameterCount(1, params, 'afterOrEqual');

        if (
            typeof value !== 'string' &&
            typeof value !== 'number' &&
            !(value instanceof Date)
        ) {
            return false;
        }

        let date = this.hasData(params[0])
            ? this.getValue(params[0])
            : params[0];

        if (!this.validateDate(name, date)) {
            return false;
        }

        return Date.parse(value) >= Date.parse(date);
    }

    validateDate(name, value) {
        if (value instanceof Date) {
            return true;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
            return false;
        }

        return !isNaN(Date.parse(value));
    }

    validateBoolean(name, value) {
        if (!this.hasData(name)) {
            return true;
        }

        let acceptable = [true, false, 0, 1, '0', '1'];

        return value === null || acceptable.indexOf(value) >= 0;
    }

    validateJson(name, value) {
        try {
            JSON.parse(value);
            return true;
        } catch (err) {
            return false;
        }
    }

    /*---- Replacers ----*/
    strReplace(find, replace, string) {
        if (!Array.isArray(find)) {
            find = [find];
        }
        if (!Array.isArray(replace)) {
            replace = [replace];
        }

        if (!Array.isArray(string)) {
            for (let i = 0; i < string.length; i++) {
                string = string.replace(find, replace);
            }
        }

        for (let i = 0; i < find.length; i++) {
            string = string.replace(find[i], replace[i]);
        }

        return string;
    }

    getDisplayableValue(name, value) {
        if (
            typeof this.customValues[name] !== 'undefined' &&
            typeof this.customValues[name][value] !== 'undefined'
        ) {
            return this.customValues[name][value];
        }

        return value;
    }

    // getAttributeList
    getDataNameList(values) {
        let names = [];

        for (let key in values) {
            names.push({
                key: this.getDataName(values[key]),
            });
        }

        return names;
    }

    // getAttribute
    getDataName(name) {
        if (typeof this.customNames[name] !== 'undefined') {
            return this.customNames[name];
        }

        return this.strReplace('_', ' ', this.snakeCase(name));
    }

    // setAttributeNames
    setCustomNames(names) {
        this.customNames = names;

        return this;
    }

    addCustomNames(customNames) {
        for (let key in customNames) {
            this.customNames[key] = customNames[key];
        }

        return this;
    }

    getCustomValues() {
        return this.customValues;
    }

    addCustomValues(customValues) {
        for (let key in customValues) {
            this.customValues[key] = customValues[key];
        }

        return this;
    }

    setValueNames(values) {
        this.customValues = values;

        return this;
    }

    failed() {
        return this.failedRules;
    }

    replaceBetween(msg, name, rule, params) {
        return this.strReplace([':min', ':max'], params, msg);
    }

    replaceDifferent(msg, name, rule, params) {
        return this.replaceSame(msg, name, rule, params);
    }

    replaceDigits(msg, name, rule, params) {
        return this.strReplace(':digits', params[0], msg);
    }

    replaceDigitsBetween(msg, name, rule, params) {
        return this.replaceBetween(msg, name, rule, params);
    }

    replaceMin(msg, name, rule, params) {
        return this.strReplace(':min', params[0], msg);
    }

    replaceMax(msg, name, rule, params) {
        return this.strReplace(':max', params[0], msg);
    }

    replaceIn(msg, name, rule, params) {
        let self = this;
        params = params.map(function (value) {
            return self.getDisplayableValue(name, value);
        });

        return this.strReplace(':values', params.join(', '), msg);
    }

    replaceNotIn(msg, name, rule, params) {
        return this.replaceIn(msg, name, rule, params);
    }

    // replaceInArray()
    // replaceMimes()

    replaceRequiredWith(msg, name, rule, params) {
        params = this.getDataNameList(params);

        return this.strReplace(':values', params.join(' / '), msg);
    }

    replaceRequiredWithAll(msg, name, rule, params) {
        return this.replaceRequiredWith(msg, name, rule, params);
    }

    replaceRequiredWithout(msg, name, rule, params) {
        return this.replaceRequiredWith(msg, name, rule, params);
    }

    replaceRequiredWithoutAll(msg, name, rule, params) {
        return this.replaceRequiredWith(msg, name, rule, params);
    }

    replaceRequiredIf(msg, name, rule, params) {
        params[1] = this.getDisplayableValue(params[0], this.data[params[0]]);

        params[0] = this.getDataName(params[0]);

        return this.strReplace([':other', ':value'], params, msg);
    }

    replaceRequiredUnless(msg, name, rule, params) {
        let other = this.getDataName(params.shift());

        return this.strReplace(
            [':other', ':values'],
            [other, params.join(', ')],
            msg
        );
    }

    replaceSame(msg, name, rule, params) {
        return this.strReplace(':other', name, msg);
    }

    replaceSize(msg, name, rule, params) {
        return this.strReplace(':size', params[0], msg);
    }

    replaceBefore(msg, name, rule, params) {
        if (isNaN(Date.parse(params[0]))) {
            return this.strReplace(':date', this.getDataName(params[0]), msg);
        }

        return this.strReplace(':date', params[0], msg);
    }

    replaceAfter(msg, name, rule, params) {
        return this.replaceBefore(msg, name, rule, params);
    }

    dependsOnOtherFields(rule) {
        return this.dependentRules.indexOf(rule);
    }
}

export default Validator;
