const API_KEY =
  '82111332b91e38e10885d9dceb7f328bd4c02617edd993940566cddd84458208';

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`,
);

const AGREEGATE_INDEX = '5';

socket.addEventListener('message', (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(e.data);

  if (!newPrice || type !== AGREEGATE_INDEX) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];

  handlers.forEach((fn) => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true },
  );
}

function subsOrUnsubsToTicker(ticker, unsubscribe = false) {
  const message = {
    action: `${unsubscribe ? 'SubRemove' : 'SubAdd'}`,
    subs: [`5~CCCAGG~${ticker}~USD`],
  };

  sendToWebSocket(message);
}

export const subscribeToTicker = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];

  tickersHandlers.set(ticker, [...subscribers, callback]);

  subsOrUnsubsToTicker(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);

  subsOrUnsubsToTicker(ticker, true);
};
