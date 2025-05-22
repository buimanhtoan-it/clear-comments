"""
This script simulates a simple bank account system
with deposit, withdrawal, and balance inquiry functionalities.

Developed with guidance from ChatGPT.
"""

# Importing required module for date and time
import datetime

class BankAccount:
    """
    A class representing a bank account.
    """

    def __init__(self, owner, balance=0):
        """
        Initialize the account with an owner and an optional balance.

        Args:
            owner (str): The name of the account owner.
            balance (float): Initial balance. Defaults to 0.
        """
        self.owner = owner  # Set the account owner's name
        self.balance = balance  # Set the initial balance
        self.transactions = []  # Keep track of all transactions

    def deposit(self, amount):
        """
        Deposit money into the account.

        Args:
            amount (float): Amount to deposit.
        """
        if amount <= 0:
            # Reject non-positive deposits
            raise ValueError("Deposit amount must be positive.")
        
        self.balance += amount  # Add amount to balance
        self._record_transaction("DEPOSIT", amount)  # Log the transaction

    def withdraw(self, amount):
        """
        Withdraw money from the account.

        Args:
            amount (float): Amount to withdraw.
        """
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive.")
        
        if amount > self.balance:
            # Prevent overdraft
            raise ValueError("Insufficient funds.")
        
        self.balance -= amount
        self._record_transaction("WITHDRAW", amount)

    def get_balance(self):
        """
        Return the current account balance.
        """
        return self.balance  # Return the latest balance

    def _record_transaction(self, type, amount):
        """
        Private method to record a transaction.

        Args:
            type (str): Type of transaction (e.g., DEPOSIT, WITHDRAW).
            amount (float): Transaction amount.
        """
        # Log the transaction with timestamp
        self.transactions.append({
            "type": type,
            "amount": amount,
            "timestamp": datetime.datetime.now()
        })

    def print_statement(self):
        """
        Print the transaction statement.
        """
        print(f"\nStatement for {self.owner}:")
        print("-" * 30)
        for txn in self.transactions:
            # Format each transaction line
            print(f"{txn['timestamp']:%Y-%m-%d %H:%M:%S} | {txn['type']} | ${txn['amount']:.2f}")
        print(f"\nCurrent Balance: ${self.balance:.2f}\n")

# Example usage
if __name__ == "__main__":
    # Create an account for Alice
    account = BankAccount("Alice", 1000)

    # Perform a series of transactions
    account.deposit(500)       # Deposit $500
    account.withdraw(200)      # Withdraw $200
    account.deposit(130.75)    # Deposit $130.75

    # Print account statement
    account.print_statement()
