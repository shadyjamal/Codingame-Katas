# Wallet

Given a portfolio containing stocks, construct a function that calculates the value of the portfolio in a currency.
Actions have an action quantity and type. The type of stock can be, for example, oil, euros, bitcoins and dollars.
To rate the portfolio in a currency, you can use an external API that provides exchange rates.

# Solution

1- install typescript and ts-node globally `npm install typescript ts-node -g`

2- in the `input.ts` file, you can :

- modify your Wallet following the same structure.
- modify the base currency in which we calculate the wallet value.
- modify the fixer API key to use yours

3- run the script to calculate your wallet's value using this command `ts-node --esm index.ts`

# Fixer API

For this Kata, i used the Fixer api (https://fixer.io/) to get conversion rates for currencies, and a list of all available currencies.  
I subscribed to the free plan to get my api key (100 request/month), if this one reached its limit, feel free to subscribe and get your api key. (update it in `input.ts`)
