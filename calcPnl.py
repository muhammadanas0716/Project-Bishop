def calculate_pnl(entry_price, exit_price, contracts):
    """
    Calculate PnL and PnL percentage for an options trade.

    Parameters:
        entry_price (float): Entry price per option.
        exit_price (float): Exit price per option.
        contracts (int): Number of option contracts traded.

    Returns:
        tuple: (total_pnl, pnl_percent)
            total_pnl (float): Total profit or loss in dollars.
            pnl_percent (float): Profit or loss percentage.
    """
    # Calculate PnL per contract (price difference * 100)
    pnl_per_contract = (exit_price - entry_price) * 100  # Multiplied by 100 as options are priced per share

    # Total PnL for all contracts
    total_pnl = pnl_per_contract * contracts

    # Total cost of the trade (entry price * 100 * number of contracts)
    total_cost = entry_price * 100 * contracts

    # PnL percentage
    pnl_percent = (total_pnl / total_cost) * 100

    return total_pnl, pnl_percent

# Example usage
if __name__ == "__main__":
    try:
        entry = float(input("Enter the entry price: "))
        exit = float(input("Enter the exit price: "))
        contracts = int(input("Enter the number of contracts: "))

        pnl, pnl_percent = calculate_pnl(entry, exit, contracts)

        print(f"Total PnL: ${pnl:.2f}")
        print(f"PnL Percentage: {pnl_percent:.2f}%")
    except ValueError:
        print("Invalid input. Please enter numeric values for prices and an integer for contracts.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
