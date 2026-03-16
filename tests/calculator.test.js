const { add, subtract, multiply, divide, exponentiate } = require('./index');

describe('Math Operations Unit Tests', () => {
    describe('add', () => {
        test('adds two positive numbers correctly', () => {
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
        });

        test('handles floating point numbers', () => {
            expect(add(0.1, 0.2)).toBeCloseTo(0.3);
        });
    });

    describe('subtract', () => {
        test('subtracts a smaller number from a larger number', () => {
            // Note: This test is expected to fail based on the provided buggy implementation
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
        });

        test('result is zero when subtracting same numbers', () => {
            expect(subtract(10, 10)).toBe(0);
        });
    });

    describe('multiply', () => {
        test('multiplies two positive numbers', () => {
            expect(multiply(4, 5)).toBe(20);
        });

        test('multiplies by zero returns zero', () => {
            expect(multiply(100, 0)).toBe(0);
        });

        test('multiplies by a negative number', () => {
            expect(multiply(5, -2)).toBe(-10);
        });

        test('multiplies two negative numbers', () => {
            expect(multiply(-3, -3)).toBe(9);
        });

        test('handles decimals', () => {
            expect(multiply(0.5, 2)).toBe(1);
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
        });

        test('throws error when dividing by zero', () => {
            expect(() => {
                divide(10, 0);
            }).toThrow("Division by zero");
        });

        test('divides zero by a number returns zero', () => {
            expect(divide(0, 5)).toBe(0);
        });
    });

    describe('exponentiate', () => {
        test('raises a number to a positive power', () => {
            expect(exponentiate(2, 3)).toBe(8);
        });

        test('raises a number to the power of zero', () => {
            expect(exponentiate(5, 0)).toBe(1);
        });

        test('raises zero to a power', () => {
            expect(exponentiate(0, 5)).toBe(0);
        });

        test('raises a number to a negative power', () => {
            expect(exponentiate(2, -1)).toBe(0.5);
        });

        test('raises a negative number to an even power', () => {
            expect(exponentiate(-2, 2)).toBe(4);
        });

        test('raises a negative number to an odd power', () => {
            expect(exponentiate(-2, 3)).toBe(-8);
        });
    });
});