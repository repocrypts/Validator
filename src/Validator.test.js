import { expect } from 'chai'
import Validator from './Validator'
import Rules from './Rules'

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
    describe('new Validator', function() {
        it('should be instantiatable', function() {
            expect(new Validator(data, rules)).to.be.ok
        })
    })
    describe('#make()', function() {
        it('should be instantiatable', function() {
            expect(Validator.make(data, rules)).to.be.ok
        })
    })
    describe('#parseEachRule()', function() {
        var rules = [
            { name: 'name', rules: 'required|min:3' },
            { name: 'group', rules: 'not_in:admin,exec'}
        ]
        var v = Validator.make({name: 'Rati'}, rules)

        it('should parse each rule correctly', function() {
            var arr = v.parseEachRule(rules[0].rules)
            expect(arr).to.be.lengthOf(2)
            expect(arr).to.deep.equal([
                { name: 'Required', params: [] },
                { name: 'Min', params: ['3'] }
            ])

            var arr = v.parseEachRule(rules[1].rules)
            expect(arr).to.deep.equal([
                { name: 'NotIn', params: ['admin', 'exec'] }
            ])
        })
    })
    describe('#parseRules()', function() {
        var rules = [
            { name: 'name', rules: 'required|min:3' },
            { name: 'group', rules: 'not_in:admin,exec'}
        ]
        var v = Validator.make({name: 'Rati'}, rules)

        it('should parse all rules correctly', function() {
            var arr = v.parseRules(rules)
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
        it('should return errors', function() {
            var v = Validator.make({name: 'Test'}, [{
                name: 'name',
                rules: 'required|min:6'
            }])
            v.passes()
            expect(v.hasError()).to.be.true
        })
    })
    describe('#titleCase()', function() {
        it('should return title case', function() {
            expect(v.titleCase('hello world')).to.equal('HelloWorld')
        })
        it('should return title case using hyphen as delimiter', function() {
            expect(v.titleCase('hello-world', '-')).to.equal('HelloWorld')
        })
    })
    describe('#snakeCase()', function() {
        it('should return snake case', function() {
            expect(v.snakeCase('helloWorld')).to.equal('hello_world')
        })
        it('should return snake case using hyphen as delimiter', function() {
            expect(v.snakeCase('helloWorld', '-')).to.equal('hello-world')
        })
    })
    describe('#getValue()', function() {
        it('should return correct value', function() {
            expect(v.getValue('email')).to.equal('rati@example.com')
        })
        it('should return empty string when given incorrect key', function() {
            expect(v.getValue('wrong-key')).to.equal('')
        })
    })
    describe('#passes()', function() {
        it('should pass all validation', function() {
            var v = Validator.make(data,
                [
                    { name: 'name', rules: 'required' },
                    { name: 'email', rules: 'required|email' }
                ]
            )
            expect(v.passes()).to.be.true
        })
    })
    describe('#fails()', function() {
        it('should fail validation', function() {
            var v = Validator.make(data,
                [
                    { name: 'name', rules: 'required' },
                    { name: 'email', rules: 'required|email' },
                    { name: 'age', rules: 'required' }
                ]
            )
            expect(v.fails()).to.be.true
        })
    })
    describe('#getErrors()', function() {
        it('should return errors', function() {
            var v = Validator.make(data,
                [
                    { name: 'name', rules: 'required' },
                    { name: 'email', rules: 'required|email' },
                    { name: 'age', rules: 'required' }
                ]
            )
            v.fails()
            expect(v.getErrors()).to.have.lengthOf(1)
        })
    })
    describe('#validateRequired()', function() {
        var rules = [{ name: 'email', rules: 'required'}]
        it('should pass validation for required rule', function() {
            var v = Validator.make(
                { email: 'rati@example.com' },rules
            )
            expect(v.passes()).to.be.true
        })
        it('should fail validation for required rule', function() {
            var v = Validator.make(
                { name: 'Rati' }, rules
            )
            expect(v.fails()).to.be.true
        })
    })
    describe('#getSize()', function() {
        it('should return correct parameter value', function() {
            expect(Rules.getSize('name', 'Rati')).to.equal(4)
        })
    })
    describe('#validateMin()', function() {
        var rules = [
            { name: 'name', rules: 'min:3'}
        ]
        it('should pass validation', function() {
            var v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail validation', function() {
            var v = Validator.make({ name: 'Ra' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateMax()', function() {
        var rules = [
            { name: 'name', rules: 'max:3'}
        ]
        it('should pass validation', function() {
            var v = Validator.make({ name: 'Rat' }, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail validation', function() {
            var v = Validator.make({ name: 'Rati' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateIn()', function() {
        var rules = [
            { name: 'name', rules: 'in:mom,dad,children'}
        ]
        it('should pass validation', function() {
            var v = Validator.make({ name: 'dad' }, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail validation', function() {
            var v = Validator.make({ name: 'me' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNotIn()', function() {
        var rules = [
            { name: 'name', rules: 'not_in:mom,dad,children'}
        ]
        it('should pass validation', function() {
            var v = Validator.make({ name: 'me' }, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail validation', function() {
            var v = Validator.make({ name: 'dad' }, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateNumeric()', function() {
        var rules = [
            { name: 'amount', rules: 'numeric' }
        ]
        it('should pass numeric validation', function() {
            var v = Validator.make({ amount: '100.25'}, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail numeric validation', function() {
            var v = Validator.make({ amount: '100AAB.00'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateInteger()', function() {
        var rules = [
            { name: 'amount', rules: 'integer' }
        ]
        it('should pass integer validation', function() {
            var v = Validator.make({ amount: '100'}, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail integer validation', function() {
            var v = Validator.make({ amount: '100.25'}, rules)
            expect(v.passes()).to.be.false
        })
    })
    describe('#validateEmail()', function() {
        var rules = [
            { name: 'email', rules: 'email' }
        ]
        it('should pass email validation', function() {
            var v = Validator.make({ email: 'rati@example.com'}, rules)
            expect(v.passes()).to.be.true
        })
        it('should fail email validation', function() {
            var v = Validator.make({ email: 'example.com'}, rules)
            expect(v.passes()).to.be.false
        })
    })
})