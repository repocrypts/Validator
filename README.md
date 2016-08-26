# Javascript Validator library
[![Travis build](https://img.shields.io/travis/ratiw/Validator.svg)](https://travis-ci.org/ratiw/Validator)
[![npm](https://img.shields.io/npm/v/Validator.svg)](https://www.npmjs.com/package/Validator)

> Client-side javascript validator library. Ports from Laravel 5.2

## Instalation

1. Included as global `<script>`, copy the `Validator.js` file inside `dist` directory to your project directory
and reference it in the script tag. Or, you can use NPMCDN to reference it like so,

    ```html
    <head>
        <script src="public/js/Validator.js"></script>
        <!-- or using NPMCDN -->
        <script src="https://npmcdn.com/Validator"></script>
    </head>
    ```

2. Using NPM
    ```bash
    npm install Validator --save
    ```
    ```javascript
    var Validator = require('Validator')
    ```

## Usage
```javascript
    var data = {
        name: 'John Doe',
        company: 'Example Co.',
        birthday: '1985-04-16'
    }
    var rules = {
        name: 'required',
        birthday: 'required|date'
    }
    
    var v = Validator.make(data, rules)

    if (v.fails()) {
        var errors = v.getErrors()
        console.log(errors)
    }
```

## Supported Validation Rules

See validation rule usage in [Laravel Documentation](https://laravel.com/docs/5.2/validation#available-validation-rules)

- accepted
- after (date)
- alpha
- alpha_num
- alpha_dash
- array
- before (date)
- between
- boolean
- confirmed
- date
- different
- digits
- digits_between
- email
- filled
- in
- integer
- ip
- json
- max
- min
- not_in
- numeric
- present
- regex
- required
- required_if
- required_unless
- required_with
- required_with_all
- required_without
- required_without_all
- same
- size
- string
- url
