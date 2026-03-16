const { add, subtract, multiply, divide, exponentiate } = require('./index');

describe('Math Operations - Comprehensive Unit Test Suite', () => {
    describe('add()', () => {
        test('should return the sum of two positive integers', () => {
            expect(add(10, 25)).toBe(35);
        });

        test('should handle negative numbers correctly', () => {
            expect(add(-5, -10)).toBe(-15);
            expect(add(-5, 10)).toBe(5);
            expect(add(5, -10)).toBe(-5);
        });

        test('should handle floating point numbers with precision', () => {
            expect(add(0.1, 0.2)).toBeCloseTo(0.3);
            expect(add(-0.1, -0.2)).toBeCloseTo(-0.3);
        });

        test('should return the same number when adding zero', () => {
            expect(add(5, 0)).toBe(5);
            expect(add(0, 5)).toBe(5);
            expect(add(0, 0)).toBe(0);
        });

        test('should handle large numbers and Infinity', () => {
            expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
            expect(add(Infinity, 1)).toBe(Infinity);
            expect(add(Infinity, -Infinity)).toBeNaN();
        });

        test('should return NaN for non-numeric types', () => {
            const invalid = ['string', null, undefined, {}, [], Symbol(), true];
            invalid.forEach(val => {
                expect(add(val, 5)).toBeNaN();
                expect(add(5, val)).toBeNaN();
            });
        });

        test('should return NaN if any argument is NaN', () => {
            expect(add(NaN, 5)).toBeNaN();
            expect(add(5, NaN)).toBeNaN();
        });
    });

    describe('subtract()', () => {
        test('should return the difference of two numbers', () => {
            expect(subtract(100, 40)).toBe(60);
        });

        test('should handle results that are negative', () => {
            expect(subtract(10, 50)).toBe(-40);
        });

        test('should handle negative input numbers', () => {
            expect(subtract(-10, -5)).toBe(-5);
            expect(subtract(-10, 5)).toBe(-15);
        });

        test('should handle floating point precision', () => {
            expect(subtract(0.3, 0.1)).toBeCloseTo(0.2);
        });

        test('should handle Infinity cases', () => {
            expect(subtract(Infinity, Infinity)).toBeNaN();
            expect(subtract(Infinity, 100)).toBe(Infinity);
            expect(subtract(100, Infinity)).toBe(-Infinity);
        });

        test('should return NaN for invalid input types', () => {
            expect(subtract('10', 5)).toBeNaN();
            expect(subtract(10, null)).toBeNaN();
            expect(subtract(undefined, 5)).toBeNaN();
        });
    });

    describe('multiply()', () => {
        test('should return the product of two numbers', () => {
            expect(multiply(6, 7)).toBe(42);
        });

        test('should return 0 when multiplying by zero', () => {
            expect(multiply(10, 0)).toBe(0);
            expect(multiply(0, 10)).toBe(0);
        });

        test('should handle signed zeros correctly', () => {
            expect(Object.is(multiply(5, -0), -0)).toBe(true);
            expect(Object.is(multiply(-5, -0), 0)).toBe(true);
        });

        test('should handle negative products', () => {
            expect(multiply(5, -2)).toBe(-10);
            expect(multiply(-5, -2)).toBe(10);
        });

        test('should handle Infinity', () => {
            expect(multiply(Infinity, 5)).toBe(Infinity);
            expect(multiply(Infinity, -5)).toBe(-Infinity);
            expect(multiply(Infinity, 0)).toBeNaN();
        });

        test('should return NaN for non-numeric inputs', () => {
            expect(multiply('2', 3)).toBeNaN();
            expect(multiply(null, 3)).toBeNaN();
            expect(multiply(undefined, 3)).toBeNaN();
        });
    });

    describe('divide()', () => {
        test('should return the quotient of two numbers', () => {
            expect(divide(10, 2)).toBe(5);
        });

        test('should return a decimal for non-integer division', () => {
            expect(divide(5, 2)).toBe(2.5);
            expect(divide(1, 3)).toBeCloseTo(0.333333);
        });

        test('should throw an error when dividing by zero', () => {
            expect(() => divide(10, 0)).toThrow("Division by zero");
            expect(() => divide(0, 0)).toThrow("Division by zero");
            expect(() => divide(-5, 0)).toThrow("Division by zero");
        });

        test('should handle negative numbers', () => {
            expect(divide(-10, 2)).toBe(-5);
            expect(divide(10, -2)).toBe(-5);
            expect(divide(-10, -2)).toBe(5);
        });

        test('should handle Infinity', () => {
            expect(divide(Infinity, 2)).toBe(Infinity);
            expect(divide(2, Infinity)).toBe(0);
            expect(divide(Infinity, Infinity)).toBeNaN();
        });

        test('should return NaN for invalid inputs', () => {
            expect(divide('10', 2)).toBeNaN();
            expect(divide(10, null)).toBeNaN();
            expect(divide(10, undefined)).toBeNaN();
        });
    });

    describe('exponentiate()', () => {
        test('should raise base to the power of exponent', () => {
            expect(exponentiate(2, 3)).toBe(8);
            expect(exponentiate(5, 2)).toBe(25);
        });

        test('should return 1 when exponent is 0', () => {
            expect(exponentiate(10, 0)).toBe(1);
            expect(exponentiate(0, 0)).toBe(1);
            expect(exponentiate(-5, 0)).toBe(1);
            expect(exponentiate(Infinity, 0)).toBe(1);
        });

        test('should handle negative exponents', () => {
            expect(exponentiate(2, -1)).toBe(0.5);
            expect(exponentiate(2, -2)).toBe(0.25);
        });

        test('should handle negative bases', () => {
            expect(exponentiate(-2, 2)).toBe(4);
            expect(exponentiate(-2, 3)).toBe(-8);
        });

        test('should return NaN for negative base and fractional exponent', () => {
            expect(exponentiate(-4, 0.5)).toBeNaN();
        });

        test('should handle fractional exponents (roots)', () => {
            expect(exponentiate(9, 0.5)).toBe(3);
            expect(exponentiate(27, 1/3)).toBeCloseTo(3);
        });

        test('should handle base 0 with different exponents', () => {
            expect(exponentiate(0, 5)).toBe(0);
            expect(exponentiate(0, -1)).toBe(Infinity);
        });

        test('should handle large results and Infinity', () => {
            expect(exponentiate(2, 2000)).toBe(Infinity);
            expect(exponentiate(Infinity, 2)).toBe(Infinity);
            expect(exponentiate(Infinity, -1)).toBe(0);
        });

        test('should return NaN for invalid inputs', () => {
            expect(exponentiate('2', 2)).toBeNaN();
            expect(exponentiate(2, '2')).toBeNaN();
            expect(exponentiate(null, 2)).toBeNaN();
            expect(exponentiate(undefined, 2)).toBeNaN();
            expect(exponentiate(2, NaN)).toBeNaN();
        });
    });
});