import { Currency, Wallet } from "./interface";
import { getLatestConversionRates } from "./api";
import { calculateWalletValue, getWalletSymbols } from "./utils";
import { currency, wallet } from "./input";

const getWalletValue = async (wall: Wallet, curr: Currency) => {
  const symbols = getWalletSymbols(wall);

  const rates = await getLatestConversionRates(symbols, curr);

  const value = calculateWalletValue(wall, rates);

  console.log(`Your Wallet Value is ${value.toFixed(2)} ${curr}`);
};

getWalletValue(wallet, currency);
