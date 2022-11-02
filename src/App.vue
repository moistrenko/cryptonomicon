<template>
  <div id="app">
    <div
      class="container mx-auto min-h-screen flex flex-col items-center bg-gray-100 p-4"
    >
      <div class="container">
        <base-add-ticker
          @add-ticker="add"
          @check-include-ticker="checkIncludeTicker"
          :ticker-include="includeTicker"
        />
        <base-button @click="isShowModal = !isShowModal">
          Показать модалку
        </base-button>
        <template v-if="tickers.length">
          <hr class="w-full border-t border-gray-600 my-4" />
          <base-filter
            :page="page"
            :has-next-page="hasNextPage"
            @prev-page="page = page - 1"
            @next-page="page = page + 1"
            @filter="filterChange"
          />
          <hr class="w-full border-t border-gray-600 my-4" />
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <base-ticker
              v-for="t in paginatedTickers"
              :key="t.ticker"
              @select-graph="select(t)"
              @remove="remove"
              :ticker="t"
              :class="{
                'border-4': selectedTicker === t,
                '!bg-red-800': t.status === 'error',
              }"
            />
          </dl>
          <hr class="w-full border-t border-gray-600 my-4" />
        </template>
        <base-graph-ticker
          v-if="selectedTicker"
          :selected-ticker="selectedTicker"
          :graph="graph"
          @clear-selected-ticker="clearSelectedTicker"
        />
      </div>
    </div>
    <base-modal
      :is-show-modal="isShowModal"
      title="Заголовок"
      @close-modal="isShowModal = !isShowModal"
    >
      <template #content>
        <p class="text-center">Данная модалка представляется из себя модалку</p>
      </template>
      <template #btns>
        <base-button
          class="!block !mx-auto"
          @click="sendMessageModal"
        >
          OK
        </base-button>
      </template>
    </base-modal>
  </div>
</template>

<script>
//TODO 5 Поправить модалку аналогично видео
//TODO 3 Переверстать сайт
//TODO 2 Вынести логику в api.js
//TODO 2 Повесить модалку на удаление крипты
//TODO 1 Сделать кросс-конвертацию подпиской на BTC-USD
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  setLocalStorage,
  getLocalStorage,
  sendMessage,
} from './api';

import {
  BaseAddTicker,
  BaseGraphTicker,
  BaseTicker,
  BaseFilter,
  BaseModal,
  BaseButton,
} from './components/index.js';

export default {
  name: 'App',

  components: {
    BaseAddTicker,
    BaseGraphTicker,
    BaseTicker,
    BaseFilter,
    BaseModal,
    BaseButton,
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      includeTicker: false,
      page: 1,
      filter: '',
      isShowModal: false,
    };
  },

  created: function () {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries(),
    );

    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = Number(windowData.page);
    }

    const tickersData = getLocalStorage();

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach((ticker) => {
        subscribeToTicker(ticker.ticker, (newPrice, status) => {
          this.updateTicker(ticker.ticker, newPrice, status);
        });
      });
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter((ticker) =>
        ticker.ticker.includes(this.filter),
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      };
    },
  },

  methods: {
    sendMessageModal() {
      sendMessage();
      this.isShowModal = !this.isShowModal;
    },
    filterChange(value) {
      this.filter = value;
    },

    updateTicker(tickerName, price, status) {
      this.tickers
        .filter((t) => t.ticker === tickerName)
        .forEach((t) => {
          if (t === this.selectedTicker) {
            this.graph.push(price);
          }

          t.price = price;
          t.status = status;
        });
    },

    clearSelectedTicker() {
      this.graph = null;
      this.selectedTicker = null;
    },

    add(ticker) {
      const currentTicker = { ticker: ticker, price: '-' };

      this.tickers = [...this.tickers, currentTicker];

      this.filter = '';

      subscribeToTicker(currentTicker.ticker, (newPrice, status) => {
        this.updateTicker(currentTicker.ticker, newPrice, status);
      });
    },

    checkIncludeTicker(ticker) {
      this.includeTicker = this.tickers
        .map((item) => item.ticker.toLowerCase())
        .includes(ticker.toLowerCase());
    },

    remove(tickerToRemove) {
      this.tickers = this.tickers.filter(
        (item) => item.ticker !== tickerToRemove,
      );

      if (
        this.selectedTicker &&
        this.selectedTicker.ticker === tickerToRemove
      ) {
        this.selectedTicker = null;
      }
      unsubscribeFromTicker(tickerToRemove);
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },
  },

  watch: {
    tickers: {
      deep: true,
      handler() {
        setLocalStorage(this.tickers);
      },
    },

    selectedTicker() {
      this.graph = [];
    },

    paginatedTickers() {
      if (this.paginatedTickers === 0 && this.paginatedTickers > 1) {
        this.page -= 1;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(value) {
      history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`,
      );
    },
  },
};
</script>
