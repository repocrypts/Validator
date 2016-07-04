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

            arr = v.getRule('name', ['Min'])
            expect(arr).to.deep.equal(['Min', ['3']])
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
        it('return false when the required field is not present', function() {
            let v = Validator.make({}, [{name: 'name', rules: 'required'}])
            expect(v.passes()).to.be.false
        })
        it('return false when the required field is present but empty', function() {
            let v = Validator.make({name: ''}, [{name: 'name', rules: 'required'}])
            expect(v.passes()).to.be.false
        })
        it('return true when the required field is present and has value', function() {
            let v = Validator.make({name: 'foo'}, [{name: 'name', rules: 'required'}])
            expect(v.passes()).to.be.true
        })
        /* SKIP File related test */
    })
    describe('#validateRequiredWith()', function() {
        let rules = [
            {name: 'last', rules: 'required_with:first'}
        ]
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
        /* SKIP File related test */
    })
    describe('#validateRequiredWithAll()', function() {
        it('returns true when the field under validation must be present only if all of the other specified fields are present', function() {
            let v = Validator.make({first: 'foo'}, [{name: 'last', rules: 'required_with_all:first,foo'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the field under validation is not present', function() {
            let v = Validator.make({first: 'foo'}, [{name: 'last', rules: 'required_with_all:first'}])
            expect(v.passes()).to.be.false
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
        it('returns true when the length of given string is >= the specified "min"', function() {
            let v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when the length of given string is < the specified "min"', function() {
            let v = Validator.make({ name: 'Ra' }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the given value is < the numeric min', function() {
            let v = Validator.make({foo: '2'}, [{name: 'foo', rules: 'numeric|min:3'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when the given value is >= the numeric min', function() {
            let v = Validator.make({foo: '5'}, [{name: 'foo', rules: 'numeric|min:3'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when size of given array is >= the array min', function() {
            let v = Validator.make({foo: [1, 2, 3, 4]}, [{name: 'foo', rules: 'array|min:3'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when size of given array is < the array min', function() {
            let v = Validator.make({foo: [1, 2]}, [{name: 'foo', rules: 'array|min:3'}])
            expect(v.passes()).to.be.false
        })
        /* SKIP file related tests */
    })
    describe('#validateMax()', function() {
        let rules = [
            { name: 'name', rules: 'max:3'}
        ]
        it('returns true when length of the given string is <= the specified max', function() {
            let v = Validator.make({ name: 'Rat' }, rules)
            expect(v.passes()).to.be.true
        })
        it('returns false when length of the given string is > the specified max', function() {
            let v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.false
        })
        it('returns false when the given value is > the specified numeric max', function() {
            let v = Validator.make({foo: '211'}, [{name: 'foo', rules: 'numeric|max:100'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when the given value is <= the specified numeric max', function() {
            let v = Validator.make({foo: '22'}, [{name: 'foo', rules: 'numeric|max:33'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when size of given array is <= the specified array max size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array|max:4'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when size of given array is > the specified array max size', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array|max:2'}])
            expect(v.passes()).to.be.false
        })
        /* SKIP file related tests */
    })
    describe('#validateIn()', function() {
        it('returns false when given value is not in the list', function() {
            let v = Validator.make({name: 'foo'}, [{name: 'name', rules: 'in:bar,baz'}])
            expect(v.passes()).to.be.false

            v = Validator.make({name: 0}, [{name: 'name', rules: 'in:bar,baz'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given value is in the last', function() {
            let v = Validator.make({name: 'foo'}, [{name: 'name', rules: 'in:foo,baz'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when any value in the given array is not in the list', function() {
            let v = Validator.make({name: ['foo', 'bar']}, [{name: 'name', rules: 'array|in:foo,baz'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when all value in given array are in the list', function() {
            let v = Validator.make({name: ['foo', 'qux']}, [{name: 'name', rules: 'array|in:foo,baz,qux'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the field under validation is not an array', function() {
            let v = Validator.make({name: ['foo', 'bar']}, [{name: 'name', rules: 'alpha|in:foo,bar'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNotIn()', function() {
        it('return true when given value is not in the list', function() {
            let v = Validator.make({ name: 'foo' }, [{name: 'name', rules: 'not_in:bar,baz'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given value is in the list', function() {
            let v = Validator.make({ name: 'foo' }, [{name: 'name', rules: 'not_in:foo,baz'}])
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
        /* SKIP file related tests */
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
        /* SKIP file related tests */
    })
    describe('#validateIp()', function() {
        it('returns false when given string that does not look like IP address', function() {
            let v = Validator.make({ip: 'asdfsdfsd'}, [{name: 'ip', rules: 'ip'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given string that looks loke IP address', function() {
            let v = Validator.make({ip: '127.0.0.1'}, [{name: 'ip', rules: 'ip'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateUrl()', function() {
        it('returns false when given string that does not look like URL', function() {
            let v = Validator.make({url: 'skd:kssk.slsls.sl'}, [{name: 'url', rules: 'url'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given string that looks like URL', function() {
            let v = Validator.make({url: 'http://kssk.slsls.sl'}, [{name: 'url', rules: 'url'}])
            expect(v.passes()).to.be.true

            v = Validator.make({url: 'http://kssk.slsls.sl/'}, [{name: 'url', rules: 'url'}])
            expect(v.passes()).to.be.true

            v = Validator.make({url: 'http://kssk.slsls.sl/sksk'}, [{name: 'url', rules: 'url'}])
            expect(v.passes()).to.be.true

            v = Validator.make({url: 'https://kssk.slsls.sl/sksk'}, [{name: 'url', rules: 'url'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateAlpha()', function() {
        it('returns false when given string contains linebreak and number character', function() {
            let v = Validator.make({x: "asdfsd2fkl"}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: "asdfsdfk\nsd"}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: "asdfsdfk\tsd"}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: "http://google.com"}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: "123"}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: 123}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given string contains only alphabet character', function() {
            let v = Validator.make({x: 'asdfsdfkl'}, [{name: 'x', rules: 'alpha'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateAlphaNum()', function() {
        it('returns true when given string contains alphabet and numeric characters', function() {
            let v = Validator.make({x: 'asdfs234dfk'}, [{name: 'x', rules: 'alpha_num'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given string contains other non-alpha_num', function() {
            v = Validator.make({x: "http://222.google.com"}, [{name: 'x', rules: 'alpha_num'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateAlphaDash()', function() {
        it('returns true when given string contains alphabet, hyphen, and underscore char', function() {
            let v = Validator.make({x: 'aslsl-_3dlks'}, [{name: 'x', rules: 'alpha_dash'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given string contains characters other than alpha_dash', function() {
            let v = Validator.make({x: 'http://-g232oogle.com'}, [{name: 'x', rules: 'alpha_dash'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateDate()', function() {
        it('returns true when given string can be converted to a Date', function() {
            let v = Validator.make({x: '2000-01-01'}, [{name: 'x', rules: 'date'}])
            expect(v.passes()).to.be.true

            v = Validator.make({x: '01/01/2000'}, [{name: 'x', rules: 'date'}])
            expect(v.passes()).to.be.true

            v = Validator.make({x: new Date()}, [{name: 'x', rules: 'date'}])
            expect(v.passes()).to.be.true
        })
        it('return false when given string cannot be converted to a Date', function() {
            let v = Validator.make({x: '1325376000'}, [{name: 'x', rules: 'date'}])
            expect(v.fails()).to.be.true

            v = Validator.make({x: 'Not a date'}, [{name: 'x', rules: 'date'}])
            expect(v.fails()).to.be.true

            v = Validator.make({x: ['Not', 'a', 'date']}, [{name: 'x', rules: 'date'}])
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateBefore()', function() {
        it('returns true when given date is before the specified one', function() {
            let v = Validator.make({x: '2000-01-01'}, [{name: 'x', rules: 'before:2012-01-01'}])
            expect(v.passes()).to.be.true

            v = Validator.make({x: new Date('2000-01-01')}, [{name: 'x', rules: 'before:2012-01-01'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given date is not a string or number', function() {
            let v = Validator.make({x: ['2000-01-01']}, [{name: 'x', rules: 'before:2012-01-01'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given date refer to another existing field', function() {
            let v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, [
                {name: 'start', rules: 'before:ends'},
                {name: 'ends', rules: 'after:start'}
            ])
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2000-01-01'}, [
                {name: 'start', rules: 'before:ends'},
                {name: 'ends', rules: 'after:start'}
            ])
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateAfter()', function() {
        it('returns true when given date is after the specified one', function() {
            let v = Validator.make({x: '2012-01-01'}, [{name: 'x', rules: 'after:2000-01-01'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given date is not a string or number', function() {
            let v = Validator.make({x: ['2012-01-01']}, [{name: 'x', rules: 'after:2000-01-01'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given date refer to another existing field', function() {
            let v = Validator.make({start: '2012-01-01', ends: '2013-01-01'}, [
                {name: 'start', rules: 'after:2000-01-01'},
                {name: 'ends', rules: 'after:start'}
            ])
            expect(v.passes()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: '2000-01-01'}, [
                {name: 'start', rules: 'after:2000-01-01'},
                {name: 'ends', rules: 'after:start'}
            ])
            expect(v.fails()).to.be.true

            v = Validator.make({start: new Date('2012-01-01'), ends: '2000-01-01'}, [
                {name: 'start', rules: 'before:ends'},
                {name: 'ends', rules: 'after:start'}
            ])
            expect(v.fails()).to.be.true

            v = Validator.make({start: '2012-01-01', ends: new Date('2000-01-01')}, [
                {name: 'start', rules: 'before:ends'},
                {name: 'ends', rules: 'after:start'}
            ])
            expect(v.fails()).to.be.true
        })
    })
    describe('#validateArray()', function() {
        it('returns true when given data is an array', function() {
            let v = Validator.make({foo: [1, 2, 3]}, [{name: 'foo', rules: 'array'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given data is not an array', function() {
            let v = Validator.make({foo: 'xyz'}, [{name: 'foo', rules: 'array'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateBoolean()', function() {
        it('returns false when given string "no"', function() {
            let v = Validator.make({foo: 'no'}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given string "yes"', function() {
            let v = Validator.make({foo: 'yes'}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given string "false"', function() {
            let v = Validator.make({foo: 'false'}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when given string "true"', function() {
            let v = Validator.make({foo: 'true'}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when passing empty data', function() {
            let v = Validator.make({}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given boolean value true or false', function() {
            let v = Validator.make({foo: true}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: false}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value 1 or "1"', function() {
            let v = Validator.make({foo: 1}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: '1'}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when given value 0 or "0"', function() {
            let v = Validator.make({foo: 0}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: '0'}, [{name: 'foo', rules: 'boolean'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateJson()', function() {
        it('returns false when given string is not parsable to JSON', function() {
            let v = Validator.make({foo: 'aksdkd'}, [{name: 'foo', rules: 'json'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when given string is parsable to JSON', function() {
            let v = Validator.make({foo: '[]'}, [{name: 'foo', rules: 'json'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: '{"name":"John","age":"34"}'}, [{name: 'foo', rules: 'json'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('#validateRequiredWithout()', function() {
        it('returns true when the field under validation is not present if the other specified field is present', function() {
            let v = Validator.make({first: 'Taylor'}, [{name: 'last', rules: 'required_without:first'}])
            expect(v.passes()).to.be.true
        })
        it('returns true when the field under validation is empty while the other specified field is present', function() {
            let v = Validator.make({first: 'Taylor', last: ''}, [{name: 'last', rules: 'required_without:first'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when the field under validation is not present when the other specified field is empty', function() {
            let v = Validator.make({first: ''}, [{name: 'last', rules: 'required_without:first'}])
            expect(v.passes()).to.be.false
        })
        it('returns false when the data is empty (the field under validation is not present)', function() {
            let v = Validator.make({}, [{name: 'last', rules: 'required_without:first'}])
            expect(v.passes()).to.be.false
        })
        it('returns true when the field under validation is present, but the other specified field is not required', function() {
            let v = Validator.make({first: 'Taylor', last: 'Otwell'}, [{name: 'last', rules: 'required_without:first'}])
            expect(v.passes()).to.be.true
        })
        /* SKIP File related test */
        it('tests required_without multiple', function() {
            let rules = [
                { name: 'f1', rules: 'required_without:f2,f3'},
                { name: 'f2', rules: 'required_without:f1,f3'},
                { name: 'f3', rules: 'required_without:f1,f2'}
            ]
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
        let rules = [
            { name: 'f1', rules: 'required_without_all:f2,f3'},
            { name: 'f2', rules: 'required_without_all:f1,f3'},
            { name: 'f3', rules: 'required_without_all:f1,f2'}
        ]
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
            let v = Validator.make({first: 'taylor'}, [{name: 'last', rules: 'required_if:first,taylor'}])
            expect(v.fails()).to.be.true
        })
        it('returns true when the field under validation must be present if the anotherfield field is equal to any value', function() {
            let v = Validator.make({first: 'taylor', last: 'otwell'}, [{name: 'last', rules: 'required_if:first,taylor'}])
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'taylor', last: 'otwell'}, [{name: 'last', rules: 'required_if:first,taylor,dayle'}])
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'dayle', last: 'rees'}, [{name: 'last', rules: 'required_if:first,taylor,dayle'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: true}, [{name: 'bar', rules: 'required_if:foo,false'}])
            expect(v.passes()).to.be.true

            v = Validator.make({foo: true}, [{name: 'bar', rules: 'required_if:foo,true'}])
            expect(v.fails()).to.be.true
        })
        /* SKIP test for error message when passed multiple values */
    })
    describe('#validateRequiredUnless()', function() {
        it('checks the field under validation must be present unless the anotherfield field is equal to any value', function() {
            let v = Validator.make({first: 'sven'}, [{name: 'last', rules: 'required_unless:first,taylor'}])
            expect(v.fails()).to.be.true

            v = Validator.make({first: 'taylor'}, [{name: 'last', rules: 'required_unless:first,taylor'}])
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'sven', last: 'wittevrongel'}, [{name: 'last', rules: 'required_unless:first,taylor'}])
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'taylor'}, [{name: 'last', rules: 'required_unless:first,taylor,sven'}])
            expect(v.passes()).to.be.true

            v = Validator.make({first: 'sven'}, [{name: 'last', rules: 'required_unless:first,taylor,sven'}])
            expect(v.passes()).to.be.true
        })
        /* SKIP test error message when passed multiple values */
    })
    describe('#validateString()', function() {
        it('returns true when given value is a string', function() {
            let v = Validator.make({x: 'aslsdlks'}, [{name: 'x', rules: 'string'}])
            expect(v.passes()).to.be.true
        })
        it('returns false when given value is not of type string', function() {
            let v = Validator.make({x: ['aa', 'bb']}, [{name: 'x', rules: 'string'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: {'aa': '123'}}, [{name: 'x', rules: 'string'}])
            expect(v.passes()).to.be.false

            v = Validator.make({x: true}, [{name: 'x', rules: 'string'}])
            expect(v.passes()).to.be.false
        })
    })
    describe('# Others', function() {
        it('tests that empty rules are skipped', function() {
            let v = Validator.make({x: 'asksksks'}, [{name: 'x', rules: '|||required|'}])
            expect(v.passes()).to.be.true
        })
    })
    describe('# Messages', function() {
        let rules = [
            { name: 'foo', rules: 'required'},
            { name: 'age', rules: 'numeric|min:20'}
        ]
        it('tests', function() {
            let v = Validator.make({age: 15}, rules)
            v.passes()
            expect(v.getErrors()).to.deep.equal([
                {
                    name: 'foo',
                    rule: 'Required',
                    message: 'The foo field is required.'
                },
                {
                    name: 'age',
                    rule: 'Min',
                    message: 'The age must be at least 20.'
                }
            ])
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
between
ip
url
alpha
alpha_num
alpha_dash
before (date)
after (date)
array
boolean
json
required_if
required_unless
required_with
required_with_all
required_without
required_without_all
string

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
