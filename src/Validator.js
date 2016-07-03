import Messages from './Messages'
import Replacers from './Replacers'

export default class Validator {
    constructor(data, rules, customMessages = []) {
        this.data = data
        this.rules = this.parseRules(rules)
        this.errors = []
        this.customMessages = customMessages
    }

    get dateRules() {
        return ['Before', 'After', 'DateBetween']
    }

    get sizeRules() {
        return ['Size', 'Between', 'Min', 'Max']
    }

    get numericRules() {
        return ['Numeric', 'Integer']
    }

    get implicitRules() {
        return [
            'Required', 'Filled', 'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll',
            'RequiredIf', 'RequiredUnless', 'Accepted', 'Present',
        ]
    }

    get dependentRules() {
        return [
            'RequiredWith', 'RequiredWithAll', 'RequiredWithout', 'RequiredWithoutAll',
            'RequiredIf', 'RequiredUnless', 'Confirmed', 'Same', 'Different', 'Unique',
            'Before', 'After',
        ]
    }

    static make(data, rules, customMessages = []) {
        return new Validator(data, rules, customMessages)
    }

    isImplicit(rule) {
        return this.implicitRules.indexOf(rule) > -1
    }

    hasRule(name, rules) {
        return this.getRule(name, rules) !== null
    }

    getRule(name, rulesToCheck) {
        let a = this.rules.filter(function(item) {
            return item.name === name
        })

        if (a.length === 0) {
            return null
        } else {
            a = a[0]
        }

        let b = a.rules.filter(function(rule) {
            return rulesToCheck.indexOf(rule.name) >= 0
        })

        return b.length === 0 ? null : [ b[0].name, b[0].params ]
    }

    requireParameterCount(count, params, rule) {
        if (params.length < count) {
            console.error('Validation rule '+rule+' requires at least '+count+' parameters')
        }
    }

    parseRules(rules) {
        let self = this
        let arr = []

        rules.forEach(function(item) {
            arr.push({
                name: item.name,
                rules: self.parseItemRules(item.rules)
            })
        })

        return arr
    }

    parseItemRules(rule) {
        let self = this
        let arr = []

        rule.split('|').forEach(function(ruleAndArgs) {
            let args = ruleAndArgs.split(':')
            arr.push({
                name: self.titleCase(args[0], '_'),
                params: args[1] ? args[1].split(',') : []
            })
        })

        return arr
    }

    titleCase(str, delimiter) {
        delimiter = delimiter || ' '
        return str.split(delimiter).map(function(item) {
            return item[0].toUpperCase() + item.slice(1).toLowerCase()
        }).join('')
    }

    snakeCase(str, delimiter) {
        delimiter = delimiter || '_'
        return str.replace(/(.)(?=[A-Z])/ug, '$1'+delimiter).toLowerCase()
    }

    getValue(name) {
        if (typeof this.data[name] === 'undefined') {
            return ''
        }

        return this.data[name]
    }

    passes() {
        let self = this
        let allValid = true
        this.errors = []

        this.rules.forEach(function(item) {
            let name = item.name.toLowerCase()
            item.rules.forEach(function(rule) {
                let isValid = self.validate(name, rule)
                allValid = allValid && isValid

                if (!isValid) {
                    // console.log(rule.name, rule.params + '** invalid')
                    self.errors.push({
                        name: name,
                        rule: rule.name,
                        message: self.getErrorMsg(name, rule)
                    })
                }
            })
        })

        return allValid
    }

    getErrorMsg(name, rule) {
        let self = this
        let key = self.snakeCase(rule.name)
        let msg = self.customMessages[name + '.' + key]
        msg = msg || Messages[key]
        if (msg) {
            msg = msg.replace(':ATTR', name.toUpperCase())
                .replace(':Attr', self.titleCase(name))
                .replace(':attr', name)
        } else {
            msg = ''
        }

        // call replacer
        let replacer = Replacers['replace' + rule.name]
        if (typeof replacer === 'function') {
            msg = replacer.apply(Replacers, [msg, name, rule.name, rule.params])
        }

        return msg
    }

    fails() {
        return !this.passes()
    }

    hasError(name = null) {
        if (name === null) {
            return this.errors.length > 0
        }

        let errors = this.errors.filter(function(error) {
            return error.name === name.toLowerCase()
        })

        return errors.length > 0
    }

    getErrors() {
        return this.errors
    }

    validate(name, rule) {
        let method = this['validate' + rule.name]
        let value = this.getValue(name)

        if (typeof method === 'function') {
            return method.apply(this, [name, value, rule.params])
        } else {
            console.error('"' + rule.name + '" validation rule does not exist!')
        }

        return false
    }

    /** Validation Rules **/

