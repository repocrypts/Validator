import { expect } from 'chai'
import Validator from './Validator'

let rules = [
    {name: 'name', rules: 'required|min:3'},
    {name: 'email', rules: 'required|email|unique:users'},
    {name: 'age', rules: 'integer'}
]

let data = {
    name: 'Rati',
    email: 'rati@example.com'
}

let v = new Validator(data, rules)

describe('Validator', function() {
    describe('instantiatable', function() {
        it('instantiatable using new Validator(...)', function() {
            expect(new Validator(data, rules)).to.be.ok
        })
        it('instantiatable using Validator.make(...)', function() {
            expect(Validator.make(data, rules)).to.be.ok
        })
    })
    describe('#parseItemRules()', function() {
        let rules = [
            { name: 'name', rules: 'required|min:3' },
            { name: 'group', rules: 'not_in:admin,exec'},
        ]
        let v = Validator.make({name: 'Rati'}, rules)

        it('parses multiple rules correctly', function() {
            let arr = v.parseItemRules(rules[0].rules)
            expect(arr).to.be.lengthOf(2)
            expect(arr).to.deep.equal([
                { name: 'Required', params: [] },
                { name: 'Min', params: ['3'] }
            ])
        })
        it('parses rule with array argument (not_in)', function() {
            let arr = v.parseItemRules(rules[1].rules)
            expect(arr).to.deep.equal([
                { name: 'NotIn', params: ['admin', 'exec'] }
            ])
        })
    })
    describe('#parseRules()', function() {
        let rules = [
            { name: 'name', rules: 'required|min:3' },
            { name: 'group', rules: 'not_in:admin,exec'}
        ]
        let v = Validator.make({name: 'Rati'}, rules)

        it('parses rules on every item correctly', function() {
            let arr = v.parseRules(rules)
            expect(arr).to.deep.equal([
                {
                    name: 'name',
                    rules: [
                        { name: 'Required', params: [] },
                        { name: 'Min', params: ['3'] }
                    ]
                },
                {
                    name: 'group',
                    rules: [
                        { name: 'NotIn', params: ['admin', 'exec']}
                    ]
                }
            ])
        })
    })
    describe('#hasError()', function() {
        it('returns true if there is any error', function() {
            let v = Validator.make({name: 'Test'}, [{
                name: 'name',
                rules: 'required|min:6'
            }])
            v.passes()
            expect(v.hasError()).to.be.true
        })
        it('returns false if there is no error', function() {
            let v = Validator.make({name: 'Testing'}, [{
                name: 'name',
                rules: 'required|min:6'
            }])
            v.passes()
            expect(v.hasError()).to.be.false
        })
    })
    describe('#titleCase()', function() {
        it('returns title case using space as default delimiter', function() {
            expect(v.titleCase('hello world')).to.equal('HelloWorld')
        })
        it('returns title case using hyphen as delimiter', function() {
            expect(v.titleCase('hello-world', '-')).to.equal('HelloWorld')
        })
        it('returns title case when given just one word', function() {
            expect(v.titleCase('helloworld')).to.equal('Helloworld')
        })
        it('returns title case when given a capitalized word', function() {
            expect(v.titleCase('HELLOWORLD')).to.equal('Helloworld')
        })
        it('returns title case when given all capitalized words', function() {
            expect(v.titleCase('HELLO WORLD')).to.equal('HelloWorld')
        })
    })
    describe('#snakeCase()', function() {
        it('returns snake case using underscore as default delimitor', function() {
            expect(v.snakeCase('helloWorld')).to.equal('hello_world')
        })
        it('returns snake case using hyphen as delimiter', function() {
            expect(v.snakeCase('helloWorld', '-')).to.equal('hello-world')
        })
        it('returns snake case when given title case word', function() {
            expect(v.snakeCase('HelloWorld')).to.equal('hello_world')
        })
        it('returns lowercase word when given a single word', function() {
            expect(v.snakeCase('Hello')).to.equal('hello')
        })
        it('returns lowercase of characters each separated by a delimiter when given all capitalized word', function() {
            expect(v.snakeCase('HELLO')).to.equal('h_e_l_l_o')
        })
    })
    describe('#getValue()', function() {
        it('returns value when given existing key', function() {
            expect(v.getValue('email')).to.equal('rati@example.com')
        })
        it('returns empty string when given non-existing key', function() {
            expect(v.getValue('wrong-key')).to.equal('')
        })
    })
    describe('#passes()', function() {
        let rules = [
            { name: 'name', rules: 'required' },
            { name: 'email', rules: 'required|email' }
        ]
        it('returns true when all validations are valid', function() {
            var v = Validator.make({
                name: 'Rati', email: 'rati@example.com'
            }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when any validation rule is invalid', function() {
            var v = Validator.make({
                name: 'Rati'
            }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#fails()', function() {
        let rules = [
            { name: 'name', rules: 'required' },
            { name: 'email', rules: 'required|email' }
        ]
        it('returns true when any validation fails', function() {
            var v = Validator.make({
                name: 'Rati'
            }, rules)
            expect(v.fails()).to.be.true
        })
        it('returns false when all validations pass', function() {
            let v = Validator.make({
                name: 'Rati', email: 'rati@example.com'
            }, rules)
            expect(v.fails()).to.be.false
        })
    })
    describe('#getErrors()', function() {
        let rules = [
            { name: 'name', rules: 'required' },
            { name: 'email', rules: 'required|email' },
            { name: 'age', rules: 'required' }
        ]
        it('returns errors when validation fails', function() {
            let v = Validator.make(
                {
                    name: 'Rati', email: 'rati@example.com'
                }, rules)

            v.fails()
            expect(v.getErrors()).to.have.lengthOf(1)

            v = Validator.make({ name: 'Rati' }, rules)
            v.fails()
            expect(v.getErrors()).to.have.lengthOf(3)
        })
        it('returns empty array when all validation pass', function() {
            let v = Validator.make(
                {
                    name: 'Rati',
                    email: 'rati@example.com',
                    age: '45'
                }, rules)

            v.fails()
            expect(v.getErrors()).to.have.lengthOf(0)
        })
    })
    describe('#validateRequired()', function() {
        let rules = [{ name: 'email', rules: 'required'}]
        it('return true when passes "required" validation', function() {
            let v = Validator.make(
                { email: 'rati@example.com' },rules
            )
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "required" validation', function() {
            let v = Validator.make(
                { name: 'Rati' }, rules
            )
            expect(v.fails()).to.be.true
        })
    })
    describe('#getSize()', function() {
        it('returns correct parameter value', function() {
            let v = Validator.make({name: 'Rati'}, [])
            expect(v.getSize('name', 'Rati')).to.equal(4)
        })
    })
    describe('#validateMin()', function() {
        let rules = [
            { name: 'name', rules: 'min:3'}
        ]
        it('returns true when passes "min" validation', function() {
            let v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "min" validation', function() {
            let v = Validator.make({ name: 'Ra' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateMax()', function() {
        let rules = [
            { name: 'name', rules: 'max:3'}
        ]
        it('returns true when passes "max" validation', function() {
            let v = Validator.make({ name: 'Rat' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "max" validation', function() {
            let v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateIn()', function() {
        let rules = [
            { name: 'name', rules: 'in:mom,dad,children'}
        ]
        it('returns true when passes "in" validation', function() {
            let v = Validator.make({ name: 'dad' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "in" validation', function() {
            let v = Validator.make({ name: 'me' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNotIn()', function() {
        let rules = [
            { name: 'name', rules: 'not_in:mom,dad,children'}
        ]
        it('return true when pass "not_in" validation', function() {
            let v = Validator.make({ name: 'me' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when failes "not_in" validation', function() {
            let v = Validator.make({ name: 'dad' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNumeric()', function() {
        let rules = [
            { name: 'amount', rules: 'numeric' }
        ]
        it('returns true when passes "numeric" validation', function() {
            let v = Validator.make({ amount: '100.25'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "numeric" validation', function() {
            let v = Validator.make({ amount: '100AAB.00'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateInteger()', function() {
        let rules = [
            { name: 'amount', rules: 'integer' }
        ]
        it('returns true when passes "integer" validation', function() {
            let v = Validator.make({ amount: '100'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "integer" validation', function() {
            let v = Validator.make({ amount: '100.25'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateEmail()', function() {
        let rules = [
            { name: 'email', rules: 'email' }
        ]
        it('returns true when passes "email" validation', function() {
            let v = Validator.make({ email: 'rati@example.com'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when fails "email" validation', function() {
            let v = Validator.make({ email: 'example.com'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validatePresent()', function() {
        let rules = [
            { name: 'name', rules: 'present' }
        ]
        it('returns true when the given data is present', function() {
            let v = Validator.make({ name: ''}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when the given data is not present', function() {
            let v = Validator.make({ email: 'rati@example.com' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateRegex()', function() {
        it('returns true when the given data passes regex validation', function() {
            let v = Validator.make({ x: 'asdasdf'}, [ { name: 'x', rules: 'regex:/^([a-z])+$/i' }])
            let result = v.passes()
            console.log(v.getRules('x')[0]['rules'])
            console.log(v.getErrors())
            expect(result).to.be.true
        })
    })
})

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
