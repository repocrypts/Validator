import Validator from './Validator'

let rules = [
    {name: 'name', rules: 'required|min:3'},
    {name: 'email', rules: 'required|email'},
    {name: 'age', rules: 'integer'}
]

let data = {
    name: 'Rati',
    email: 'rati@mui.co.th'
}

let vv = Validator.make(data, rules)

console.log(data, rules, vv.passes())
