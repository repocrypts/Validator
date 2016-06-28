import Validations from './Rules'
import Messages from './Messages'
import Replacers from './Replacers'

export default class Validator {
    constructor(data, rules, customMessages = []) {
        this.data = data
        this.rules = this.parseRules(rules)
        this.errors = []
        this.customMessages = customMessages
        this.validations = new Validations(this)
    }

    static make(data, rules, customMessages = []) {
        return new Validator(data, rules, customMessages)
    }

    getErrors() {
        return this.errors
    }

    parseRules(rules) {
        let self = this
        let arr = []

        rules.forEach(function(item) {
            arr.push({
                name: item.name,
                rules: self.parseEachRule(item.rules)
            })
        })

        return arr
    }

    parseEachRule(rule) {
        let self = this
        let arr = []

        rule.split('|').forEach(function(ruleAndArgs) {
            let args = ruleAndArgs.split(':')
            arr.push({
                name: self.titleCase(args[0]),
                params: args[1] ? args[1].split(',') : []
            })
        })

        return arr
    }

    titleCase(str, delimiter) {
        delimiter = delimiter || ' '
        return str.split(delimiter).map(function(item) {
            return item[0].toUpperCase() + item.slice(1)
        }).join('')
    }

    snakeCase(str, delimiter) {
        delimiter = delimiter || '_'
        return str.replace(/(.)(?=[A-Z])/u, '$1'+delimiter).toLowerCase()
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

    validate(name, rule) {
        let method = Validations['validate' + rule.name]
        let value = this.getValue(name)

        if (typeof method === 'function') {
            return method.apply(Validations, [name, value, rule.params])
        }

        return false
    }
}

