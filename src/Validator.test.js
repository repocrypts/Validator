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
    describe('#getRule()', function() {
        let rules = [
            { name: 'name', rules: 'required|min:3' },
            { name: 'group', rules: 'in:admin,exec'}
        ]
        let data = {
            name: 'Rati',
            group: 'admin'
        }
        let v = Validator.make(data, rules)
        it('returns correct array when item is in the given rules', function() {
            let arr = v.getRule('name', ['Required'])
            expect(arr).to.deep.equal(['Required', []])
        })
        it('returns null when item is not in the given rules', function() {
            let arr = v.getRule('group', ['Required'])
            expect(arr).to.be.null
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
            { name: 'foo', rules: 'numeric' }
        ]
        it('return false when given string is not numeric', function() {
            let v = Validator.make({foo: 'asdad'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given string is floating point value', function() {
            let v = Validator.make({foo: '1.23'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given string is "-1"', function() {
            let v = Validator.make({foo: '-1'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given string is "1"', function() {
            let v = Validator.make({foo: '1'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateInteger()', function() {
        let rules = [
            { name: 'foo', rules: 'integer' }
        ]
        it('returns false when given string is text value', function() {;
            let v = Validator.make({ foo: 'asdad'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given string is decimal point value', function() {;
            let v = Validator.make({ foo: '1.23'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given string is "-1"', function() {
            let v = Validator.make({ foo: '-1'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given string is "1"', function() {
            let v = Validator.make({ foo: '1'}, rules)
            expect(v.passes()).to.be.true
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
            // console.log(v.getRules('x')[0]['rules'])
            // console.log(v.getErrors())
            expect(result).to.be.true
        })
        it('returns false when the given data fails regex validation', function() {
            let v = Validator.make({ x: 'aasd234fsd1'}, [ {name: 'x', rules: 'regex:/^([a-z])+$/i'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given data has comma delimited value', function() {
            let v = Validator.make({x: 'a,b'}, [{name: 'x', rules: 'regex:/^a,b$/i'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given data is a string value of "12"', function() {
            let v = Validator.make({x: '12'}, [{name: 'x', rules: 'regex:/^12$/i'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given data is numeric 123', function() {
            let v = Validator.make({x: 123}, [{name: 'x', rules: 'regex:/^123$/i'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateSame()', function() {
        it('returns false when the specified field has different value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'boom'
            }, [{name: 'foo', rules: 'same:baz'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when the specified field does not present', function() {
            let v = Validator.make({
                'foo': 'bar',
            }, [{name: 'foo', rules: 'same:baz'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when the specified field is present and has the same value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'bar'
            }, [{name: 'foo', rules: 'same:baz'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the specified field has different numeric value', function() {
            let v = Validator.make({
                'foo': '1e2',
                'baz': '100'
            }, [{name: 'foo', rules: 'same:baz'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateDifferent()', function() {
        it('returns true when the specified field has different value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'boom'
            }, [{name: 'foo', rules: 'different:baz'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the specified field does not present', function() {
            let v = Validator.make({
                'foo': 'bar',
            }, [{name: 'foo', rules: 'different:baz'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when the specified field is present and has the same value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'bar'
            }, [{name: 'foo', rules: 'different:baz'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when the specified field has different numeric value', function() {
            let v = Validator.make({
                'foo': '1e2',
                'baz': '100'
            }, [{name: 'foo', rules: 'different:baz'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateConfirm()', function() {
        it('returns false when confirmation field is not present', function() {
            let v = Validator.make({password: 'foo'}, [ {name: 'password', rules: 'confirmed'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when confirmation field value does not match', function() {
            let v = Validator.make({
                'password': 'foo',
                'password_confirmation': 'bar'
            }, [ {name: 'password', rules: 'confirmed'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when confirmation field value does match', function() {
            let v = Validator.make({
                'password': 'foo',
                'password_confirmation': 'foo'
            }, [ {name: 'password', rules: 'confirmed'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateAccepted()', function() {
        it('returns false when given value is "no"', function() {
            let v = Validator.make({ foo: 'no'}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is null', function() {
            let v = Validator.make({ foo: null}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when the field is not present', function() {
            let v = Validator.make({}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is 0', function() {
            let v = Validator.make({ foo: 0}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is false', function() {
            let v = Validator.make({ foo: false}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is string "false"', function() {
            let v = Validator.make({ foo: 'false'}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given value is string "yes"', function() {
            let v = Validator.make({ foo: 'yes'}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is string "on"', function() {
            let v = Validator.make({ foo: 'on'}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is string "1"', function() {
            let v = Validator.make({ foo: '1'}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is numeric 1', function() {
            let v = Validator.make({ foo: 1}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is true', function() {
            let v = Validator.make({ foo: true}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is string "true"', function() {
            let v = Validator.make({ foo: 'true'}, [{name: 'foo', rules: 'accepted'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateDigits()', function() {
        it('returns true when the number of digits given matched', function() {
            let v = Validator.make({foo: '12345'}, [{name: 'foo', rules: 'digits:5'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the number of digits given does not match', function() {
            let v = Validator.make({foo: '123'}, [{name: 'foo', rules: 'digits:200'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('$validateDigitsBetween()', function() {
        it('returns true when the number of digits given is between the range', function() {
            let v = Validator.make({foo: '12345'}, [{name: 'foo', rules: 'digits_between:1,6'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the given value is not numeric', function() {
            let v = Validator.make({foo: 'bar'}, [{name: 'foo', rules: 'digits_between:1,10'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when the number of digits given is not in the range', function() {
            let v = Validator.make({foo: '123'}, [{name: 'foo', rules: 'digits_between:4,5'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateSize()', function() {
        it('returns false when string length is more than the given size', function() {
            let v = Validator.make({foo: 'asdad'}, [{name: 'foo', rules: 'size:3'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when string length is equal to the given size', function() {
            let v = Validator.make({foo: 'asd'}, [{name: 'foo', rules: 'size:3'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when numeric value is not equal to the given size', function() {
            let v = Validator.make({foo: '123'}, [{name: 'foo', rules: 'numeric|size:3'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when numeric value is equal to the given size', function() {
            let v = Validator.make({foo: '3'}, [{name: 'foo', rules: 'numeric|size:3'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is array of the given size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array|size:3'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given value is array of different size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array|size:4'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateBetween()', function() {
        it('returns false when given string length is not in the range', function() {
            let v = Validator.make({foo: 'asdad'}, [{name: 'foo', rules: 'between:3,4'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given string length is in the range', function() {
            let v = Validator.make({foo: 'asd'}, [{name: 'foo', rules: 'between:3,5'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: 'asda'}, [{name: 'foo', rules: 'between:3,5'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: 'asdad'}, [{name: 'foo', rules: 'between:3,5'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the given numeric value is not in the specified range', function() {
            let v = Validator.make({foo: '123'}, [{name: 'foo', rules: 'numeric|between:50,100'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when the given numeric value is in the specified range', function() {
            let v = Validator.make({foo: '3'}, [{name: 'foo', rules: 'numeric|between:1,5'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when the given array size is in the specified range', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array|between:1,5'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the given array size is not in the specified range', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array|between:1,2'}])
            expect(v.passes()).to.be.false
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
present
regex
same
different
confirmed
accepted
digits
digits_between
size

## untested
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
