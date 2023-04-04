import { Currency, Wallet } from "./interface";

export const calculateWalletValue = (wall: Wallet, rates: any) => {
  const assetsArray = wall.assets.map((asset) => {
    const assetConvertRate = rates?.[asset?.symbol];
    return assetConvertRate ? asset.quantity / assetConvertRate : 0;
  });

  const AssetsValue = assetsArray.reduce((acc, cur) => acc + cur, 0);

  return AssetsValue;
};

export const getWalletSymbols = (wallet: Wallet) => {
  const filteredAssets = wallet.assets
    .map((asset) =>
      Object.values(Currency).includes(asset.symbol) ? asset.symbol : undefined
    )
    .filter((e) => e);

  return filteredAssets;
};
