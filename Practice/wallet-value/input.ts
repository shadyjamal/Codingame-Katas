import { Currency, Wallet } from "./interface";

export const wallet: Wallet = {
  assets: [
    {
      quantity: 1000,
      symbol: Currency.EUR,
    },
    {
      quantity: 2000,
      symbol: Currency.MAD,
    },
    {
      quantity: 1,
      symbol: Currency.BTC,
    },
  ],
};

export const currency = Currency.EUR;

export const fixerApiKey = "AS6fHKKd823ubOsIEgbglQ02RbibVZ95";
