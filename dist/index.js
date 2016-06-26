'use strict';

var _Validator = require('./Validator');

var _Validator2 = _interopRequireDefault(_Validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rules = [{ name: 'name', rules: 'required|min:3' }, { name: 'email', rules: 'required|email|unique:users' }, { name: 'age', rules: 'integer' }];

var data = {
    name: 'Rati',
    email: 'rati@mui.co.th'
};

var vv = _Validator2.default.make(data, rules);

console.log(data, rules, vv.passes());