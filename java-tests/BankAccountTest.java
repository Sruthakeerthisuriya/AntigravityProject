package com.antigravity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {

    private BankAccount account;
    private final String holderName = "John Doe";
    private final double initialBalance = 1000.0;
    private final double precision = 0.001;

    @BeforeEach
    void setUp() {
        account = new BankAccount(holderName, initialBalance);
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should create account with valid parameters")
        void shouldCreateAccountWithValidParameters() {
            assertEquals(holderName, account.getAccountHolder());
            assertEquals(initialBalance, account.getBalance(), precision);
        }

        @Test
        @DisplayName("Should create account with zero balance")
        void shouldCreateAccountWithZeroBalance() {
            BankAccount zeroAccount = new BankAccount("Jane Doe", 0);
            assertEquals(0, zeroAccount.getBalance(), precision);
        }

        @Test
        @DisplayName("Should throw exception for negative initial balance")
        void shouldThrowExceptionForNegativeInitialBalance() {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                new BankAccount("Bad User", -1.0)
            );
            assertEquals("Initial balance cannot be negative.", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Deposit Tests")
    class DepositTests {

        @Test
        @DisplayName("Should increase balance for valid deposit")
        void shouldIncreaseBalanceForValidDeposit() {
            account.deposit(500.0);
            assertEquals(1500.0, account.getBalance(), precision);
        }

        @ParameterizedTest
        @ValueSource(doubles = {0.0, -1.0, -100.0})
        @DisplayName("Should throw exception for non-positive deposits")
        void shouldThrowExceptionForInvalidDeposits(double amount) {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                account.deposit(amount)
            );
            assertEquals("Deposit amount must be positive.", exception.getMessage());
            assertEquals(initialBalance, account.getBalance(), "Balance should remain unchanged");
        }
    }

    @Nested
    @DisplayName("Withdrawal Tests")
    class WithdrawalTests {

        @Test
        @DisplayName("Should decrease balance for valid withdrawal")
        void shouldDecreaseBalanceForValidWithdrawal() {
            account.withdraw(400.0);
            assertEquals(600.0, account.getBalance(), precision);
        }

        @Test
        @DisplayName("Should allow withdrawal of entire balance")
        void shouldAllowWithdrawalOfEntireBalance() {
            account.withdraw(initialBalance);
            assertEquals(0.0, account.getBalance(), precision);
        }

        @ParameterizedTest
        @ValueSource(doubles = {0.0, -50.0})
        @DisplayName("Should throw exception for non-positive withdrawal amounts")
        void shouldThrowExceptionForInvalidWithdrawalAmounts(double amount) {
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> 
                account.withdraw(amount)
            );
            assertEquals("Withdrawal amount must be positive.", exception.getMessage());
            assertEquals(initialBalance, account.getBalance());
        }

        @Test
        @DisplayName("Should throw exception for withdrawal exceeding balance")
        void shouldThrowExceptionForInsufficientFunds() {
            IllegalStateException exception = assertThrows(IllegalStateException.class, () -> 
                account.withdraw(initialBalance + 0.01)
            );
            assertEquals("Insufficient funds.", exception.getMessage());
            assertEquals(initialBalance, account.getBalance());
        }
    }

    @Nested
    @DisplayName("Transfer Tests")
    class TransferTests {

        private BankAccount targetAccount;

        @BeforeEach
        void setUpTarget() {
            targetAccount = new BankAccount("Jane Smith", 500.0);
        }

        @Test
        @DisplayName("Should transfer funds correctly between accounts")
        void shouldTransferFundsCorrectly() {
            double transferAmount = 200.0;
            double remainingBalance = account.transfer(targetAccount, transferAmount);

            assertEquals(800.0, remainingBalance, precision);
            assertEquals(800.0, account.getBalance(), precision);
            assertEquals(700.0, targetAccount.getBalance(), precision);
        }

        @Test
        @DisplayName("Should fail transfer if source has insufficient funds")
        void shouldFailTransferDueToInsufficientFunds() {
            double transferAmount = initialBalance + 1.0;
            
            assertThrows(IllegalStateException.class, () -> 
                account.transfer(targetAccount, transferAmount)
            );
            
            // Verify atomicity (source unchanged, target unchanged)
            assertEquals(initialBalance, account.getBalance());
            assertEquals(500.0, targetAccount.getBalance());
        }

        @Test
        @DisplayName("Should fail transfer if amount is negative")
        void shouldFailTransferDueToInvalidAmount() {
            assertThrows(IllegalArgumentException.class, () -> 
                account.transfer(targetAccount, -50.0)
            );
        }
    }

    @Nested
    @DisplayName("Utility Tests")
    class UtilityTests {

        @Test
        @DisplayName("Should return correct string representation")
        void shouldReturnCorrectStringRepresentation() {
            String expected = String.format("BankAccount[holder=%s, balance=%.2f]", holderName, initialBalance);
            assertEquals(expected, account.toString());
        }
        
        @Test
        @DisplayName("Should handle string formatting with various decimals")
        void shouldHandleStringFormatting() {
            BankAccount ba = new BankAccount("Test", 123.456);
            // %.2f rounds
            assertEquals("BankAccount[holder=Test, balance=123.46]", ba.toString());
        }
    }
}