# Validator

[![npm](https://img.shields.io/npm/v/Validator.svg)](https://www.npmjs.com/package/Validator)
[![Travis build](https://img.shields.io/travis/jfstn/Validator.svg)](https://travis-ci.org/jfstn/Validator)
[![Coverage Status](https://coveralls.io/repos/github/jfstn/Validator/badge.svg?branch=master)](https://coveralls.io/github/jfstn/Validator?branch=master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjfstn%2FValidator.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjfstn%2FValidator?ref=badge_shield)

A client-side JavaScript validation package, based on Laravel 5.2 validation.

## Installation

1.  Included as global `<script>`, copy the `Validator.js` file inside `dist` directory to your project directory
    and reference it in the script tag. Or, you can use NPMCDN to reference it like so,

    ```html
    <head>
        <script src="public/js/Validator.js"></script>
        <!-- or using NPMCDN -->
        <script src="https://unpkg.com/Validator"></script>
    </head>
    ```

2.  Using NPM
    ```bash
    npm install Validator --save
    ```
    ```javascript
    const Validator = require('Validator');
    ```

## Usage

-   Basic usage

    ```javascript
    const data = {
        name: 'John Doe',
        company: 'Example Co.',
        birthday: '1985-04-16'
    };

    const rules = {
        name: 'required',
        // for multiple rules
        birthday: 'required|date', // can be a piped string
        company: ['required', 'string'] // can be an array of strings
    };

    const v = Validator.make(data, rules);

    if (v.fails()) {
        const errors = v.getErrors();
        console.log(errors);
    }
    ```

    `getErrors()` will return an object containing error field as a key and array of error messages for that field.

-   Custom Error Messages

    ```javascript
    const messages = {
        // custom message for based rules
        required: 'You forgot the :attr field',
        email: ':attr is not valid',
        // custom message for specific rule of attribute
        'receiver.email': 'The receiver email address is not valid'
    };

    const v = Validator.make(data, rules, messages);

    if (v.passes()) {
        //...
    }
    ```

-   Custom Name

    ```javascript
    const v = Validator.make(data, rules, messages, { email: 'Email Address' });
    ```

## Supported Validation Rules

See validation rule usage in [Laravel Documentation](https://laravel.com/docs/5.2/validation#available-validation-rules)

-   accepted
-   after (date)
-   alpha
-   alpha_num
-   alpha_dash
-   array
-   before (date)
-   between
-   boolean
-   confirmed
-   date
-   different
-   digits
-   digits_between
-   email
-   filled
-   in
-   integer
-   ip
-   json
-   max
-   min
-   not_in
-   numeric
-   present
-   regex
-   required
-   required_if
-   required_unless
-   required_with
-   required_with_all
-   required_without
-   required_without_all
-   same
-   size
-   string
-   url

## Extending with Custom Validation Rules

The validator can be extended with custom rules

```javascript
const rules = {
    id: 'required|mongoid'
};

function validateMongoId(name, value, params) {
    let hexadecimal = /^[0-9A-F]+$/i;
    return value && hexadecimal.test(value) && value.length === 24;
}

const v = Validator.make(data, rules);
v.extend('mongoid', validateMongoId, ':attr is not a valid mongo id');

if (v.passes()) {
    //...
}
```

`validator.extend` takes three _required_ parameters:

-   `name`: the name of the custom rule
-   `callback`: called when the rule is checked
-   `validationMessage`: error message text on validation failure

The validation callback receives three parameters:

1. `name`: the field name being validated
2. `value`: the given value in the data
3. `params`: Any parameters, passed after the colon in the rule definition.

Params defined ike so: `rulename:min=10,max=15` would be passed in as an array: `['min=10', 'max=15']`
