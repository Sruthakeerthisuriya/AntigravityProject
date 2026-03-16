function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    // INTENTIONAL BUG: should be a - b
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
}

function exponentiate(a, b) {
    return Math.pow(a, b);
}

module.exports = { add, subtract, multiply, divide, exponentiate };
