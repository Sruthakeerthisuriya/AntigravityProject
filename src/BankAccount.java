package com.antigravity;

/**
 * A simple BankAccount class to demonstrate automated test generation.
 */
public class BankAccount {

    private String accountHolder;
    private double balance;

    public BankAccount(String accountHolder, double initialBalance) {
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative.");
        }
        this.accountHolder = accountHolder;
        this.balance = initialBalance;
    }

    public String getAccountHolder() {
        return accountHolder;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive.");
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive.");
        }
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds.");
        }
        balance -= amount;
    }

    public double transfer(BankAccount target, double amount) {
        this.withdraw(amount);
        target.deposit(amount);
        return this.balance;
    }

    @Override
    public String toString() {
        return String.format("BankAccount[holder=%s, balance=%.2f]", accountHolder, balance);
    }
}
