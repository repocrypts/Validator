import { expect } from 'chai';
import Validator from '../dist/Validator.js';

let rules = {
    name: 'required|min:3',
    email: 'required|email',
    age: 'integer'
}

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
        let rules = {
            name: 'required|min:3',
            group: 'not_in:admin,exec',
            nick: ['required', 'string']
        }
        let v = Validator.make({name: 'Rati', nick: 'Rati' }, rules)

        it('parses multiple piped rules correctly', function() {
            let arr = v.parseItemRules(rules['name'])
            expect(arr).to.be.lengthOf(2)
            expect(arr).to.deep.equal([
                { name: 'Required', params: [] },
                { name: 'Min', params: ['3'] }
            ])
        })
        it('parses array of rules correctly', function() {
            let arr = v.parseItemRules(rules['nick'])
            console.log(arr);
            expect(arr).to.be.lengthOf(2)
            expect(arr).to.be.deep.equal([
                { name: 'Required', params: [] },
                { name: 'String', params: [] }
            ])
        })
        it('parses rule with array argument (not_in)', function() {
            let arr = v.parseItemRules(rules['group'])
            expect(arr).to.deep.equal([
                { name: 'NotIn', params: ['admin', 'exec'] }
            ])
        })
    })
    describe('#parseRules()', function() {
        let rules = {
            name: 'required|min:3',
            'group': 'not_in:admin,exec'
        }
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
        let rules = {
            name: 'required|min:3',
            group: 'in:admin,exec'
        }
        let data = {
            name: 'Rati',
            group: 'admin'
        }
        let v = Validator.make(data, rules)
        it('returns correct array when item is in the given rules', function() {
            let arr = v.getRule('name', ['Required'])
            expect(arr).to.deep.equal(['Required', []])

            arr = v.getRule('name', ['Min'])
            expect(arr).to.deep.equal(['Min', ['3']])
        })
        it('returns null when item is not in the given rules', function() {
            let arr = v.getRule('group', ['Required'])
            expect(arr).to.be.null
        })
    })
    describe('#extend()', function() {
        let isMongoId = (name, value, args) => {
            let hexadecimal = /^[0-9A-F]+$/i
            return value && hexadecimal.test(value) && value.length === 24
        }
        let rules = {
            id: 'mongoid:min=24,max=24',
        }
        let v = Validator.make({
            id: '5915b8434479e9b7e11db37c'
        }, rules)
        v.extend('mongoid', isMongoId, ':attr must be a valid mongo id')

        let fail_v = Validator.make({
            id: 'asdfasfdw'
        }, rules)
        fail_v.extend('mongoid', isMongoId, ':attr must be a valid mongo id')

        it('can be extended with a custom rule', function() {
            expect(v.findRuleMethod({name: 'Mongoid'})).to.equal(isMongoId)
        })
        it('runs custom validation rule', function() {
            expect(v.passes(data)).to.be.true
            expect(fail_v.passes()).to.be.false
        })
        it('custom validator fails with custom message', function() {
            expect(fail_v.getErrors()).to.deep.equal({
                id: ['id must be a valid mongo id']
            })
        })
    })
    describe('#hasError()', function() {
        it('returns true if there is any error', function() {
            let v = Validator.make({name: 'Test'}, {
                name: 'required|min:6'
            })
            v.passes()
            expect(v.hasError()).to.be.true
        })
        it('returns false if there is no error', function() {
            let v = Validator.make({name: 'Testing'}, {
                name: 'required|min:6'
            })
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
    describe('#passes() and valid()', function() {
        let rules = {
            name: 'required',
            email: 'required|email'
        }
        it('returns true when all validations are valid', function() {
            var v = Validator.make({
                name: 'Rati', email: 'rati@example.com'
            }, rules)
            expect(v.passes()).to.be.true
            expect(v.valid()).to.deep.equal(['name', 'email'])
        })
        it('returns false when any validation rule is invalid', function() {
            var v = Validator.make({
                name: 'Rati'
            }, rules)
            expect(v.passes()).to.be.false
            expect(v.valid()).to.deep.equal(['name'])
        })
    })
    describe('#fails() and invalid()', function() {
        let rules = {
            name: 'required',
            email: 'required|email'
        }
        it('returns true when any validation fails', function() {
            var v = Validator.make({
                name: 'Rati'
            }, rules)
            expect(v.fails()).to.be.true
            expect(v.invalid()).to.deep.equal(['email'])
            expect(v.getError('email')).to.have.lengthOf(2)
        })
        it('returns false when all validations pass', function() {
            let v = Validator.make({
                name: 'Rati', email: 'rati@example.com'
            }, rules)
            expect(v.fails()).to.be.false
            expect(v.invalid()).to.be.empty
        })
    })
    describe('#getErrors()', function() {
        let rules = {
            name: 'required',
            email: 'required|email',
            age: 'required'
        }
        it('returns errors when validation fails', function() {
            let v = Validator.make({ name: 'Rati', email: 'rati@example.com' }, rules)

            v.fails()
            console.log(v.getErrors())
            expect(v.getErrors()).to.have.any.keys('age')

            v = Validator.make({ name: 'Rati' }, rules)
            v.fails()
            expect(v.getErrors()).to.have.all.keys(['email', 'age'])
            expect(v.getError('email')).to.have.lengthOf(2)
            expect(v.getError('age')).to.have.lengthOf(1)
        })
        it('returns empty array when all validation pass', function() {
            let v = Validator.make({
                name: 'Rati',
                email: 'rati@example.com',
                age: '45'
            }, rules)

            v.fails()
            expect(v.getErrors()).to.empty
            expect(v.hasError()).to.be.false
            expect(v.getError('name')).to.be.null
        })
    })
    describe('#validateRequired()', function() {
        it('return false when the required field is not present', function() {
            let v = Validator.make({}, {name: 'required'})
            expect(v.passes()).to.be.false
        })
        it('return false when the required field is present but empty', function() {
            let v = Validator.make({name: ''}, {name: 'required'})
            expect(v.passes()).to.be.false
        })
        it('return true when the required field is present and has value', function() {
            let v = Validator.make({name: 'foo'}, {name: 'required'})
            expect(v.passes()).to.be.true
        })
        // SKIP File related test
    })
    describe('#validateRequiredWith()', function() {
        let rules = {
            last: 'required_with:first'
        }
        it('returns false when the validated field is not present', function() {
            let v = Validator.make({first: 'Taylor'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the validated field is empty', function() {
            let v = Validator.make({first: 'Taylor', last: ''}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when the validated field is not present, butthe required_with field is empty', function() {
            let v = Validator.make({first: ''}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when both validated field and required_with field are not present', function() {
            let v = Validator.make({}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when the validated field is present and the required_with field can be validated', function() {
            let v = Validator.make({first: 'Taylor', last: 'Otwell'}, rules)
            expect(v.passes()).to.be.true
        })
        // SKIP File related test
    })
    describe('#validateRequiredWithAll()', function() {
        it('returns true when the field under validation must be present only if all of the other specified fields are present', function() {
            let v = Validator.make({first: 'foo'}, {last: 'required_with_all:first,foo'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the field under validation is not present', function() {
            let v = Validator.make({first: 'foo'}, {last: 'required_with_all:first'})
            expect(v.passes()).to.be.false
        })
    })
    describe('#getSize()', function() {
        it('returns correct parameter value', function() {
            let v = Validator.make({name: 'Rati'}, {})
            expect(v.getSize('name', 'Rati')).to.equal(4)
        })
    })
    describe('#validateMin()', function() {
        let rules = {
            name: 'min:3'
        }
        it('returns true when the length of given string is >= the specified "min"', function() {
            let v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when the length of given string is < the specified "min"', function() {
            let v = Validator.make({ name: 'Ra' }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the given value is < the numeric min', function() {
            let v = Validator.make({foo: '2'}, {foo: 'numeric|min:3'})
            expect(v.passes()).to.be.false
        })
        it('returns true when the given value is >= the numeric min', function() {
            let v = Validator.make({foo: '5'}, {foo: 'numeric|min:3'})
            expect(v.passes()).to.be.true
        })
        it('returns true when size of given array is >= the array min', function() {
            let v = Validator.make({foo: [1, 2, 3, 4]}, {foo: 'array|min:3'})
            expect(v.passes()).to.be.true
        })
        it('returns false when size of given array is < the array min', function() {
            let v = Validator.make({foo: [1, 2]}, {foo: 'array|min:3'})
            expect(v.passes()).to.be.false
        })
        // SKIP file related tests
    })
    describe('#validateMax()', function() {
        let rules = {
            name: 'max:3'
        }
        it('returns true when length of the given string is <= the specified max', function() {
            let v = Validator.make({ name: 'Rat' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when length of the given string is > the specified max', function() {
            let v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the given value is > the specified numeric max', function() {
            let v = Validator.make({foo: '211'}, {foo: 'numeric|max:100'})
            expect(v.passes()).to.be.false
        })
        it('returns true when the given value is <= the specified numeric max', function() {
            let v = Validator.make({foo: '22'}, {foo: 'numeric|max:33'})
            expect(v.passes()).to.be.true
        })
        it('returns true when size of given array is <= the specified array max size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, {foo: 'array|max:4'})
            expect(v.passes()).to.be.true
        })
        it('returns false when size of given array is > the specified array max size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, {foo: 'array|max:2'})
            expect(v.passes()).to.be.false
        })
        // SKIP file related tests
    })
    describe('#validateIn()', function() {
        it('returns false when given value is not in the list', function() {
            let v = Validator.make({name: 'foo'}, {name: 'in:bar,baz'})
            expect(v.passes()).to.be.false

            v = Validator.make({name: 0}, {name: 'in:bar,baz'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given value is in the last', function() {
            let v = Validator.make({name: 'foo'}, {name: 'in:foo,baz'})
            expect(v.passes()).to.be.true
        })
        it('returns false when any value in the given array is not in the list', function() {
            let v = Validator.make({name: ['foo', 'bar']}, {name: 'array|in:foo,baz'})
            expect(v.passes()).to.be.false
        })
        it('returns true when all value in given array are in the list', function() {
            let v = Validator.make({name: ['foo', 'qux']}, {name: 'array|in:foo,baz,qux'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the field under validation is not an array', function() {
            let v = Validator.make({name: ['foo', 'bar']}, {name: 'alpha|in:foo,bar'})
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNotIn()', function() {
        it('return true when given value is not in the list', function() {
            let v = Validator.make({ name: 'foo' }, {name: 'not_in:bar,baz'})
            expect(v.passes()).to.be.true
        })
        it('returns false when given value is in the list', function() {
            let v = Validator.make({ name: 'foo' }, {name: 'not_in:foo,baz'})
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNumeric()', function() {
        let rules = {
            foo: 'numeric'
        }
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
        let rules = {
            foo: 'integer'
        }
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
        let rules = {
            email: 'email'
        }
        it('returns true when given value looks like an email address', function() {
            let v = Validator.make({ email: 'rati@example.com'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when given value does not look like an email address', function() {
            let v = Validator.make({ email: 'example.com'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validatePresent()', function() {
        let rules = {
            name: 'present'
        }
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
            let v = Validator.make({ x: 'asdasdf'}, { x: 'regex:/^([a-z])+$/i' })
            let result = v.passes()
            expect(result).to.be.true
        })
        it('returns false when the given data fails regex validation', function() {
            let v = Validator.make({ x: 'aasd234fsd1'}, { x: 'regex:/^([a-z])+$/i'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given data has comma delimited value', function() {
            let v = Validator.make({x: 'a,b'}, { x: 'regex:/^a,b$/i'})
            expect(v.passes()).to.be.true
        })
        it('returns true when given data is a string value of "12"', function() {
            let v = Validator.make({x: '12'}, { x: 'regex:/^12$/i'})
            expect(v.passes()).to.be.true
        })
        it('returns true when given data is numeric 123', function() {
            let v = Validator.make({x: 123}, { x: 'regex:/^123$/i'})
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateSame()', function() {
        it('returns false when the specified field has different value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'boom'
            }, {foo: 'same:baz'})
            expect(v.passes()).to.be.false
        })
        it('returns false when the specified field does not present', function() {
            let v = Validator.make({
                'foo': 'bar',
            }, {foo: 'same:baz'})
            expect(v.passes()).to.be.false
        })
        it('returns true when the specified field is present and has the same value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'bar'
            }, {foo: 'same:baz'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the specified field has different numeric value', function() {
            let v = Validator.make({
                'foo': '1e2',
                'baz': '100'
            }, {foo: 'same:baz'})
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateDifferent()', function() {
        let rules = { foo: 'different:baz' }
        it('returns true when the specified field has different value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'boom'
            }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when the specified field does not present', function() {
            let v = Validator.make({
                'foo': 'bar',
            }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the specified field is present and has the same value', function() {
            let v = Validator.make({
                'foo': 'bar',
                'baz': 'bar'
            }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when the specified field has different numeric value', function() {
            let v = Validator.make({
                'foo': '1e2',
                'baz': '100'
            }, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateConfirm()', function() {
        let rules = { password: 'confirmed' }
        it('returns false when confirmation field is not present', function() {
            let v = Validator.make({password: 'foo'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when confirmation field value does not match', function() {
            let v = Validator.make({
                'password': 'foo',
                'password_confirmation': 'bar'
            }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when confirmation field value does match', function() {
            let v = Validator.make({
                'password': 'foo',
                'password_confirmation': 'foo'
            }, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateAccepted()', function() {
        let rules = { foo: 'accepted' }
        it('returns false when given value is "no"', function() {
            let v = Validator.make({ foo: 'no'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is null', function() {
            let v = Validator.make({ foo: null}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the field is not present', function() {
            let v = Validator.make({}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is 0', function() {
            let v = Validator.make({ foo: 0}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is false', function() {
            let v = Validator.make({ foo: false}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given value is string "false"', function() {
            let v = Validator.make({ foo: 'false'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given value is string "yes"', function() {
            let v = Validator.make({ foo: 'yes'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is string "on"', function() {
            let v = Validator.make({ foo: 'on'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is string "1"', function() {
            let v = Validator.make({ foo: '1'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is numeric 1', function() {
            let v = Validator.make({ foo: 1}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is true', function() {
            let v = Validator.make({ foo: true}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is string "true"', function() {
            let v = Validator.make({ foo: 'true'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateDigits()', function() {
        it('returns true when the number of digits given matched', function() {
            let v = Validator.make({foo: '12345'}, {foo: 'digits:5'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the number of digits given does not match', function() {
            let v = Validator.make({foo: '123'}, {foo: 'digits:200'})
            expect(v.passes()).to.be.false
        })
    })
    describe('$validateDigitsBetween()', function() {
        it('returns true when the number of digits given is between the range', function() {
            let v = Validator.make({foo: '12345'}, {foo: 'digits_between:1,6'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the given value is not numeric', function() {
            let v = Validator.make({foo: 'bar'}, {foo: 'digits_between:1,10'})
            expect(v.passes()).to.be.false
        })
        it('returns false when the number of digits given is not in the range', function() {
            let v = Validator.make({foo: '123'}, {foo: 'digits_between:4,5'})
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateSize()', function() {
        it('returns false when string length is more than the given size', function() {
            let v = Validator.make({foo: 'asdad'}, {foo: 'size:3'})
            expect(v.passes()).to.be.false
        })
        it('returns true when string length is equal to the given size', function() {
            let v = Validator.make({foo: 'asd'}, {foo: 'size:3'})
            expect(v.passes()).to.be.true
        })
        it('returns false when numeric value is not equal to the given size', function() {
            let v = Validator.make({foo: '123'}, {foo: 'numeric|size:3'})
            expect(v.passes()).to.be.false
        })
        it('returns true when numeric value is equal to the given size', function() {
            let v = Validator.make({foo: '3'}, {foo: 'numeric|size:3'})
            expect(v.passes()).to.be.true
        })
        it('returns true when given value is array of the given size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, {foo: 'array|size:3'})
            expect(v.passes()).to.be.true
        })
        it('returns false when given value is array of different size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, {foo: 'array|size:4'})
            expect(v.passes()).to.be.false
        })
        // SKIP file related tests
    })
    describe('#validateBetween()', function() {
        it('returns false when given string length is not in the range', function() {
            let v = Validator.make({foo: 'asdad'}, {foo: 'between:3,4'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given string length is in the range', function() {
            let v = Validator.make({foo: 'asd'}, {foo: 'between:3,5'})
            expect(v.passes()).to.be.true

            v = Validator.make({foo: 'asda'}, {foo: 'between:3,5'})
            expect(v.passes()).to.be.true

            v = Validator.make({foo: 'asdad'}, {foo: 'between:3,5'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the given numeric value is not in the specified range', function() {
            let v = Validator.make({foo: '123'}, {foo: 'numeric|between:50,100'})
            expect(v.passes()).to.be.false
        })
        it('returns true when the given numeric value is in the specified range', function() {
            let v = Validator.make({foo: '3'}, {foo: 'numeric|between:1,5'})
            expect(v.passes()).to.be.true
        })
        it('returns true when the given array size is in the specified range', function() {
            let v = Validator.make({foo: [1, 2, 3]}, {foo: 'array|between:1,5'})
            expect(v.passes()).to.be.true
        })
        it('returns false when the given array size is not in the specified range', function() {
            let v = Validator.make({foo: [1, 2, 3]}, {foo: 'array|between:1,2'})
            expect(v.passes()).to.be.false
        })
        // SKIP file related tests
    })
    describe('#validateIp()', function() {
        let rules = { ip: 'ip' }
        it('returns false when given string that does not look like IP address', function() {
            let v = Validator.make({ip: 'asdfsdfsd'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given string that looks loke IP address', function() {
            let v = Validator.make({ip: '127.0.0.1'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateUrl()', function() {
        let rules = { url: 'url' }
        it('returns false when given string that does not look like URL', function() {
            let v = Validator.make({url: 'skd:kssk.slsls.sl'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given string that looks like URL', function() {
            let v = Validator.make({url: 'http://kssk.slsls.sl'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({url: 'http://kssk.slsls.sl/'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({url: 'http://kssk.slsls.sl/sksk'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({url: 'https://kssk.slsls.sl/sksk'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateAlpha()', function() {
        let rules = { x: 'alpha' }
        it('returns false when given string contains linebreak and number character', function() {
            let v = Validator.make({x: "asdfsd2fkl"}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: "asdfsdfk\nsd"}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: "asdfsdfk\tsd"}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: "http://google.com"}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: "123"}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: 123}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given string contains only alphabet character', function() {
            let v = Validator.make({x: 'asdfsdfkl'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateAlphaNum()', function() {
        let rules = { x: 'alpha_num' }
        it('returns true when given string contains alphabet and numeric characters', function() {
            let v = Validator.make({x: 'asdfs234dfk'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when given string contains other non-alpha_num', function() {
            v = Validator.make({x: "http://222.google.com"}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateAlphaDash()', function() {
        let rules = { x: 'alpha_dash' }
        it('returns true when given string contains alphabet, hyphen, and underscore char', function() {
            let v = Validator.make({x: 'aslsl-_3dlks'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when given string contains characters other than alpha_dash', function() {
            let v = Validator.make({x: 'http://-g232oogle.com'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateDate()', function() {
        let rules = { x: 'date' }
        it('returns true when given string can be converted to a Date', function() {
            let v = Validator.make({x: '2000-01-01'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({x: '01/01/2000'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({x: new Date()}, rules)
            expect(v.passes()).to.be.true
        })
        it('return false when given string cannot be converted to a Date', function() {
            let v = Validator.make({x: '1325376000'}, rules)
            expect(v.fails()).to.be.true

            v = Validator.make({x: 'Not a date'}, rules)
            expect(v.fails()).to.be.true

            v = Validator.make({x: ['Not', 'a', 'date']}, rules)
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateBefore()', function() {
        it('returns true when given date is before the specified one', function() {
            let v = Validator.make({x: '2000-01-01'}, {x: 'before:2012-01-01'})
            expect(v.passes()).to.be.true

            v = Validator.make({x: new Date('2000-01-01')}, {x: 'before:2012-01-01'})
            expect(v.passes()).to.be.true
        })
        it('returns false when given date is not a string or number', function() {
            let v = Validator.make({x: ['2000-01-01']}, {x: 'before:2012-01-01'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given date refer to another existing field', function() {
            let v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, {
                start: 'before:ends',
                ends: 'after:start'
            })
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2000-01-01'}, {
                start: 'before:ends',
                ends: 'after:start'
            })
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateBeforeOrEqual()', function() {
        it('returns true when given date is before or equal the specified one', function() {
            let v = Validator.make({x: '2000-01-01'}, {x: 'before_or_equal:2012-01-01'})
            expect(v.passes()).to.be.true

            v = Validator.make({x: '2012-01-01'}, {x: 'before_or_equal:2012-01-01'})
            expect(v.passes()).to.be.true

            v = Validator.make({x: new Date('2000-01-01')}, {x: 'before_or_equal:2012-01-01'})
            expect(v.passes()).to.be.true

            v = Validator.make({x: new Date('2012-01-01')}, {x: 'before_or_equal:2012-01-01'})
            expect(v.passes()).to.be.true
        })
        it('returns false when given date is not a string or number', function() {
            let v = Validator.make({x: ['2000-01-01']}, {x: 'before_or_equal:2012-01-01'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given date refer to another existing field', function() {
            let v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, {
                start: 'before_or_equal:ends',
                ends: 'after:start'
            })
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, {
                start: 'before_or_equal:ends',
                ends: 'after_or_equal:start'
            })
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2000-01-01'}, {
                start: 'before_or_equal:ends',
                ends: 'after:start'
            })
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateAfter()', function() {
        it('returns true when given date is after the specified one', function() {
            let v = Validator.make({x: '2012-01-01'}, {x: 'after:2000-01-01'})
            expect(v.passes()).to.be.true
        })
        it('returns false when given date is not a string or number', function() {
            let v = Validator.make({x: ['2012-01-01']}, {x: 'after:2000-01-01'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given date refer to another existing field', function() {
            let v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, {
                start: 'after:2000-01-01',
                ends: 'after:start'
            })
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2000-01-01'}, {
                start: 'after:2000-01-01',
                ends: 'after:start'
            })
            expect(v.fails()).to.be.true

            v = Validator.make({start: new Date('2012-01-01'), ends: '2000-01-01'}, {
                start: 'before:ends',
                ends: 'after:start'
            })
            expect(v.fails()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: new Date('2000-01-01')}, {
                start: 'before:ends',
                ends: 'after:start'
            })
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateAfterOrEqual()', function() {
        it('returns true when given date is after or equal the specified one', function() {
            let v = Validator.make({x: '2012-01-01'}, {x: 'after_or_equal:2000-01-01'})
            expect(v.passes()).to.be.true

            v = Validator.make({x: '2000-01-01'}, {x: 'after_or_equal:2000-01-01'})
            expect(v.passes()).to.be.true
        })
        it('returns false when given date is not a string or number', function() {
            let v = Validator.make({x: ['2012-01-01']}, {x: 'after_or_equal:2000-01-01'})
            expect(v.passes()).to.be.false
        })
        it('returns true when given date refer to another existing field', function() {
            let v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, {
                start: 'after_or_equal:2000-01-01',
                ends: 'after_or_equal:start'
            })
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2000-01-01'}, {
                start: 'after_or_equal:2000-01-01',
                ends: 'after_or_equal:start'
            })
            expect(v.fails()).to.be.true

            v = Validator.make({start: new Date('2012-01-01'), ends: '2000-01-01'}, {
                start: 'before:ends',
                ends: 'after_or_equal:start'
            })
            expect(v.fails()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: new Date('2000-01-01')}, {
                start: 'before:ends',
                ends: 'after_or_equal:start'
            })
            expect(v.fails()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2012-01-01'}, {
                start: 'before_or_equal:ends',
                ends: 'after_or_equal:start'
            })
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateArray()', function() {
        let rules = { foo: 'array' }
        it('returns true when given data is an array', function() {
            let v = Validator.make({foo: [1, 2, 3]}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when given data is not an array', function() {
            let v = Validator.make({foo: 'xyz'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateFilled()', function() {
        let rules = { name: 'filled' }
        it('returns true when the field is not present', function() {
            let v = Validator.make({}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when the field is present but empty', function() {
            let v = Validator.make({name: ''}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateBoolean()', function() {
        let rules = { foo: 'boolean' }
        it('returns false when given string "no"', function() {
            let v = Validator.make({foo: 'no'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given string "yes"', function() {
            let v = Validator.make({foo: 'yes'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given string "false"', function() {
            let v = Validator.make({foo: 'false'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when given string "true"', function() {
            let v = Validator.make({foo: 'true'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when passing empty data', function() {
            let v = Validator.make({}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given boolean value true or false', function() {
            let v = Validator.make({foo: true}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({foo: false}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value 1 or "1"', function() {
            let v = Validator.make({foo: 1}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({foo: '1'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when given value 0 or "0"', function() {
            let v = Validator.make({foo: 0}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({foo: '0'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateJson()', function() {
        let rules = { foo: 'json' }
        it('returns false when given string is not parsable to JSON', function() {
            let v = Validator.make({foo: 'aksdkd'}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when given string is parsable to JSON', function() {
            let v = Validator.make({foo: '[]'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({foo: '{"name":"John","age":"34"}'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateRequiredWithout()', function() {
        let rules = { last: 'required_without:first' }
        it('returns true when the field under validation is not present if the other specified field is present', function() {
            let v = Validator.make({first: 'Taylor'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when the field under validation is empty while the other specified field is present', function() {
            let v = Validator.make({first: 'Taylor', last: ''}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when the field under validation is not present when the other specified field is empty', function() {
            let v = Validator.make({first: ''}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the data is empty (the field under validation is not present)', function() {
            let v = Validator.make({}, rules)
            expect(v.passes()).to.be.false
        })
        it('returns true when the field under validation is present, but the other specified field is not required', function() {
            let v = Validator.make({first: 'Taylor', last: 'Otwell'}, rules)
            expect(v.passes()).to.be.true
        })
        // SKIP File related test
        it('tests required_without multiple', function() {
            let rules = {
                f1: 'required_without:f2,f3',
                f2: 'required_without:f1,f3',
                f3: 'required_without:f1,f2'
            }
            let v = Validator.make({}, rules)
            expect(v.fails()).to.be.true

            v = Validator.make({f1: 'foo'}, rules)
            expect(v.fails()).to.be.true

            v = Validator.make({f2: 'foo'}, rules)
            expect(v.fails()).to.be.true

            v = Validator.make({f3: 'foo'}, rules)
            expect(v.fails()).to.be.true

            v = Validator.make({f1: 'foo', f2: 'bar'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f1: 'foo', f3: 'bar'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f2: 'foo', f3: 'bar'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f1: 'foo', f2: 'bar', f3: 'baz'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateRequiredWithoutAll()', function() {
        let rules = {
            f1: 'required_without_all:f2,f3',
            f2: 'required_without_all:f1,f3',
            f3: 'required_without_all:f1,f2'
        }
        it('returns false when given data is empty', function() {
            let v = Validator.make({}, rules)
            expect(v.fails()).to.be.true
        })
        it('returns true when the other specified fields are not present', function() {
            let v = Validator.make({f1: 'foo'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f2: 'foo'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f3: 'foo'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns true when the other specified fields are not required', function() {
            let v = Validator.make({f1: 'foo', f2: 'bar'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f1: 'foo', f3: 'bar'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f2: 'foo', f3: 'bar'}, rules)
            expect(v.passes()).to.be.true

            v = Validator.make({f1: 'foo', f2: 'bar', f3: 'baz'}, rules)
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateRequiredIf()', function() {
        it('returns false when the field under validation is not present', function() {
            let v = Validator.make({first: 'taylor'}, {last: 'required_if:first,taylor'})
            expect(v.fails()).to.be.true
        })
        it('returns true when the field under validation must be present if the anotherfield field is equal to any value', function() {
            let v = Validator.make({first: 'taylor', last: 'otwell'}, {last: 'required_if:first,taylor'})
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'taylor', last: 'otwell'}, {last: 'required_if:first,taylor,dayle'})
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'dayle', last: 'rees'}, {last: 'required_if:first,taylor,dayle'})
            expect(v.passes()).to.be.true

            v = Validator.make({foo: true}, {bar: 'required_if:foo,false'})
            expect(v.passes()).to.be.true

            v = Validator.make({foo: true}, {bar: 'required_if:foo,true'})
            expect(v.fails()).to.be.true
        })
        // SKIP test for error message when passed multiple values
    })
    describe('#validateRequiredUnless()', function() {
        it('checks the field under validation must be present unless the anotherfield field is equal to any value', function() {
            let v = Validator.make({first: 'sven'}, {last: 'required_unless:first,taylor'})
            expect(v.fails()).to.be.true

            v = Validator.make({first: 'taylor'}, {last: 'required_unless:first,taylor'})
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'sven', last: 'wittevrongel'}, {last: 'required_unless:first,taylor'})
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'taylor'}, {last: 'required_unless:first,taylor,sven'})
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'sven'}, {last: 'required_unless:first,taylor,sven'})
            expect(v.passes()).to.be.true
        })
        // SKIP test error message when passed multiple values
    })
    describe('#validateString()', function() {
        let rules = { x: 'string' }
        it('returns true when given value is a string', function() {
            let v = Validator.make({x: 'aslsdlks'}, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when given value is not of type string', function() {
            let v = Validator.make({x: ['aa', 'bb']}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: {'aa': '123'}}, rules)
            expect(v.passes()).to.be.false

            v = Validator.make({x: true}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('# Error Messages', function() {
        let rules = {
            name: 'required|min:3',
            age: 'numeric|min:20',
            email: 'required|email'
        }
        it('checks that errors are returned correctly when validation failed', function() {
            let v = Validator.make({age: 15, email: 'rati@example.com'}, rules)
            v.passes()
            expect(v.valid()).to.deep.equal(['email'])
            expect(v.invalid()).to.deep.equal(['name', 'age'])
            expect(v.getErrors()).to.deep.equal({
                name: [
                    'The name field is required.',
                    'The name must be at least 3 characters.'
                ],
                age: [
                    'The age must be at least 20.'
                ]
            })
        })
        it('checks proper messages are returned for sizes rule', function() {
            let v = Validator.make({name: '3'}, {name: 'numeric|min:5'})
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal({
                'name': [
                    'The name must be at least 5.'
                ]
            })

            v = Validator.make({name: 'asdfkjlsd'}, {name: 'size:2'})
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal({
                name: [
                    'The name must be 2 characters.'
                ]
            })
        })
    })
    describe('# Others', function() {
        it('tests that empty rules are skipped', function() {
            let v = Validator.make({x: 'asksksks'}, { x: '|||required|'})
            expect(v.passes()).to.be.true
        })
    })
    describe('# Custom Names', function() {
        let customNames = {
            name: 'Name',
            age: 'Age'
        }
        let rules = {
            name: 'required',
            age: 'required'
        }
        let expectedResult = {
            'name': [
                'The Name field is required.'
            ],
            'age': [
                'The Age field is required.'
            ]
        }
        it('tests custom name being applied using constructor', function() {
            let v = Validator.make({}, rules, {}, customNames)
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal(expectedResult)
        })
        it('tests custom name being applied using addCustomNames()', function() {
            let v = Validator.make({name: ''}, rules)
            v.addCustomNames(customNames)
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal(expectedResult)
        })
        it('tests custom name being applied using setCustomNames()', function() {
            let v = Validator.make({name: ''}, rules)
            v.setCustomNames(customNames)
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal(expectedResult)
        })
    })
    describe('# Custom Messages', function() {
        let rules = {
            name: 'required',
            age: 'required' ,
            email: 'required'
        }

        it('tests custom message for specific rules being applied correctly', function() {
            let customMessages = {
                'required': 'You must provide the :attr.'
            }
            let expectedResult = {
                'name': [
                    'You must provide the name.'
                ],
                'age': [
                    'You must provide the age.'
                ],
                'email': [
                    'You must provide the email.'
                ]
            }
            let v = Validator.make({name: ''}, rules, customMessages)
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal(expectedResult)
        })

        it('tests custom message for specific rules being applied correctly', function() {
            let customMessages = {
                'name.required': ':attr is required.',
                'age.required': ':Attr field is required.',
                'email.required': ':ATTR field must not be blank.'
            }
            let expectedResult = {
                'name': [
                    'name is required.'
                ],
                'age': [
                    'Age field is required.'
                ],
                'email': [
                    'EMAIL field must not be blank.'
                ]
            }
            let v = Validator.make({name: ''}, rules, customMessages)
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal(expectedResult)
        })
    })
    describe('# Displayable values are replaced', function() {
        it('tests required_if:foo,bar', function() {
            let v = Validator.make({color: '1', bar: ''}, {bar: 'required_if:color,1'})
            v.addCustomValues({ 'color': {'1': 'Red'} })
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal({
                'bar': [
                    'The bar field is required when color is Red.'
                ]
            })
        })
        it('tests in:foo,bar using addCustomValues()', function() {
            let v = Validator.make(
                { type: '4' },
                { type: 'in:5,300' },
                { 'type.in': ':attr must be included in :values.'}
            )
            v.addCustomValues({
                'type': {
                    '5': 'Short',
                    '300': 'Long'
                }
            })
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal({
                'type': [
                    'type must be included in Short, Long.'
                ]
            })
        })
        it('tests in:foo,bar using setValueNames()', function() {
            let v = Validator.make(
                { type: '4' },
                { type: 'in:5,300' },
                { 'type.in': ':attr must be included in :values.'}
            )
            v.setValueNames({
                'type': {
                    '5': 'Short',
                    '300': 'Long'
                }
            })
            expect(v.passes()).to.be.false
            expect(v.getErrors()).to.deep.equal({
                'type': [
                    'type must be included in Short, Long.'
                ]
            })
        })
    })

    describe('# nullable rule tests' , () => {
        it('should passed a empty date with "nullable" rule' , () => {
            let v = Validator.make({
                name: 'adrian'
            } , {
                name: 'required|string',
                lastName: 'nullable|string'
            });
            expect(v.passes()).to.be.true;
        });

        it('should passed a date with "nullable" rule' , () => {
            let v = Validator.make({
                name: 'adrian',
                lastName: 'locurcio'
            } , {
                name: 'required|string',
                lastName: 'nullable|string'
            });
            expect(v.passes()).to.be.true;
        });
    })
})

/*
## untested
## pending
mime_types
timezone
exists (DB)
unique (DB)
dimensions (Image)
distinct
filled
image (File)
in_array

## not available
alphp -- other dialects
alpha_num -- other dialects
alpha_dash -- other dialects
date_format
after -- not work with string like 'today', 'tomorrow', etc.
before -- same as above

 */