    validateRequired(name, value, params) {
        if (value === null) {
            return false
        } else if (typeof(value) === 'string' && value.trim() === '') {
            return false
        } else if (Array.isArray(value) && value.length < 1) {
            return false
        }

        return true
    }

    validatePresent(name, value, params) {
        return typeof(this.data[name]) !== 'undefined'
    }

    validateMatch(name, value, params) {
        if (!(params instanceof Array)) {
            params = [params];
        }

        if (!(value instanceof Array)) {
            value = [value]
        }

        var re = params[0]

        if (!(re instanceof RegExp)) {
            re = re.split('/')
            re = new RegExp(re[1], re[2])
        }

        return re.test(value)
    }

    validateRegex(name, value, params) {
        return this.validateMatch(name, value, params);
    }

    validateAccepted(name, value) {
        var acceptable = ['yes', 'on', '1', 1, true, 'true']

        return this.validateRequired(name, value) && (acceptable.indexOf(value) >= 0)
    }

    validateArray(name, value) {
        if (typeof(this.data[name]) === 'undefined') {
            return true
        }

        return value === null || Array.isArray(value)
    }

    validateConfirmed(name, value) {
        return this.validateSame(name, value, [name+'_confirmation'])
    }

    validateSame(name, value, params) {
        this.requireParameterCount(1, params, 'same')

        var other = this.data[params[0]]

        return typeof(other) !== 'undefined' && value === other
    }

    validateDifferent(name, value, params) {
        this.requireParameterCount(1, params, 'different')

        var other = this.data[params[0]]

        return typeof(other) !== 'undefined' && value !== other
    }

    validateDigits(name, value, params) {
        this.requireParameterCount(1, params, 'digits')

        return this.validateNumeric(name, value)
            && value.toString().length == params[0]
    }

    validateDigitsBetween(name, value, params) {
        this.requireParameterCount(2, params, 'digits_between')

        var len = value.toString().length

        return this.validateNumeric(name, value)
            && len >= params[0] && len <= params[1]
    }

    validateSize(name, value, params) {
        this.requireParameterCount(1, params, 'size')

        return this.getSize(name, value) == params[0]
    }

    validateBetween(name, value, params) {
        this.requireParameterCount(2, params, 'between')

        var size = this.getSize(name, value)

        return size >= params[0] && size <= params[1]
    }

    validateMin(name, value, params) {
        this.requireParameterCount(1, params, 'min')

        return this.getSize(name, value) >= params[0]
    }

    validateMax(name, value, params) {
        this.requireParameterCount(1, params, 'max')

        return this.getSize(name, value) <= params[0]
    }

    getSize(name, value) {
        var hasNumeric = this.hasRule(name, this.numericRules)

        if (hasNumeric && !isNaN(parseFloat(value))) {
            return parseFloat(value)
        }

        // for array and string
        return value.length
    }

    validateIn(name, value, params) {
        this.requireParameterCount(1, params, 'in')

        return params.indexOf(value) >= 0
    }

    validateNotIn(name, value, params) {
        this.requireParameterCount(1, params, 'not_in')

        return ! this.validateIn(name, value, params)
    }

    validateNumeric(name, value) {
        return this.validateMatch(name, value, /^-?\d+(\.\d*)?$/)
    }

    validateInteger(name, value) {
        return this.validateMatch(name, value, /^-?\d+$/)
    }

    validateEmail(name, value) {
        return this.validateMatch(name, value, /^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i)
    }

    validateIp(name, value) {
        var segments = value.split('.')

        if (segments.length === 4 &&
                this.validateBetween(name, segments[0], [1, 255]) &&
                this.validateBetween(name, segments[1], [0, 255]) &&
                this.validateBetween(name, segments[2], [0, 255]) &&
                this.validateBetween(name, segments[3], [1, 255])
            ) {
            return true
        }

        return false
    }

    validateUrl(name, value) {
        return this.validateMatch(name, value, /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i)
    }

    validateAlpha(name, value) {
        return this.validateMatch(name, value, /^([a-z])+$/i)
    }

    validateAlphaNum(name, value) {
        return this.validateMatch(name, value, /^([a-z0-9])+$/i)
    }

    validateAlphaDash(name, value) {
        return this.validateMatch(name, value, /^([a-z0-9_\-])+$/i)
    }

    validateBefore(name, value, params) {
        this.requireParameterCount(1, params, 'before')

        return (Date.parse(value) < Date.parse(params[0]))
    }

    validateAfter(name, value, params) {
        this.requireParameterCount(1, params, 'after')

        return (Date.parse(value) > Date.parse(params[0]))
    }

    validateDateBetween(name, value, params) {
        var date = Date.parse(value)
        return date >= Date.parse(params[0]) && date <= Date.parse(params[1])
    }

}

