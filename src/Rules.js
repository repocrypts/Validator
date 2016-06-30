export default class Rules {
    constructor(validator) {
        this.validator = validator
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

    data(name) {
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

    static validateAccept(name, value, params = null) {
        var acceptable = ['yes', 'on', '1', 1, true, 'true']

        return this.validateRequired(name, value) && (acceptable.indexOf(value) > -1)
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

    static validateDigits(name, value, params) {
        this.requireParameterCount(1, params, 'digits')

        return this.validateNumeric(name, value)
            && value.toString().length == params[0]
    }

    static validateDigitsBetween(name, value, params) {
        this.requireParameterCount(2, params, 'digits_between')

        var len = value.toString().length

        return this.validateNumeric(name, value)
            && len >= params[0] && len <= params[1]
    }

    static validateSize(name, value, params) {
        this.requireParameterCount(1, params, 'size')

        return this.getSize(name, value) == params[0]
    }

    static validateBetween(name, value, params) {
        this.requireParameterCount(2, params, 'between')

        var size = this.getSize(name, value)

        return size >= params[0] && size <= params[1]
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

    static validateIp(name, value, params = null) {
        var segments = value.split('.')

        if (segments.length === 4 &&
                this.validateBetween(name, segments[0], [1, 255]) &&
                this.validateBetween(name, segmentg[1], [0, 255]) &&
                this.validateBetween(name, segmentg[2], [0, 255]) &&
                this.validateBetween(name, segmentg[3], [1, 255])
            ) {
            return true
        }

        return false
    }

    static validateUrl(name, value, params = null) {
        return this.validateMatch(name, value, /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i)
    }

    static validateAlpha(name, value, params) {
        return this.validateMatch(name, value, /^([a-z])+$/i)
    }

    static validateAlphaNum(name, value, params) {
        return this.validateMatch(name, value, /^([a-z0-9])+$/i)
    }

    static validateAlphaDash(name, value, params) {
        return this.validateMatch(name, value, /^([a-z0-9_\-])+$/i)
    }

    static validateBefore(name, value, params) {
        this.requireParameterCount(1, params, 'before')

        return (Date.parse(value) < Date.parse(params[0]))
    }

    static validateAfter(name, value, params) {
        this.requireParameterCount(1, params, 'after')

        return (Date.parse(value) > Date.parse(params[0]))
    }

    static validateDateBetween(name, value, params) {
        var date = Date.parse(value)
        return date >= Date.parse(params[0]) && date <= Date.parse(params[1])
    }
}

/*
## tested
required
min
max
in
not_in
numeric
integer
email

## untested
present
match
regex
confirmed
accept
same
different
digits
digits_between
size
between
ip
url
alpha
alpha_num
alpha_dash
before (date)
after (date)
date_between (date)

## pending
array
boolean
date
date_format
dimensions
distinct
filled
image (File)
in_array
json
mime_types
required_if
required_unless
required_with
required_with_all
required_without
required_without_all
string
timezone
exists (DB)
unique (DB)
 */