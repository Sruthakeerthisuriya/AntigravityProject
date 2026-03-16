const { add, subtract, multiply, divide, exponentiate } = require('./index');

describe('Math Operations Comprehensive Unit Tests', () => {
    describe('add', () => {
        test('adds two positive integers', () => {
            expect(add(2, 3)).toBe(5);
        });

        test('adds positive and negative numbers', () => {
            expect(add(5, -2)).toBe(3);
            expect(add(-5, 2)).toBe(-3);
        });

        test('adds two negative numbers', () => {
            expect(add(-5, -5)).toBe(-10);
        });

        test('adds with zero', () => {
            expect(add(10, 0)).toBe(10);
            expect(add(0, 10)).toBe(10);
            expect(add(0, 0)).toBe(0);
        });

        test('handles floating point numbers with precision', () => {
            expect(add(0.1, 0.2)).toBeCloseTo(0.3);
            expect(add(0.1000000000000001, 0.1)).toBeCloseTo(0.2000000000000001);
        });

        test('handles very large numbers', () => {
            expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
            expect(add(Number.MAX_VALUE, Number.MAX_VALUE)).toBe(Infinity);
        });

        test('handles very small numbers', () => {
            expect(add(Number.MIN_VALUE, Number.MIN_VALUE)).toBe(1e-323);
        });

        test('returns NaN when inputs are invalid types', () => {
            expect(add('foo', 5)).toBeNaN();
            expect(add(5, 'bar')).toBeNaN();
            expect(add({}, 5)).toBeNaN();
            expect(add([], 5)).toBeNaN();
            expect(add(undefined, 5)).toBeNaN();
            expect(add(null, 5)).toBeNaN();
        });

        test('handles Infinity', () => {
            expect(add(Infinity, 1)).toBe(Infinity);
            expect(add(Infinity, Infinity)).toBe(Infinity);
            expect(add(Infinity, -Infinity)).toBeNaN();
            expect(add(-Infinity, -Infinity)).toBe(-Infinity);
        });

        test('handles NaN as input', () => {
            expect(add(NaN, 5)).toBeNaN();
            expect(add(5, NaN)).toBeNaN();
        });
    });

    describe('subtract', () => {
        test('subtracts a smaller number from a larger number', () => {
            expect(subtract(10, 5)).toBe(5);
        });

        test('subtracts a larger number from a smaller number', () => {
            expect(subtract(5, 10)).toBe(-5);
        });

        test('subtracts two negative numbers', () => {
            expect(subtract(-5, -2)).toBe(-3);
            expect(subtract(-2, -5)).toBe(3);
        });

        test('subtracts zero', () => {
            expect(subtract(5, 0)).toBe(5);
            expect(subtract(0, 5)).toBe(-5);
        });

        test('result is zero when subtracting same numbers', () => {
            expect(subtract(10, 10)).toBe(0);
            expect(subtract(-1.5, -1.5)).toBe(0);
        });

        test('handles floating point subtraction', () => {
            expect(subtract(0.3, 0.1)).toBeCloseTo(0.2);
        });

        test('returns NaN for non-numeric inputs', () => {
            expect(subtract('10', 'a')).toBeNaN();
            expect(subtract(undefined, 1)).toBeNaN();
            expect(subtract(10, { value: 5 })).toBeNaN();
            expect(subtract(null, 1)).toBeNaN();
        });

        test('handles Infinity and NaN', () => {
            expect(subtract(Infinity, 5)).toBe(Infinity);
            expect(subtract(5, Infinity)).toBe(-Infinity);
            expect(subtract(Infinity, Infinity)).toBeNaN();
            expect(subtract(Infinity, -Infinity)).toBe(Infinity);
            expect(subtract(NaN, 5)).toBeNaN();
        });
    });

    describe('multiply', () => {
        test('multiplies two positive numbers', () => {
            expect(multiply(4, 5)).toBe(20);
        });

        test('multiplies by zero returns zero', () => {
            expect(multiply(100, 0)).toBe(0);
            expect(multiply(0, -5)).toBe(0);
            expect(multiply(0, 0)).toBe(0);
        });

        test('multiplies by a negative number', () => {
            expect(multiply(5, -2)).toBe(-10);
            expect(multiply(-5, 2)).toBe(-10);
        });

        test('multiplies two negative numbers', () => {
            expect(multiply(-3, -3)).toBe(9);
        });

        test('handles decimals and precision', () => {
            expect(multiply(0.5, 2)).toBe(1);
            expect(multiply(0.1, 0.1)).toBeCloseTo(0.01);
            expect(multiply(Math.PI, 1)).toBe(Math.PI);
        });

        test('multiplies by Infinity', () => {
            expect(multiply(5, Infinity)).toBe(Infinity);
            expect(multiply(-5, Infinity)).toBe(-Infinity);
            expect(multiply(0, Infinity)).toBeNaN();
            expect(multiply(Infinity, Infinity)).toBe(Infinity);
            expect(multiply(-Infinity, Infinity)).toBe(-Infinity);
        });

        test('returns NaN for invalid inputs', () => {
            expect(multiply('text', 2)).toBeNaN();
            expect(multiply(null, 2)).toBeNaN();
            expect(multiply(undefined, undefined)).toBeNaN();
            expect(multiply([], 2)).toBeNaN();
        });

        test('handles -0', () => {
            const result = multiply(-5, 0);
            expect(result).toBe(0);
            expect(Object.is(result, -0)).toBe(true);
        });
    });

    describe('divide', () => {
        test('divides two positive numbers', () => {
            expect(divide(10, 2)).toBe(5);
        });

        test('divides resulting in a fraction', () => {
            expect(divide(5, 2)).toBe(2.5);
        });

        test('divides a negative number', () => {
            expect(divide(-10, 2)).toBe(-5);
            expect(divide(10, -2)).toBe(-5);
            expect(divide(-10, -2)).toBe(5);
        });

        test('throws error when dividing by zero', () => {
            expect(() => divide(10, 0)).toThrow("Division by zero");
            expect(() => divide(0, 0)).toThrow("Division by zero");
            expect(() => divide(-5, 0)).toThrow("Division by zero");
        });

        test('divides zero by a number returns zero', () => {
            expect(divide(0, 5)).toBe(0);
            expect(divide(0, -5)).toBe(0);
        });

        test('handles repeating decimals', () => {
            expect(divide(1, 3)).toBeCloseTo(0.33333333);
        });

        test('divides by a very small decimal', () => {
            expect(divide(1, 0.00001)).toBe(100000);
        });

        test('returns NaN for non-numeric inputs', () => {
            expect(divide('10', '2a')).toBeNaN();
            expect(divide(10, null)).toBeNaN();
            expect(divide(undefined, 2)).toBeNaN();
        });

        test('handles Infinity', () => {
            expect(divide(Infinity, 2)).toBe(Infinity);
            expect(divide(2, Infinity)).toBe(0);
            expect(divide(Infinity, Infinity)).toBeNaN();
            expect(divide(-Infinity, 2)).toBe(-Infinity);
        });
    });

    describe('exponentiate', () => {
        test('raises a number to a positive power', () => {
            expect(exponentiate(2, 3)).toBe(8);
            expect(exponentiate(10, 2)).toBe(100);
        });

        test('raises a number to the power of zero', () => {
            expect(exponentiate(5, 0)).toBe(1);
            expect(exponentiate(-5, 0)).toBe(1);
            expect(exponentiate(Infinity, 0)).toBe(1);
        });

        test('raises zero to a positive power', () => {
            expect(exponentiate(0, 5)).toBe(0);
        });

        test('raises zero to the power of zero', () => {
            expect(exponentiate(0, 0)).toBe(1);
        });

        test('raises a number to a negative power', () => {
            expect(exponentiate(2, -1)).toBe(0.5);
            expect(exponentiate(4, -2)).toBe(0.0625);
        });

        test('raises a negative number to an even power', () => {
            expect(exponentiate(-2, 2)).toBe(4);
            expect(exponentiate(-2, 4)).toBe(16);
        });

        test('raises a negative number to an odd power', () => {
            expect(exponentiate(-2, 3)).toBe(-8);
            expect(exponentiate(-1, 5)).toBe(-1);
        });

        test('raises a positive number to a fractional power (root)', () => {
            expect(exponentiate(9, 0.5)).toBe(3);
            expect(exponentiate(8, 1/3)).toBeCloseTo(2);
        });

        test('returns NaN for negative base with fractional exponent', () => {
            expect(exponentiate(-1, 0.5)).toBeNaN();
            expect(exponentiate(-4, 2.5)).toBeNaN();
        });

        test('raises 1 to any power', () => {
            expect(exponentiate(1, 100)).toBe(1);
            expect(exponentiate(1, -5)).toBe(1);
            // In JavaScript 1 ** Infinity is 1
            expect(exponentiate(1, Infinity)).toBe(1);
        });

        test('raises Infinity to powers', () => {
            expect(exponentiate(Infinity, 2)).toBe(Infinity);
            expect(exponentiate(Infinity, -2)).toBe(0);
            expect(exponentiate(-Infinity, 3)).toBe(-Infinity);
            expect(exponentiate(-Infinity, 2)).toBe(Infinity);
        });

        test('returns NaN for non-numeric input', () => {
            expect(exponentiate('base', 2)).toBeNaN();
            expect(exponentiate(2, 'exp')).toBeNaN();
            expect(exponentiate(null, 2)).toBeNaN();
            expect(exponentiate(undefined, 2)).toBeNaN();
        });

        test('handles very large exponents', () => {
            expect(exponentiate(2, 2000)).toBe(Infinity);
        });

        test('handles NaN', () => {
            expect(exponentiate(NaN, 2)).toBeNaN();
            expect(exponentiate(2, NaN)).toBeNaN();
        });
    });
});