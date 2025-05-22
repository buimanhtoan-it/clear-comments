/**
 * This script defines a simple BankAccount class
 * with deposit, withdrawal, and transaction logging capabilities.
 *
 * Generated with ChatGPT-style comments.
 */

// BankAccount class definition
class BankAccount {
  /**
   * Constructor to initialize the account
   * @param {string} owner - Name of the account holder
   * @param {number} balance - Initial balance
   */
  constructor(owner, balance = 0) {
    this.owner = owner;           // Set the owner's name
    this.balance = balance;       // Set the starting balance
    this.transactions = [];       // Store all transaction history
  }

  /**
   * Deposit money into the account
   * @param {number} amount - Amount to deposit
   */
  deposit(amount) {
    if (amount <= 0) {
      // Reject negative or zero deposits
      throw new Error("Deposit must be a positive number.");
    }

    this.balance += amount;  // Increase balance
    this._recordTransaction("DEPOSIT", amount); // Log the transaction
  }

  /**
   * Withdraw money from the account
   * @param {number} amount - Amount to withdraw
   */
  withdraw(amount) {
    if (amount <= 0) {
      throw new Error("Withdrawal must be a positive number.");
    }

    if (amount > this.balance) {
      // Prevent overdrawing
      throw new Error("Insufficient funds.");
    }

    this.balance -= amount;
    this._recordTransaction("WITHDRAW", amount);
  }

  /**
   * Get the current account balance
   * @returns {number} The current balance
   */
  getBalance() {
    return this.balance; // Return balance without formatting
  }

  /**
   * Internal method to record a transaction
   * @param {string} type - Type of transaction
   * @param {number} amount - Transaction amount
   */
  _recordTransaction(type, amount) {
    // Push a transaction object into the array
    this.transactions.push({
      type: type,
      amount: amount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Print the account's transaction statement
   */
  printStatement() {
    console.log(`\nTransaction Statement for ${this.owner}`);
    console.log("=".repeat(40));

    this.transactions.forEach(txn => {
      // Log each transaction line
      console.log(`${txn.timestamp} | ${txn.type} | $${txn.amount.toFixed(2)}`);
    });

    console.log(`\nCurrent Balance: $${this.balance.toFixed(2)}\n`);
  }
}

// Example usage
(function main() {
  // Create an account for Bob
  const account = new BankAccount("Bob", 1000);

  // Simulate a series of operations
  account.deposit(250);     // Deposit $250
  account.withdraw(400);    // Withdraw $400
  account.deposit(300);     // Deposit $300

  // Output transaction history
  account.printStatement();
})();
