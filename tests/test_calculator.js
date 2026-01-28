const { add, subtract } = require('../src/calculator');

describe('Calculator Operations', () => {

  // --- Test Suite for add(a, b) ---
  describe('add(a, b)', () => {
    // Basic functionality tests
    test('should correctly add two positive integers', () => {
      expect(add(5, 3)).toBe(8);
      expect(add(100, 200)).toBe(300);
    });

    test('should correctly add two negative integers', () => {
      expect(add(-5, -3)).toBe(-8);
      expect(add(-100, -200)).toBe(-300);
    });

    test('should correctly add a positive and a negative integer', () => {
      expect(add(10, -4)).toBe(6);
      expect(add(-10, 4)).toBe(-6);
      expect(add(50, -100)).toBe(-50);
    });

    test('should correctly handle addition involving zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 0)).toBe(0);
      expect(add(-5, 0)).toBe(-5);
    });

    // Edge Cases: Floating Point Numbers
    test('should correctly handle floating point numbers', () => {
      expect(add(1.5, 2.3)).toBeCloseTo(3.8);
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
      expect(add(-1.5, 0.5)).toBe(-1.0);
      expect(add(1.0000001, 2.0000001)).toBeCloseTo(3.0000002);
    });

    // Edge Cases: Large Numbers (within safe integer limits)
    test('should correctly handle large numbers within safe limits', () => {
      const MAX_SAFE = Number.MAX_SAFE_INTEGER;
      expect(add(MAX_SAFE, 0)).toBe(MAX_SAFE);
      expect(add(MAX_SAFE - 1, 1)).toBe(MAX_SAFE);
    });

    // Edge Cases: Numbers exceeding safe integer limits (JS standard behavior)
    test('should handle very large numbers that might lose precision', () => {
        const large1 = 9007199254740990;
        const large2 = 5;
        // Even though this is slightly over the limit, JS might still handle the addition correctly unless internal logic handles BigInt.
        // Assuming standard number behavior:
        expect(add(large1, large2)).toBe(9007199254740995);
        expect(add(Number.MAX_SAFE_INTEGER, 2)).toBe(9007199254740993);
    });


    // Edge Cases: Input Types (Testing JS coercion/behavior)
    test('should handle string concatenation when strings are passed (JS default behavior)', () => {
      expect(add('a', 'b')).toBe('ab');
      expect(add('5', '3')).toBe('53');
      expect(add(5, '3')).toBe('53');
      expect(add('hello ', 'world')).toBe('hello world');
    });

    test('should handle boolean addition (true=1, false=0)', () => {
      expect(add(true, 5)).toBe(6);
      expect(add(false, 5)).toBe(5);
      expect(add(true, true)).toBe(2);
    });

    test('should handle addition involving null (treated as 0)', () => {
      expect(add(5, null)).toBe(5);
      expect(add(null, 5)).toBe(5);
      expect(add(null, null)).toBe(0);
    });

    test('should handle addition involving undefined (resulting in NaN)', () => {
      expect(add(5, undefined)).toBeNaN();
      expect(add(undefined, 5)).toBeNaN();
      expect(add(undefined, undefined)).toBeNaN();
      expect(add(null, undefined)).toBeNaN();
    });

    test('should handle Infinity', () => {
        expect(add(5, Infinity)).toBe(Infinity);
        expect(add(-Infinity, Infinity)).toBeNaN();
        expect(add(Infinity, Infinity)).toBe(Infinity);
        expect(add(-5, Infinity)).toBe(Infinity);
    });

    test('should handle NaN inputs', () => {
        expect(add(5, NaN)).toBeNaN();
        expect(add(NaN, NaN)).toBeNaN();
    });
  });

  // --- Test Suite for subtract(a, b) ---
  describe('subtract(a, b)', () => {
    // Basic functionality tests
    test('should correctly subtract a smaller positive number from a larger one', () => {
      expect(subtract(10, 4)).toBe(6);
    });

    test('should correctly subtract a larger positive number from a smaller one', () => {
      expect(subtract(5, 10)).toBe(-5);
    });

    test('should correctly subtract two negative integers', () => {
      // -5 - (-3) = -2
      expect(subtract(-5, -3)).toBe(-2);
      // -10 - (-20) = 10
      expect(subtract(-10, -20)).toBe(10);
    });

    test('should correctly subtract mixed sign integers', () => {
      // 10 - (-5) = 15
      expect(subtract(10, -5)).toBe(15);
      // -10 - 5 = -15
      expect(subtract(-10, 5)).toBe(-15);
    });

    test('should correctly handle subtraction involving zero', () => {
      expect(subtract(5, 0)).toBe(5);
      expect(subtract(0, 5)).toBe(-5);
      expect(subtract(0, 0)).toBe(0);
      expect(subtract(-5, 0)).toBe(-5);
    });

    // Edge Cases: Floating Point Numbers
    test('should correctly handle floating point numbers', () => {
      expect(subtract(5.5, 2.3)).toBeCloseTo(3.2);
      expect(subtract(0.3, 0.1)).toBeCloseTo(0.2);
      expect(subtract(1.0, 0.9)).toBeCloseTo(0.1);
    });

    // Edge Cases: Large Numbers
    test('should correctly handle large numbers within safe limits', () => {
      const large1 = 9007199254740995;
      const large2 = 5;
      expect(subtract(large1, large2)).toBe(9007199254740990);
      expect(subtract(Number.MAX_SAFE_INTEGER, 1)).toBe(9007199254740990);
    });

    // Edge Cases: Input Types (Coercion specific to subtraction)
    test('should attempt coercion for string inputs resulting in number output', () => {
      // '10' - '5' => 5
      expect(subtract('10', '5')).toBe(5);
      expect(subtract(10, '5')).toBe(5);
      expect(subtract('10', 5)).toBe(5);
    });

    test('should result in NaN if strings are not coercible to numbers', () => {
        expect(subtract('a', 5)).toBeNaN();
        expect(subtract(5, 'b')).toBeNaN();
    });

    test('should handle boolean subtraction (true=1, false=0)', () => {
        expect(subtract(5, true)).toBe(4);
        expect(subtract(true, false)).toBe(1);
    });

    test('should handle subtraction involving null (treated as 0)', () => {
      // 5 - 0 = 5
      expect(subtract(5, null)).toBe(5);
      // 0 - 5 = -5
      expect(subtract(null, 5)).toBe(-5);
      expect(subtract(null, null)).toBe(0);
    });

    test('should handle subtraction involving undefined (resulting in NaN)', () => {
      expect(subtract(5, undefined)).toBeNaN();
      expect(subtract(undefined, 5)).toBeNaN();
      expect(subtract(undefined, undefined)).toBeNaN();
    });

    test('should handle Infinity', () => {
        expect(subtract(Infinity, 5)).toBe(Infinity);
        expect(subtract(5, Infinity)).toBe(-Infinity);
        expect(subtract(Infinity, Infinity)).toBeNaN();
        expect(subtract(-Infinity, Infinity)).toBe(-Infinity);
    });

    test('should handle NaN inputs', () => {
        expect(subtract(5, NaN)).toBeNaN();
        expect(subtract(NaN, NaN)).toBeNaN();
    });
  });

});