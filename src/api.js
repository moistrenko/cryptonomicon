const API_KEY =
  '82111332b91e38e10885d9dceb7f328bd4c02617edd993940566cddd84458208';
const API_KEY_2 =
  'd9308bc5b23f6b92c0115e0fd9ea42ecc54cf8b66f23b830359de2773609a84a';

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`,
);

window.soc = socket;
console.log(123);
socket.addEventListener('message', (e) => {
  console.log(e);
});

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(',')}&tsyms=USD&api_key=${API_KEY_2}`,
  )
    .then((res) => res.json())
    .then((rawData) => {
      const updatedPrice = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD]),
      );

      Object.entries(updatedPrice).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

function subscribeToTickerOnWebSocket(ticker) {
  const message = JSON.stringify({
    action: 'SubAdd',
    subs: `5~CCCAGG~${ticker}~USD`,
  });

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(message);
    },
    { once: true },
  );
}

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
  subscribeToTickerOnWebSocket(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  // const subscribers = tickersHandlers.get(ticker) || [];
  // tickersHandlers.set(
  //   ticker,
  //   subscribers.filter((fn) => fn !== callback),
  // );
};

setInterval(loadTickers, 3000);
