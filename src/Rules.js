export default class Rules {
    constractor() {
        this.validator = null
    }

    static get dateRules() {
        return ['Before', 'After', 'DateBetween']
    }

    static get sizeRules() {
        return ['Size', 'Between', 'Min', 'Max']
    }

    static get numericRules() {
        return ['Numeric', 'Integer']
    }

    static get implicitRules() {
        return [
            'Required', 'Filled', 'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll',
            'RequiredIf', 'RequiredUnless', 'Accepted', 'Present',
        ]
    }

    static get dependentRules() {
        return [
            'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll',
            'RequiredIf', 'RequiredUnless', 'Confirmed', 'Same', 'Different', 'Unique',
            'Before', 'After',
        ]
    }

    static setValidator(validator) {
        this.validator = validator
    }

    static data(name) {
        return this.validator.data[name]
    }

    static isImplicit(rule) {
        return this.implicitRules.indexOf(rule) > -1
    }

    static hasRule(name, rules) {
        return rules.indexOf(name) >= 0
    }

    static requireParameterCount(count, params, rule) {
        if (params.length < count) {
            console.error('Validation rule '+rule+' requires at least '+count+' parameters')
        }
    }

    static validateRequired(name, value, params) {
        if (value === null) {
            return false
        } else if (typeof(value) === 'string' && value.trim() === '') {
            return false
        } else if (Array.isArray(value) && value.length < 1) {
            return false
        }

        return true
    }

    static validatePresent(name, value, params) {
        return this.data[name] !== 'undefined'
    }

    static validateMatch(name, value, params) {
        if (!(params instanceof Array)) {
            params = [params];
        }

        if (!(value instanceof Array)) {
            value = [value]
        }

        var i = 0
        var re = params[0]

        if (!(re instanceof RegExp)) {
            re = re.replace(/\/?([^\/]*)\/?/, "$1");
            re = new RegExp(re);
        }

        for (var i = 0; i < value.length; i++) {
            if (value[i] !== null && value[i].match(re) !== null) {
                return true
            }
        }

        return false
    }

    static validateRegex(name, value, params) {
        return this.validateMatch(name, value, params);
    }

    static validateConfirmed(name, value) {
        return this.validateSame(name, value, [name+'_confirmation'])
    }

    static validateSame(name, value, params) {
        this.requireParameterCount(1, params, 'same')

        var other = this.data[params[0]]

        return typeof(other) !== 'undefined' && value === other
    }

    static validateDifferent(name, value, params) {
        this.requireParameterCount(1, params, 'different')

        var other = this.data[params[0]]

        return typeof(other) !== 'undefined' && value !== other
    }

    static validateMin(name, value, params) {
        this.requireParameterCount(1, params, 'min')

        return this.getSize(name, value) >= params[0]
    }

    static validateMax(name, value, params) {
        this.requireParameterCount(1, params, 'max')

        return this.getSize(name, value) <= params[0]
    }

    static getSize(name, value) {
        var hasNumeric = this.hasRule(name, this.numericRules)

        if (hasNumeric && !isNaN(parseInt(value))) {
            return value
        }

        // for array and string
        return value.length
    }

    static validateIn(name, value, params) {
        this.requireParameterCount(1, params, 'in')

        return params.indexOf(value) >= 0
    }

    static validateNotIn(name, value, params) {
        this.requireParameterCount(1, params, 'not_in')

        return ! this.validateIn(name, value, params)
    }

    static validateNumeric(name, value, params = null) {
        return this.validateMatch(name, value, /^-?\d+(\.\d*)?$/)
    }

    static validateInteger(name, value, params = null) {
        return this.validateMatch(name, value, /^-?\d+$/)
    }

    static validateEmail(name, value, params = null) {
        return this.validateMatch(name, value, /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i)
    }
}
