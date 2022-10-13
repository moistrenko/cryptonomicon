const API_KEY =
  'd9308bc5b23f6b92c0115e0fd9ea42ecc54cf8b66f23b830359de2773609a84a';

export const loadTicker = (tickers) =>
  fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${tickers.join(
      ',',
    )}&api_key=${API_KEY}`,
  ).then((res) => res.json());
