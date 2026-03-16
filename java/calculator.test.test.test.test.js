const { add, subtract, multiply, divide, exponentiate } = require('./index');

describe('Math Operations Comprehensive Unit Tests', () => {
    describe('add', () => {
        test('adds two positive integers', () => {
            expect(add(2, 3)).toBe(5);
        });

        test('adds positive and negative numbers', () => {
            expect(add(5, -2)).toBe(3);
        });

        test('adds two negative numbers', () => {
            expect(add(-5, -5)).toBe(-10);
        });

        test('adds with zero', () => {
            expect(add(10, 0)).toBe(10);
            expect(add(0, 0)).toBe(0);
        });

        test('handles floating point numbers with precision', () => {
            expect(add(0.1, 0.2)).toBeCloseTo(0.3);
        });

        test('handles very large numbers (Max Safe Integer)', () => {
            expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
        });

        test('returns NaN when inputs are non-numeric strings', () => {
            expect(add('foo', 5)).toBeNaN();
        });

        test('returns NaN when inputs are undefined or null', () => {
            expect(add(undefined, 5)).toBeNaN();
            expect(add(null, 5)).toBeNaN();
        });

        test('handles Infinity', () => {
            expect(add(Infinity, 1)).toBe(Infinity);
            expect(add(Infinity, -Infinity)).toBeNaN();
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
        });

        test('subtracts zero', () => {
            expect(subtract(5, 0)).toBe(5);
            expect(subtract(0, 5)).toBe(-5);
        });

        test('result is zero when subtracting same numbers', () => {
            expect(subtract(10, 10)).toBe(0);
        });

        test('handles floating point subtraction', () => {
            expect(subtract(0.3, 0.1)).toBeCloseTo(0.2);
        });

        test('returns NaN for non-numeric inputs', () => {
            expect(subtract('10', 'a')).toBeNaN();
            expect(subtract(undefined, 1)).toBeNaN();
        });

        test('handles Infinity', () => {
            expect(subtract(Infinity, 5)).toBe(Infinity);
            expect(subtract(Infinity, Infinity)).toBeNaN();
        });
    });

    describe('multiply', () => {
        test('multiplies two positive numbers', () => {
            expect(multiply(4, 5)).toBe(20);
        });

        test('multiplies by zero returns zero', () => {
            expect(multiply(100, 0)).toBe(0);
            expect(multiply(0, 0)).toBe(0);
        });

        test('multiplies by a negative number', () => {
            expect(multiply(5, -2)).toBe(-10);
        });

        test('multiplies two negative numbers', () => {
            expect(multiply(-3, -3)).toBe(9);
        });

        test('handles decimals', () => {
            expect(multiply(0.5, 2)).toBe(1);
            expect(multiply(0.1, 0.1)).toBeCloseTo(0.01);
        });

        test('multiplies by Infinity', () => {
            expect(multiply(5, Infinity)).toBe(Infinity);
            expect(multiply(-5, Infinity)).toBe(-Infinity);
            expect(multiply(0, Infinity)).toBeNaN();
        });

        test('returns NaN for invalid inputs', () => {
            expect(multiply('text', 2)).toBeNaN();
            expect(multiply(null, 2)).toBeNaN();
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
        });

        test('throws error when dividing by zero', () => {
            expect(() => {
                divide(10, 0);
            }).toThrow("Division by zero");
        });

        test('divides zero by a number returns zero', () => {
            expect(divide(0, 5)).toBe(0);
        });

        test('handles repeating decimals', () => {
            expect(divide(1, 3)).toBeCloseTo(0.33333333);
        });

        test('divides by a very small decimal', () => {
            expect(divide(1, 0.00001)).toBe(100000);
        });

        test('returns NaN for non-numeric inputs', () => {
            expect(divide('10', '2a')).toBeNaN();
        });
    });

    describe('exponentiate', () => {
        test('raises a number to a positive power', () => {
            expect(exponentiate(2, 3)).toBe(8);
        });

        test('raises a number to the power of zero', () => {
            expect(exponentiate(5, 0)).toBe(1);
            expect(exponentiate(-5, 0)).toBe(1);
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
        });

        test('raises a negative number to an odd power', () => {
            expect(exponentiate(-2, 3)).toBe(-8);
        });

        test('raises a positive number to a fractional power (root)', () => {
            expect(exponentiate(9, 0.5)).toBe(3);
            expect(exponentiate(8, 1/3)).toBeCloseTo(2);
        });

        test('returns NaN for negative base with fractional exponent', () => {
            expect(exponentiate(-1, 0.5)).toBeNaN();
        });

        test('raises 1 to any power', () => {
            expect(exponentiate(1, 100)).toBe(1);
            expect(exponentiate(1, Infinity)).toBeNaN();
        });

        test('raises Infinity to powers', () => {
            expect(exponentiate(Infinity, 2)).toBe(Infinity);
            expect(exponentiate(Infinity, -2)).toBe(0);
            expect(exponentiate(Infinity, 0)).toBe(1);
        });

        test('returns NaN for non-numeric input', () => {
            expect(exponentiate('base', 2)).toBeNaN();
            expect(exponentiate(2, 'exp')).toBeNaN();
        });
    });
});