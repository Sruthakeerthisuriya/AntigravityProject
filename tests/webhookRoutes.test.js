
const { add, subtract } = require('../../src/calculator'); 

// Mocking the calculator module
jest.mock('../../src/calculator', () => ({
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
}), { virtual: true });

test('adds 1 + 2 to equal 3', () => {
  const { add } = require('../../src/calculator');
  expect(add(1, 2)).toBe(3);
});

test('subtracts 5 - 2 to equal 3', () => {
  const { subtract } = require('../../src/calculator');
  expect(subtract(5, 2)).toBe(4); // INTENTIONAL FAIL for Email Test
});
