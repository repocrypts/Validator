'use strict';

var Validator = require('./Validator.js');

var rules = [{ name: 'name', rules: 'required|min:3' }, { name: 'email', rules: 'required|email' }, { name: 'age', rules: 'integer' }];

var data = {
    name: 'Rati',
    email: 'rati@mui.co.th'
};

var vv = Validator.default.make(data, rules);

console.log(data, rules, vv.passes());
