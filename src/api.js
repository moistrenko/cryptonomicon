//TODO Реализовать переподкиску на другую крипту если обмена крипта/USD нет, сделать переподписку на крипта/BTC и сделать перерасчет на USD
//TODO Доработать broadcoastChannel чтоб при обновлении страницы брались результаты езе и из LocalStorage

const API_KEY =
  '82111332b91e38e10885d9dceb7f328bd4c02617edd993940566cddd84458208';

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`,
);

const AGREEGATE_INDEX = '5';

const broadcastChannel = new BroadcastChannel('cryptonomicon');

socket.addEventListener('message', (e) => {
  const currency = JSON.parse(e.data);

  appendNewPrice(currency);

  broadcastChannel.postMessage(currency);
});

broadcastChannel.addEventListener('message', (e) => {
  appendNewPrice(e.data);
});

function appendNewPrice(data) {
  let {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: parameter,
  } = data;

  let status = 'success';

  if (message === 'INVALID_SUB') {
    currency = parameter.split('~')[2];
    status = 'error';
  } else if (!newPrice || type !== AGREEGATE_INDEX) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];

  handlers.forEach((fn) => fn(newPrice, status));
}

// function retrySubscribe(tickerName) {

// }

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

export const getCoinsList = () => {
  return fetch(
    'https://min-api.cryptocompare.com/data/all/coinlist?summary=true',
  ).then((res) => res.json());
};

export function setLocalStorage(tickersList) {
  localStorage.setItem('cryptonomicon-list', JSON.stringify(tickersList));
}

export function getLocalStorage() {
  return localStorage.getItem('cryptonomicon-list');
}
