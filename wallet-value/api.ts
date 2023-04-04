import { fixerApiKey } from "./input";
import { Currency } from "./interface";

var myHeaders = new Headers();
myHeaders.append("apikey", fixerApiKey);

var requestOptions: any = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
};

export const getAllSymbols = async () => {
  try {
    const response = await fetch(
      "https://api.apilayer.com/fixer/symbols",
      requestOptions
    );

    const result = await response.json();

    console.log("result", result);
    return result.success ? result?.symbols : [];
  } catch (err) {
    console.error(err);
  }
};

export const getLatestConversionRates = async (
  symbols: any,
  baseCurrency: Currency
) => {
  try {
    if (!symbols?.length) return [];

    const response = await fetch(
      `https://api.apilayer.com/fixer/latest?symbols=${symbols?.toString()}&base=${baseCurrency}`,
      requestOptions
    );
    const result = await response.json();
    return result.success ? result.rates : [];
  } catch (err) {
    console.error(err);
  }
};
