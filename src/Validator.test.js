import { expect } from 'chai'
import Validator from './Validator'

let rules = [
    {name: 'name', rules: 'required|min:3'},
    {name: 'email', rules: 'required|email|unique:users'},
    {name: 'age', rules: 'integer'}
]

let data = {
    name: 'Rati',
    email: 'rati@mui.co.th'
}


describe('Validator', function() {
    describe('new Validator', function() {
        it('should be instantiatable', function() {
            expect(new Validator(data, rules)).to.be.ok
        })
    })
    describe('make', function() {
        it('should be instantiatable', function() {
            expect(Validator.make(data, rules)).to.be.ok
        })
    })
    describe('hasError', function() {
        it('should returns errors', function() {
            var v = Validator.make({name: 'Test'}, [{
                name: 'name',
                rules: 'required|min:6'
            }])
            v.passes()
            expect(v.hasError()).to.be.true
        })
    })
})