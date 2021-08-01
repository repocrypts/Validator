import { expect } from 'chai';
import Validator from '../src/validator.js';

const rules = {
    name: 'required|min:3',
    email: 'required|email',
    age: 'integer',
};

const data = {
    name: 'Rati',
    email: 'rati@example.com',
};

const v = new Validator(data, rules);

describe('Validator', () => {
    describe('is instantiable', () => {
        it('instantiable using new Validator(...)', () => {
            expect(new Validator(data, rules)).to.be.ok;
        });

        it('instantiable using Validator.make(...)', () => {
            expect(Validator.make(data, rules)).to.be.ok;
        });
    });

    describe('#parseItemRules()', () => {
        const rules = {
            name: 'required|min:3',
            group: 'not_in:admin,exec',
            nick: ['required', 'string'],
        };

        const v = Validator.make({ name: 'Rati', nick: 'Rati' }, rules);

        it('parses multiple piped rules correctly', () => {
            const arr = v.parseItemRules(rules['name']);

            expect(arr).to.be.lengthOf(2);
            expect(arr).to.deep.equal([
                { name: 'Required', params: [] },
                { name: 'Min', params: ['3'] },
            ]);
        });

        it('parses array of rules correctly', () => {
            const arr = v.parseItemRules(rules['nick']);

            expect(arr).to.be.lengthOf(2);
            expect(arr).to.be.deep.equal([
                { name: 'Required', params: [] },
                { name: 'String', params: [] },
            ]);
        });

        it('parses rule with array argument (not_in)', () => {
            const arr = v.parseItemRules(rules['group']);

            expect(arr).to.deep.equal([
                { name: 'NotIn', params: ['admin', 'exec'] },
            ]);
        });

        //it('should not validate deep objects', () => {
        // const data = {
        //     name: 'John Doe',
        //     test: {
        //         birthday: '20000000000000',
        //     },
        //     company: 'Example Co.',
        // };

        // const rules = {
        //     name: 'required',
        //     test: {
        //         birthday: 'required',
        //     },
        //     company: ['required', 'string'],
        // };

        // const v = Validator.make(data, rules);

        // if (v.fails()) {
        //     const errors = v.getErrors();
        //     console.log(errors);
        // } else {
        //     console.log('good!');
        // }
        // });
    });

    describe('#parseRules()', () => {
        const rules = {
            name: 'required|min:3',
            group: 'not_in:admin,exec',
        };

        const v = Validator.make({ name: 'Rati' }, rules);

        it('parses rules on every item correctly', () => {
            const arr = v.parseRules(rules);

            expect(arr).to.deep.equal([
                {
                    name: 'name',
                    rules: [
                        { name: 'Required', params: [] },
                        { name: 'Min', params: ['3'] },
                    ],
                },
                {
                    name: 'group',
                    rules: [{ name: 'NotIn', params: ['admin', 'exec'] }],
                },
            ]);
        });
    });
    describe('#getRule()', () => {
        const rules = {
            name: 'required|min:3',
            group: 'in:admin,exec',
        };

        const data = {
            name: 'Rati',
            group: 'admin',
        };

        const v = Validator.make(data, rules);

        it('returns correct array when item is in the given rules', () => {
            let arr = v.getRule('name', ['Required']);
            expect(arr).to.deep.equal(['Required', []]);

            arr = v.getRule('name', ['Min']);
            expect(arr).to.deep.equal(['Min', ['3']]);
        });

        it('returns null when item is not in the given rules', () => {
            const arr = v.getRule('group', ['Required']);

            expect(arr).to.be.null;
        });
    });

    describe('#extend()', () => {
        const isMongoId = (name, value, args) => {
            const hexadecimal = /^[0-9A-F]+$/i;
            return value && hexadecimal.test(value) && value.length === 24;
        };

        const rules = { id: 'mongoid:min=24,max=24' };

        const v = Validator.make({ id: '5915b8434479e9b7e11db37c' }, rules);

        v.extend('mongoid', isMongoId, ':attr must be a valid mongo id');

        const fail_v = Validator.make({ id: 'asdfasfdw' }, rules);

        fail_v.extend('mongoid', isMongoId, ':attr must be a valid mongo id');

        it('can be extended with a custom rule', () => {
            expect(v.findRuleMethod({ name: 'Mongoid' })).to.equal(isMongoId);
        });

        it('runs custom validation rule', () => {
            expect(v.passes(data)).to.be.true;
            expect(fail_v.passes()).to.be.false;
        });

        it('custom validator fails with custom message', () => {
            expect(fail_v.getErrors()).to.deep.equal({
                id: ['id must be a valid mongo id'],
            });
        });

        it('converts snake_case rule names to TitleCase functions', () => {
            const rules = { id: 'mongo_id:min=24,max=24' };
            const validator = Validator.make({ id: '5915b8434479e9b7e11db37c' }, rules);

            validator.extend('mongo_id', isMongoId, ':attr must be a valid mongo id');

            expect(validator.findRuleMethod({ name: 'MongoId' })).to.equal(isMongoId);
        });
    });

    describe('#hasError()', () => {
        it('returns true if there is any error', () => {
            const v = Validator.make(
                { name: 'Test' },
                {
                    name: 'required|min:6',
                }
            );

            v.passes();
            expect(v.hasError()).to.be.true;
        });

        it('returns false if there is no error', () => {
            const v = Validator.make(
                { name: 'Testing' },
                {
                    name: 'required|min:6',
                }
            );

            v.passes();
            expect(v.hasError()).to.be.false;
        });
    });

    describe('#titleCase()', () => {
        it('returns title case using space as default delimiter', () => {
            expect(v.titleCase('hello world')).to.equal('HelloWorld');
        });

        it('returns title case using hyphen as delimiter', () => {
            expect(v.titleCase('hello-world', '-')).to.equal('HelloWorld');
        });

        it('returns title case when given just one word', () => {
            expect(v.titleCase('helloworld')).to.equal('Helloworld');
        });

        it('returns title case when given a capitalized word', () => {
            expect(v.titleCase('HELLOWORLD')).to.equal('Helloworld');
        });

        it('returns title case when given all capitalized words', () => {
            expect(v.titleCase('HELLO WORLD')).to.equal('HelloWorld');
        });
    });

    describe('#snakeCase()', () => {
        it('returns snake case using underscore as default delimiter', () => {
            expect(v.snakeCase('helloWorld')).to.equal('hello_world');
        });

        it('returns snake case using hyphen as delimiter', () => {
            expect(v.snakeCase('helloWorld', '-')).to.equal('hello-world');
        });

        it('returns snake case when given title case word', () => {
            expect(v.snakeCase('HelloWorld')).to.equal('hello_world');
        });

        it('returns lowercase word when given a single word', () => {
            expect(v.snakeCase('Hello')).to.equal('hello');
        });

        it('returns lowercase of characters each separated by a delimiter when given all capitalized word', () => {
            expect(v.snakeCase('HELLO')).to.equal('h_e_l_l_o');
        });
    });

    describe('#getValue()', () => {
        it('returns value when given existing key', () => {
            expect(v.getValue('email')).to.equal('rati@example.com');
        });

        it('returns empty string when given non-existing key', () => {
            expect(v.getValue('wrong-key')).to.equal('');
        });
    });

    describe('#passes() and valid()', () => {
        const rules = {
            name: 'required',
            email: 'required|email',
        };

        it('returns true when all validations are valid', () => {
            const v = Validator.make(
                {
                    name: 'Rati',
                    email: 'rati@example.com',
                },
                rules
            );

            expect(v.passes()).to.be.true;
            expect(v.valid()).to.deep.equal(['name', 'email']);
        });

        it('returns false when any validation rule is invalid', () => {
            const v = Validator.make(
                {
                    name: 'Rati',
                },
                rules
            );

            expect(v.passes()).to.be.false;
            expect(v.valid()).to.deep.equal(['name']);
        });

        it('should not fail if data is defined as an empty object', () => {
            let v = Validator.make({}, { date: 'date' });

            expect(v.fails()).to.be.false;
        });

        it('should fail if data is defined as an empty object and the field is required', () => {
            let v = Validator.make({}, { name: 'required|email', potato: 'max:3' },);

            expect(v.fails()).to.be.true;
        });
    });

    describe('#fails() and invalid()', () => {
        const rules = {
            name: 'required',
            email: 'required|email',
        };

        it('returns true when any validation fails', () => {
            const v = Validator.make(
                {
                    name: 'Rati',
                },
                rules
            );
            expect(v.fails()).to.be.true;
            expect(v.invalid()).to.deep.equal(['email']);
            expect(v.getError('email')).to.have.lengthOf(2);
        });

        it('returns false when all validations pass', () => {
            const v = Validator.make(
                {
                    name: 'Rati',
                    email: 'rati@example.com',
                },
                rules
            );
            expect(v.fails()).to.be.false;
            expect(v.invalid()).to.be.empty;
        });

        it('should not fail if data is defined as an empty object', () => {
            let v = Validator.make({}, { date: 'date' });

            expect(v.fails()).to.be.false;
        });
    });
    describe('#getErrors()', () => {
        const rules = {
            name: 'required',
            email: 'required|email',
            age: 'required',
        };

        it('returns errors when validation fails', () => {
            const v = Validator.make(
                { name: 'Rati', email: 'rati@example.com' },
                rules
            );

            v.fails();
            expect(v.getErrors()).to.have.any.keys('age');

            v.setData({ name: 'Rati' });

            v.fails();
            expect(v.getErrors()).to.have.all.keys(['email', 'age']);
            expect(v.getError('email')).to.have.lengthOf(2);
            expect(v.getError('age')).to.have.lengthOf(1);
        });

        it('returns empty array when all validation pass', () => {
            const v = Validator.make(
                {
                    name: 'Rati',
                    email: 'rati@example.com',
                    age: '45',
                },
                rules
            );

            v.fails();
            expect(v.getErrors()).to.empty;
            expect(v.hasError()).to.be.false;
            expect(v.getError('name')).to.be.null;
        });
    });

    describe('#validateRequired()', () => {
        it('return false when the required field is not present', () => {
            const v = Validator.make({ field: 'data' }, { name: 'required' });
            expect(v.passes()).to.be.false;
        });

        it('return false when the required field is present but empty', () => {
            const v = Validator.make({ name: '' }, { name: 'required' });
            expect(v.passes()).to.be.false;
        });

        it('return true when the required field is present and has value', () => {
            const v = Validator.make({ name: 'foo' }, { name: 'required' });
            expect(v.passes()).to.be.true;
        });
        // SKIP File related test
    });

    describe('#validateRequiredWith()', () => {
        const rules = {
            last: 'required_with:first',
        };

        it('returns false when the validated field is not present', () => {
            const v = Validator.make({ first: 'Taylor' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when the validated field is empty', () => {
            const v = Validator.make({ first: 'Taylor', last: '' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when the validated field is not present, but the required_with field is empty', () => {
            const v = Validator.make({ first: '' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when both validated field and required_with field are not present', () => {
            const v = Validator.make({}, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when the validated field is present and the required_with field can be validated', () => {
            const v = Validator.make(
                { first: 'Taylor', last: 'Otwell' },
                rules
            );
            expect(v.passes()).to.be.true;
        });
        // SKIP File related test
    });

    describe('#validateRequiredWithAll()', () => {
        it('returns true when the field under validation must be present only if all of the other specified fields are present', () => {
            const v = Validator.make(
                { first: 'foo' },
                { last: 'required_with_all:first,foo' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when the field under validation is not present', () => {
            const v = Validator.make(
                { first: 'foo' },
                { last: 'required_with_all:first' }
            );
            expect(v.passes()).to.be.false;
        });
    });

    describe('#getSize()', () => {
        it('returns correct parameter value', () => {
            const v = Validator.make({ name: 'Rati' }, {});
            expect(v.getSize('name', 'Rati')).to.equal(4);
        });

        it('should correctly validate min rules on null data fields', () => {
            const data = { test: null };
            const rules = { test: 'min:1' };

            const v = Validator.make(data, rules);

            expect(v.fails()).to.be.true;
            expect(v.getErrors()).to.deep.equal({
                test: ['The test must be at least 1 characters.'],
            });
        });

        it('should correctly validate min and max rules on null data fields', () => {
            const data = { test: null };
            const rules = { test: 'min:1|max:3' };

            const v = Validator.make(data, rules);

            expect(v.fails()).to.be.true;
            expect(v.getErrors()).to.deep.equal({
                test: ['The test must be at least 1 characters.'],
            });
        });
    });

    describe('#validateMin()', () => {
        const rules = {
            name: 'min:3',
        };

        it('returns true when the length of given string is >= the specified "min"', () => {
            const v = Validator.make({ name: 'Rati' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when the length of given string is < the specified "min"', () => {
            const v = Validator.make({ name: 'Ra' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when the given value is < the numeric min', () => {
            const v = Validator.make({ foo: '2' }, { foo: 'numeric|min:3' });
            expect(v.passes()).to.be.false;
        });

        it('returns true when the given value is >= the numeric min', () => {
            const v = Validator.make({ foo: '5' }, { foo: 'numeric|min:3' });
            expect(v.passes()).to.be.true;
        });

        it('returns true when size of given array is >= the array min', () => {
            const v = Validator.make(
                { foo: [1, 2, 3, 4] },
                { foo: 'array|min:3' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when size of given array is < the array min', () => {
            const v = Validator.make({ foo: [1, 2] }, { foo: 'array|min:3' });
            expect(v.passes()).to.be.false;
        });
        // SKIP file related tests
    });

    describe('#validateMax()', () => {
        const rules = {
            name: 'max:3',
        };

        it('returns true when length of the given string is <= the specified max', () => {
            const v = Validator.make({ name: 'Rat' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when length of the given string is > the specified max', () => {
            const v = Validator.make({ name: 'Rati' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when the given value is > the specified numeric max', () => {
            const v = Validator.make(
                { foo: '211' },
                { foo: 'numeric|max:100' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when the given value is <= the specified numeric max', () => {
            const v = Validator.make({ foo: '22' }, { foo: 'numeric|max:33' });
            expect(v.passes()).to.be.true;
        });

        it('returns true when size of given array is <= the specified array max size', () => {
            const v = Validator.make(
                { foo: [1, 2, 3] },
                { foo: 'array|max:4' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when size of given array is > the specified array max size', () => {
            const v = Validator.make(
                { foo: [1, 2, 3] },
                { foo: 'array|max:2' }
            );
            expect(v.passes()).to.be.false;
        });
        // SKIP file related tests
    });

    describe('#validateIn()', () => {
        it('returns false when given value is not in the list', () => {
            const v = Validator.make({ name: 0 }, { name: 'in:bar,baz' });
            expect(v.passes()).to.be.false;
        });

        it('returns true when given value is in the last', () => {
            const v = Validator.make({ name: 'foo' }, { name: 'in:foo,baz' });
            expect(v.passes()).to.be.true;
        });

        it('returns false when any value in the given array is not in the list', () => {
            const v = Validator.make(
                { name: ['foo', 'bar'] },
                { name: 'array|in:foo,baz' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when all value in given array are in the list', () => {
            const v = Validator.make(
                { name: ['foo', 'qux'] },
                { name: 'array|in:foo,baz,qux' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when the field under validation is not an array', () => {
            const v = Validator.make(
                { name: ['foo', 'bar'] },
                { name: 'alpha|in:foo,bar' }
            );
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateNotIn()', () => {
        it('return true when given value is not in the list', () => {
            const v = Validator.make(
                { name: 'foo' },
                { name: 'not_in:bar,baz' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when given value is in the list', () => {
            const v = Validator.make(
                { name: 'foo' },
                { name: 'not_in:foo,baz' }
            );
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateNumeric()', () => {
        const rules = {
            foo: 'numeric',
        };

        it('return false when given string is not numeric', () => {
            const v = Validator.make({ foo: 'asdad' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when given string is floating point value', () => {
            const v = Validator.make({ foo: '1.23' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when given string is "-1"', () => {
            const v = Validator.make({ foo: '-1' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when given string is "1"', () => {
            const v = Validator.make({ foo: '1' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateInteger()', () => {
        const rules = {
            foo: 'integer',
        };

        it('returns false when given string is text value', () => {
            const v = Validator.make({ foo: 'asdad' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given string is decimal point value', () => {
            const v = Validator.make({ foo: '1.23' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when given string is "-1"', () => {
            const v = Validator.make({ foo: '-1' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when given string is "1"', () => {
            const v = Validator.make({ foo: '1' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateEmail()', () => {
        const rules = {
            email: 'email',
        };

        it('returns true when given value looks like an email address', () => {
            const v = Validator.make({ email: 'rati@example.com' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when given value does not look like an email address', () => {
            const v = Validator.make({ email: 'example.com' }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validatePresent()', () => {
        const rules = {
            name: 'present',
        };

        it('returns true when the given data is present', () => {
            const v = Validator.make({ name: '' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when the given data is not present', () => {
            const v = Validator.make({ email: 'rati@example.com' }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateRegex()', () => {
        it('returns true when the given data passes regex validation', () => {
            const v = Validator.make(
                { x: 'asdasdf' },
                { x: 'regex:/^([a-z])+$/i' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when the given data fails regex validation', () => {
            const v = Validator.make(
                { x: 'aasd234fsd1' },
                { x: 'regex:/^([a-z])+$/i' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when given data has comma delimited value', () => {
            const v = Validator.make({ x: 'a,b' }, { x: 'regex:/^a,b$/i' });
            expect(v.passes()).to.be.true;
        });

        it('returns true when given data is a string value of "12"', () => {
            const v = Validator.make({ x: '12' }, { x: 'regex:/^12$/i' });
            expect(v.passes()).to.be.true;
        });

        it('returns true when given data is numeric 123', () => {
            const v = Validator.make({ x: 123 }, { x: 'regex:/^123$/i' });
            expect(v.passes()).to.be.true;
        });

        it('should validate regex expressions with commas', () => {
            const v = Validator.make({
                number: '3123'
            }, {
                number: [`regex:/[0-9]{1,8}/`],
            });

            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateSame()', () => {
        it('returns false when the specified field has different value', () => {
            const v = Validator.make(
                {
                    foo: 'bar',
                    baz: 'boom',
                },
                { foo: 'same:baz' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns false when the specified field does not present', () => {
            const v = Validator.make(
                {
                    foo: 'bar',
                },
                { foo: 'same:baz' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when the specified field is present and has the same value', () => {
            const v = Validator.make(
                {
                    foo: 'bar',
                    baz: 'bar',
                },
                { foo: 'same:baz' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when the specified field has different numeric value', () => {
            const v = Validator.make(
                {
                    foo: '1e2',
                    baz: '100',
                },
                { foo: 'same:baz' }
            );
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateDifferent()', () => {
        const rules = { foo: 'different:baz' };

        it('returns true when the specified field has different value', () => {
            const v = Validator.make(
                {
                    foo: 'bar',
                    baz: 'boom',
                },
                rules
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when the specified field does not present', () => {
            const v = Validator.make(
                {
                    foo: 'bar',
                },
                rules
            );
            expect(v.passes()).to.be.false;
        });

        it('returns false when the specified field is present and has the same value', () => {
            const v = Validator.make(
                {
                    foo: 'bar',
                    baz: 'bar',
                },
                rules
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when the specified field has different numeric value', () => {
            const v = Validator.make(
                {
                    foo: '1e2',
                    baz: '100',
                },
                rules
            );
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateConfirm()', () => {
        const rules = { password: 'confirmed' };

        it('returns false when confirmation field is not present', () => {
            const v = Validator.make({ password: 'foo' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when confirmation field value does not match', () => {
            const v = Validator.make(
                {
                    password: 'foo',
                    password_confirmation: 'bar',
                },
                rules
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when confirmation field value does match', () => {
            const v = Validator.make(
                {
                    password: 'foo',
                    password_confirmation: 'foo',
                },
                rules
            );
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateAccepted()', () => {
        const rules = { foo: 'accepted' };
        it('returns false when given value is "no"', () => {
            const v = Validator.make({ foo: 'no' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given value is null', () => {
            const v = Validator.make({ foo: null }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when the field is not present', () => {
            const v = Validator.make({ field: {} }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given value is 0', () => {
            const v = Validator.make({ foo: 0 }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given value is false', () => {
            const v = Validator.make({ foo: false }, rules);
            expect(v.passes()).to.be.false;
        });
        it('returns false when given value is string "false"', () => {
            const v = Validator.make({ foo: 'false' }, rules);
            expect(v.passes()).to.be.false;
        });
        it('returns true when given value is string "yes"', () => {
            const v = Validator.make({ foo: 'yes' }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns true when given value is string "on"', () => {
            const v = Validator.make({ foo: 'on' }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns true when given value is string "1"', () => {
            const v = Validator.make({ foo: '1' }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns true when given value is numeric 1', () => {
            const v = Validator.make({ foo: 1 }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns true when given value is true', () => {
            const v = Validator.make({ foo: true }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns true when given value is string "true"', () => {
            const v = Validator.make({ foo: 'true' }, rules);
            expect(v.passes()).to.be.true;
        });
    });
    describe('#validateDigits()', () => {
        it('returns true when the number of digits given matched', () => {
            const v = Validator.make({ foo: '12345' }, { foo: 'digits:5' });
            expect(v.passes()).to.be.true;
        });
        it('returns false when the number of digits given does not match', () => {
            const v = Validator.make({ foo: '123' }, { foo: 'digits:200' });
            expect(v.passes()).to.be.false;
        });
    });
    describe('$validateDigitsBetween()', () => {
        it('returns true when the number of digits given is between the range', () => {
            const v = Validator.make(
                { foo: '12345' },
                { foo: 'digits_between:1,6' }
            );
            expect(v.passes()).to.be.true;
        });
        it('returns false when the given value is not numeric', () => {
            const v = Validator.make(
                { foo: 'bar' },
                { foo: 'digits_between:1,10' }
            );
            expect(v.passes()).to.be.false;
        });
        it('returns false when the number of digits given is not in the range', () => {
            const v = Validator.make(
                { foo: '123' },
                { foo: 'digits_between:4,5' }
            );
            expect(v.passes()).to.be.false;
        });
    });
    describe('#validateSize()', () => {
        it('returns false when string length is more than the given size', () => {
            const v = Validator.make({ foo: 'asdad' }, { foo: 'size:3' });
            expect(v.passes()).to.be.false;
        });
        it('returns true when string length is equal to the given size', () => {
            const v = Validator.make({ foo: 'asd' }, { foo: 'size:3' });
            expect(v.passes()).to.be.true;
        });
        it('returns false when numeric value is not equal to the given size', () => {
            const v = Validator.make({ foo: '123' }, { foo: 'numeric|size:3' });
            expect(v.passes()).to.be.false;
        });
        it('returns true when numeric value is equal to the given size', () => {
            const v = Validator.make({ foo: '3' }, { foo: 'numeric|size:3' });
            expect(v.passes()).to.be.true;
        });
        it('returns true when given value is array of the given size', () => {
            const v = Validator.make(
                { foo: [1, 2, 3] },
                { foo: 'array|size:3' }
            );
            expect(v.passes()).to.be.true;
        });
        it('returns false when given value is array of different size', () => {
            const v = Validator.make(
                { foo: [1, 2, 3] },
                { foo: 'array|size:4' }
            );
            expect(v.passes()).to.be.false;
        });
        // SKIP file related tests
    });
    describe('#validateBetween()', () => {
        it('returns false when given string length is not in the range', () => {
            const v = Validator.make({ foo: 'asdad' }, { foo: 'between:3,4' });
            expect(v.passes()).to.be.false;
        });

        it('returns true when given string length is in the range', () => {
            const v = Validator.make({ foo: 'asd' }, { foo: 'between:3,5' });
            expect(v.passes()).to.be.true;

            v.setData({ foo: 'asda' }, { foo: 'between:3,5' });
            expect(v.passes()).to.be.true;

            v.setData({ foo: 'asdad' }, { foo: 'between:3,5' });
            expect(v.passes()).to.be.true;
        });
        it('returns false when the given numeric value is not in the specified range', () => {
            const v = Validator.make(
                { foo: '123' },
                { foo: 'numeric|between:50,100' }
            );
            expect(v.passes()).to.be.false;
        });
        it('returns true when the given numeric value is in the specified range', () => {
            const v = Validator.make(
                { foo: '3' },
                { foo: 'numeric|between:1,5' }
            );
            expect(v.passes()).to.be.true;
        });
        it('returns true when the given array size is in the specified range', () => {
            const v = Validator.make(
                { foo: [1, 2, 3] },
                { foo: 'array|between:1,5' }
            );
            expect(v.passes()).to.be.true;
        });
        it('returns false when the given array size is not in the specified range', () => {
            const v = Validator.make(
                { foo: [1, 2, 3] },
                { foo: 'array|between:1,2' }
            );
            expect(v.passes()).to.be.false;
        });
        // SKIP file related tests
    });
    describe('#validateIp()', () => {
        const rules = { ip: 'ip' };
        it('returns false when given string that does not look like IP address', () => {
            const v = Validator.make({ ip: 'asdfsdfsd' }, rules);
            expect(v.passes()).to.be.false;
        });
        it('returns true when given string that looks loke IP address', () => {
            const v = Validator.make({ ip: '127.0.0.1' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateUrl()', () => {
        const rules = { url: 'url' };

        it('returns false when given string that does not look like URL', () => {
            const v = Validator.make({ url: 'skd:kssk.slsls.sl' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when given string that looks like URL', () => {
            const v = Validator.make({ url: 'http://kssk.slsls.sl' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ url: 'http://kssk.slsls.sl/' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ url: 'http://kssk.slsls.sl/sksk' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ url: 'https://kssk.slsls.sl/sksk' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateAlpha()', () => {
        const rules = { x: 'alpha' };
        it('returns false when given string contains line break and number character', () => {
            const v = Validator.make({ x: 'asdfsd2fkl' }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: 'asdfsdfk\nsd' }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: 'asdfsdfk\tsd' }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: 'http://google.com' }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: '123' }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: 123 }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when given string contains only alphabet character', () => {
            const v = Validator.make({ x: 'asdfsdfkl' }, rules);
            expect(v.passes()).to.be.true;
        });
    });
    describe('#validateAlphaNum()', () => {
        const rules = { x: 'alpha_num' };

        it('returns true when given string contains alphabet and numeric characters', () => {
            const v = Validator.make({ x: 'asdfs234dfk' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when given string contains other non-alpha_num', () => {
            const v = Validator.make({ x: 'http://222.google.com' }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateAlphaDash()', () => {
        const rules = { x: 'alpha_dash' };
        it('returns true when given string contains alphabet, hyphen, and underscore char', () => {
            const v = Validator.make({ x: 'aslsl-_3dlks' }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns false when given string contains characters other than alpha_dash', () => {
            const v = Validator.make({ x: 'http://-g232oogle.com' }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateDate()', () => {
        const rules = { x: 'date' };
        it('returns true when given string can be converted to a Date', () => {
            const v = Validator.make({ x: '2000-01-01' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ x: '01/01/2000' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ x: new Date() }, rules);
            expect(v.passes()).to.be.true;
        });

        it('return false when given string cannot be converted to a Date', () => {
            const v = Validator.make({ x: '1325376000' }, rules);
            expect(v.fails()).to.be.true;

            v.setData({ x: 'Not a date' }, rules);
            expect(v.fails()).to.be.true;

            v.setData({ x: ['Not', 'a', 'date'] }, rules);
            expect(v.fails()).to.be.true;
        });
    });

    describe('#validateBefore()', () => {
        it('returns true when given date is before the specified one', () => {
            const v = Validator.make(
                { x: '2000-01-01' },
                { x: 'before:2012-01-01' }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { x: new Date('2000-01-01') },
                { x: 'before:2012-01-01' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when given date is not a string or number', () => {
            const v = Validator.make(
                { x: ['2000-01-01'] },
                { x: 'before:2012-01-01' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when given date refer to another existing field', () => {
            const v = Validator.make(
                { start: '2012-01-01', ends: '2013-01-01' },
                {
                    start: 'before:ends',
                    ends: 'after:start',
                }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: '2000-01-01' },
                {
                    start: 'before:ends',
                    ends: 'after:start',
                }
            );
            expect(v.fails()).to.be.true;
        });
    });

    describe('#validateBeforeOrEqual()', () => {
        it('returns true when given date is before or equal the specified one', () => {
            const v = Validator.make(
                { x: '2000-01-01' },
                { x: 'before_or_equal:2012-01-01' }
            );
            expect(v.passes()).to.be.true;

            v.setData({ x: '2012-01-01' }, { x: 'before_or_equal:2012-01-01' });
            expect(v.passes()).to.be.true;

            v.setData(
                { x: new Date('2000-01-01') },
                { x: 'before_or_equal:2012-01-01' }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { x: new Date('2012-01-01') },
                { x: 'before_or_equal:2012-01-01' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when given date is not a string or number', () => {
            const v = Validator.make(
                { x: ['2000-01-01'] },
                { x: 'before_or_equal:2012-01-01' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when given date refer to another existing field', () => {
            const v = Validator.make(
                { start: '2012-01-01', ends: '2013-01-01' },
                {
                    start: 'before_or_equal:ends',
                    ends: 'after:start',
                }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: '2013-01-01' },
                {
                    start: 'before_or_equal:ends',
                    ends: 'after_or_equal:start',
                }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: '2000-01-01' },
                {
                    start: 'before_or_equal:ends',
                    ends: 'after:start',
                }
            );
            expect(v.fails()).to.be.true;
        });
    });

    describe('#validateAfter()', () => {
        it('returns true when given date is after the specified one', () => {
            const v = Validator.make(
                { x: '2012-01-01' },
                { x: 'after:2000-01-01' }
            );
            expect(v.passes()).to.be.true;
        });

        it('returns false when given date is not a string or number', () => {
            const v = Validator.make(
                { x: ['2012-01-01'] },
                { x: 'after:2000-01-01' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when given date refer to another existing field', () => {
            const v = Validator.make(
                { start: '2012-01-01', ends: '2013-01-01' },
                {
                    start: 'after:2000-01-01',
                    ends: 'after:start',
                }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: '2000-01-01' },
                {
                    start: 'after:2000-01-01',
                    ends: 'after:start',
                }
            );
            expect(v.fails()).to.be.true;

            v.setData(
                { start: new Date('2012-01-01'), ends: '2000-01-01' },
                {
                    start: 'before:ends',
                    ends: 'after:start',
                }
            );
            expect(v.fails()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: new Date('2000-01-01') },
                {
                    start: 'before:ends',
                    ends: 'after:start',
                }
            );
            expect(v.fails()).to.be.true;
        });
    });

    describe('#validateAfterOrEqual()', () => {
        it('returns true when given date is after or equal the specified one', () => {
            const v = Validator.make(
                { x: '2012-01-01' },
                { x: 'after_or_equal:2000-01-01' }
            );
            expect(v.passes()).to.be.true;

            v.setData({ x: '2000-01-01' }, { x: 'after_or_equal:2000-01-01' });
            expect(v.passes()).to.be.true;
        });

        it('returns false when given date is not a string or number', () => {
            const v = Validator.make(
                { x: ['2012-01-01'] },
                { x: 'after_or_equal:2000-01-01' }
            );
            expect(v.passes()).to.be.false;
        });

        it('returns true when given date refer to another existing field', () => {
            const v = Validator.make(
                { start: '2012-01-01', ends: '2013-01-01' },
                {
                    start: 'after_or_equal:2000-01-01',
                    ends: 'after_or_equal:start',
                }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: '2000-01-01' },
                {
                    start: 'after_or_equal:2000-01-01',
                    ends: 'after_or_equal:start',
                }
            );
            expect(v.fails()).to.be.true;

            v.setData(
                { start: new Date('2012-01-01'), ends: '2000-01-01' },
                {
                    start: 'before:ends',
                    ends: 'after_or_equal:start',
                }
            );
            expect(v.fails()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: new Date('2000-01-01') },
                {
                    start: 'before:ends',
                    ends: 'after_or_equal:start',
                }
            );
            expect(v.fails()).to.be.true;

            v.setData(
                { start: '2012-01-01', ends: '2012-01-01' },
                {
                    start: 'before_or_equal:ends',
                    ends: 'after_or_equal:start',
                }
            );
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateArray()', () => {
        const rules = { foo: 'array' };
        it('returns true when given data is an array', () => {
            const v = Validator.make({ foo: [1, 2, 3] }, rules);
            expect(v.passes()).to.be.true;
        });
        it('returns false when given data is not an array', () => {
            const v = Validator.make({ foo: 'xyz' }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateFilled()', () => {
        const rules = { name: 'filled' };
        it('returns true when the field is not present', () => {
            const v = Validator.make({}, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when the field is present but empty', () => {
            const v = Validator.make({ name: '' }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#validateBoolean()', () => {
        const rules = { foo: 'boolean' };
        it('returns false when given string "no"', () => {
            const v = Validator.make({ foo: 'no' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given string "yes"', () => {
            const v = Validator.make({ foo: 'yes' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given string "false"', () => {
            const v = Validator.make({ foo: 'false' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when given string "true"', () => {
            const v = Validator.make({ foo: 'true' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when passing empty data', () => {
            const v = Validator.make({}, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when given boolean value true or false', () => {
            const v = Validator.make({ foo: true }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ foo: false }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when given value 1 or "1"', () => {
            const v = Validator.make({ foo: 1 }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ foo: '1' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when given value 0 or "0"', () => {
            const v = Validator.make({ foo: 0 }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ foo: '0' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateJson()', () => {
        const rules = { foo: 'json' };
        it('returns false when given string is not parsable to JSON', () => {
            const v = Validator.make({ foo: 'aksdkd' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when given string is parsable to JSON', () => {
            const v = Validator.make({ foo: '[]' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ foo: '{"name":"John","age":"34"}' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateRequiredWithout()', () => {
        const rules = { last: 'required_without:first' };
        it('returns true when the field under validation is not present if the other specified field is present', () => {
            const v = Validator.make({ first: 'Taylor' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when the field under validation is empty while the other specified field is present', () => {
            const v = Validator.make({ first: 'Taylor', last: '' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when the field under validation is not present when the other specified field is empty', () => {
            const v = Validator.make({ first: '' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns false when the data is empty (the field under validation is not present)', () => {
            const v = Validator.make({ field: 'data' }, rules);
            expect(v.passes()).to.be.false;
        });

        it('returns true when the field under validation is present, but the other specified field is not required', () => {
            const v = Validator.make(
                { first: 'Taylor', last: 'Otwell' },
                rules
            );
            expect(v.passes()).to.be.true;
        });
        // SKIP File related test
        it('tests required_without multiple', () => {
            const rules = {
                f1: 'required_without:f2,f3',
                f2: 'required_without:f1,f3',
                f3: 'required_without:f1,f2',
            };
            const v = Validator.make({ field: 'data' }, rules);
            expect(v.fails()).to.be.true;

            v.setData({ f1: 'foo' }, rules);
            expect(v.fails()).to.be.true;

            v.setData({ f2: 'foo' }, rules);
            expect(v.fails()).to.be.true;

            v.setData({ f3: 'foo' }, rules);
            expect(v.fails()).to.be.true;

            v.setData({ f1: 'foo', f2: 'bar' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f1: 'foo', f3: 'bar' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f2: 'foo', f3: 'bar' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f1: 'foo', f2: 'bar', f3: 'baz' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateRequiredWithoutAll()', () => {
        const rules = {
            f1: 'required_without_all:f2,f3',
            f2: 'required_without_all:f1,f3',
            f3: 'required_without_all:f1,f2',
        };

        it('returns false when given data is empty', () => {
            const v = Validator.make({ field: 'data' }, rules);
            expect(v.fails()).to.be.true;
        });

        it('returns true when the other specified fields are not present', () => {
            const v = Validator.make({ f1: 'foo' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f2: 'foo' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f3: 'foo' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns true when the other specified fields are not required', () => {
            const v = Validator.make({ f1: 'foo', f2: 'bar' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f1: 'foo', f3: 'bar' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f2: 'foo', f3: 'bar' }, rules);
            expect(v.passes()).to.be.true;

            v.setData({ f1: 'foo', f2: 'bar', f3: 'baz' }, rules);
            expect(v.passes()).to.be.true;
        });
    });

    describe('#validateRequiredIf()', () => {
        it('returns false when the field under validation is not present', () => {
            const v = Validator.make(
                { first: 'taylor' },
                { last: 'required_if:first,taylor' }
            );
            expect(v.fails()).to.be.true;
        });

        it('returns true when the field under validation must be present if the anotherfield field is equal to any value', () => {
            let v = Validator.make(
                { first: 'taylor', last: 'otwell' },
                { last: 'required_if:first,taylor' }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { first: 'taylor', last: 'otwell' },
                { last: 'required_if:first,taylor,dayle' }
            );
            expect(v.passes()).to.be.true;

            v.setData(
                { first: 'dayle', last: 'rees' },
                { last: 'required_if:first,taylor,dayle' }
            );
            expect(v.passes()).to.be.true;

            v.setData({ foo: true }, { bar: 'required_if:foo,false' });
            expect(v.passes()).to.be.true;

            v = Validator.make({ foo: true }, { bar: 'required_if:foo,true' });
            expect(v.fails()).to.be.true;
        });
        // SKIP test for error message when passed multiple values
    });

    describe('#validateRequiredUnless()', () => {
        it('checks the field under validation must be present unless the another field field is equal to any value', () => {
            let v = Validator.make(
                { first: 'sven' },
                { last: 'required_unless:first,taylor' }
            );
            expect(v.fails()).to.be.true;

            v = Validator.make(
                { first: 'taylor' },
                { last: 'required_unless:first,taylor' }
            );
            expect(v.passes()).to.be.true;

            v = Validator.make(
                { first: 'sven', last: 'wittevrongel' },
                { last: 'required_unless:first,taylor' }
            );
            expect(v.passes()).to.be.true;

            v = Validator.make(
                { first: 'taylor' },
                { last: 'required_unless:first,taylor,sven' }
            );
            expect(v.passes()).to.be.true;

            v = Validator.make(
                { first: 'sven' },
                { last: 'required_unless:first,taylor,sven' }
            );
            expect(v.passes()).to.be.true;
        });
        // SKIP test error message when passed multiple values
    });

    describe('#validateString()', () => {
        const rules = { x: 'string' };
        it('returns true when given value is a string', () => {
            const v = Validator.make({ x: 'aslsdlks' }, rules);
            expect(v.passes()).to.be.true;
        });

        it('returns false when given value is not of type string', () => {
            const v = Validator.make({ x: ['aa', 'bb'] }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: { aa: '123' } }, rules);
            expect(v.passes()).to.be.false;

            v.setData({ x: true }, rules);
            expect(v.passes()).to.be.false;
        });
    });

    describe('#Error Messages', () => {
        const rules = {
            name: 'required|min:3',
            age: 'numeric|min:20',
            email: 'required|email',
        };

        it('checks that errors are returned correctly when validation failed', () => {
            const v = Validator.make(
                { age: 15, email: 'rati@example.com' },
                rules
            );
            v.passes();
            expect(v.valid()).to.deep.equal(['email']);
            expect(v.invalid()).to.deep.equal(['name', 'age']);
            expect(v.getErrors()).to.deep.equal({
                name: [
                    'The name field is required.',
                    'The name must be at least 3 characters.',
                ],
                age: ['The age must be at least 20.'],
            });
        });

        it('checks proper messages are returned for sizes rule', () => {
            let v = Validator.make({ name: '3' }, { name: 'numeric|min:5' });

            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal({
                name: ['The name must be at least 5.'],
            });

            v = Validator.make({ name: 'asdfkjlsd' }, { name: 'size:2' });

            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal({
                name: ['The name must be 2 characters.'],
            });
        });
    });

    describe('#Others', () => {
        it('tests that empty rules are skipped', () => {
            const v = Validator.make({ x: 'asksksks' }, { x: '|||required|' });
            expect(v.passes()).to.be.true;
        });
    });

    describe('#Custom Names', () => {
        const customNames = {
            name: 'Name',
            age: 'Age',
        };

        const rules = {
            name: 'required',
            age: 'required',
        };

        const expectedResult = {
            name: ['The Name field is required.'],
            age: ['The Age field is required.'],
        };

        it('tests custom name being applied using constructor', () => {
            const v = Validator.make({ field: 'name' }, rules, {}, customNames);
            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal(expectedResult);
        });

        it('tests custom name being applied using addCustomNames()', () => {
            const v = Validator.make({ name: '' }, rules);
            v.addCustomNames(customNames);
            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal(expectedResult);
        });

        it('tests custom name being applied using setCustomNames()', () => {
            const v = Validator.make({ name: '' }, rules);
            v.setCustomNames(customNames);
            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal(expectedResult);
        });
    });

    describe('#Custom Messages', () => {
        const rules = {
            name: 'required',
            age: 'required',
            email: 'required',
        };

        it('tests custom message for specific rules being applied correctly', () => {
            const customMessages = {
                required: 'You must provide the :attr.',
            };

            const expectedResult = {
                name: ['You must provide the name.'],
                age: ['You must provide the age.'],
                email: ['You must provide the email.'],
            };

            const v = Validator.make({ name: '' }, rules, customMessages);

            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal(expectedResult);
        });

        it('tests custom message for specific rules being applied correctly', () => {
            const customMessages = {
                'name.required': ':attr is required.',
                'age.required': ':Attr field is required.',
                'email.required': ':ATTR field must not be blank.',
            };

            const expectedResult = {
                name: ['name is required.'],
                age: ['Age field is required.'],
                email: ['EMAIL field must not be blank.'],
            };

            const v = Validator.make({ name: '' }, rules, customMessages);

            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal(expectedResult);
        });
    });

    describe('#Displayable values are replaced', () => {
        it('tests required_if:foo,bar', () => {
            const v = Validator.make(
                { color: '1', bar: '' },
                { bar: 'required_if:color,1' }
            );
            v.addCustomValues({ color: { 1: 'Red' } });
            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal({
                bar: ['The bar field is required when color is Red.'],
            });
        });
        it('tests in:foo,bar using addCustomValues()', () => {
            const v = Validator.make(
                { type: '4' },
                { type: 'in:5,300' },
                { 'type.in': ':attr must be included in :values.' }
            );
            v.addCustomValues({
                type: {
                    5: 'Short',
                    300: 'Long',
                },
            });
            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal({
                type: ['type must be included in Short, Long.'],
            });
        });
        it('tests in:foo,bar using setValueNames()', () => {
            const v = Validator.make(
                { type: '4' },
                { type: 'in:5,300' },
                { 'type.in': ':attr must be included in :values.' }
            );
            v.setValueNames({
                type: {
                    5: 'Short',
                    300: 'Long',
                },
            });
            expect(v.passes()).to.be.false;
            expect(v.getErrors()).to.deep.equal({
                type: ['type must be included in Short, Long.'],
            });
        });
    });

    describe('#validateNullable', () => {
        it('should passed a empty date with "nullable" rule', () => {
            const v = Validator.make(
                {
                    name: 'adrian',
                },
                {
                    name: 'required|string',
                    lastName: 'nullable|string',
                }
            );
            expect(v.passes()).to.be.true;
        });

        it('should passed a date with "nullable" rule', () => {
            const v = Validator.make(
                {
                    name: 'adrian',
                    lastName: 'locurcio',
                },
                {
                    name: 'required|string',
                    lastName: 'nullable|string',
                }
            );
            expect(v.passes()).to.be.true;
        });
    });

    describe('#setData', () => {
        it('should passed a lazy set date', () => {
            const data = {
                name: 'adrian',
                lastName: 'locurcio',
            };

            const v = Validator.make(null, {
                name: 'required|string',
                lastName: 'nullable|string',
            });
            v.setData(data);

            expect(v.passes()).to.be.true;
        });
    });

    describe('#message', () => {
        it('should correctly return a correctly formatted message when a variable name consists of more than two words', () => {
            const data = { threeWordProperty: '' };
            const rules = { threeWordProperty: 'required|min:1' };

            const v = Validator.make(data, rules);

            expect(v.fails()).to.be.true;
            expect(v.getErrors()).to.deep.equal({
                threeWordProperty: [
                    'The three word property field is required.',
                    'The three word property must be at least 1 characters.',
                ],
            });
        });
    });
});

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
alpha -- other dialects
alpha_num -- other dialects
alpha_dash -- other dialects
date_format
after -- not work with string like 'today', 'tomorrow', etc.
before -- same as above

 */
