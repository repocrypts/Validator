export default class Rules {
    constractor() {
        const dateRules = ['Before', 'After', 'DateBetween']
        const sizeRules = ['Size', 'Between', 'Min', 'Max']
        const numericRules = ['Numeric', 'Integer']
        const implicitRules = [
            'Required', 'Filled', 'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll',
            'RequiredIf', 'RequiredUnless', 'Accepted', 'Present',
            // 'Array', 'Boolean', 'Integer', 'Numeric', 'String',
        ]

        const dependentRules = [
            'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll',
            'RequiredIf', 'RequiredUnless', 'Confirmed', 'Same', 'Different', 'Unique',
            'Before', 'After',
        ]
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
        var arr = params[0].split(',')

        return arr.indexOf(value) >= 0
    }

    static validateNotIn(name, value, params) {
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
