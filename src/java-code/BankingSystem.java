package com.example.banking;

import java.util.ArrayList;
import java.util.List;

public class BankingSystem {
    private List<Account> accounts = new ArrayList<>();

    public void addAccount(Account account) {
        if (account == null) throw new IllegalArgumentException("Account cannot be null");
        accounts.add(account);
    }

    public Account findAccount(String accountNumber) {
        return accounts.stream()
                .filter(a -> a.getAccountNumber().equals(accountNumber))
                .findFirst()
                .orElse(null);
    }

    public boolean transfer(String fromAccount, String toAccount, double amount) {
        Account source = findAccount(fromAccount);
        Account destination = findAccount(toAccount);

        if (source != null && destination != null && source.getBalance() >= amount) {
            source.withdraw(amount);
            destination.deposit(amount);
            return true;
        }
        return false;
    }

    public static class Account {
        private String accountNumber;
        private double balance;

        public Account(String accountNumber, double initialBalance) {
            this.accountNumber = accountNumber;
            this.balance = initialBalance;
        }

        public String getAccountNumber() { return accountNumber; }
        public double getBalance() { return balance; }

        public void deposit(double amount) {
            if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
            balance += amount;
        }

        public void withdraw(double amount) {
            if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive");
            if (amount > balance) throw new IllegalStateException("Insufficient funds");
            balance -= amount;
        }
    }
}
