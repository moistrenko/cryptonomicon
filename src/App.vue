<template>
  <div id="app">
    <div
      class="container mx-auto min-h-screen flex flex-col items-center bg-gray-100 p-4"
    >
      <div class="container">
        <add-ticker
          @add-ticker="add"
          @check-include-ticker="checkIncludeTicker"
          :add-disabled="includeTicker"
        />
        <template v-if="tickers.length">
          <hr class="w-full border-t border-gray-600 my-4" />
          <div>
            <button
              v-if="page > 1"
              class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              @click="page = page - 1"
            >
              Назад
            </button>
            <button
              v-if="hasNextPage"
              class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              @click="page = page + 1"
            >
              Вперед
            </button>
            <div>
              <input v-model="filter" />
            </div>
          </div>
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
                'bg-red-800': t.status === 'error',
              }"
            />
          </dl>
          <hr class="w-full border-t border-gray-600 my-4" />
        </template>
        <graph-ticker
          v-if="selectedTicker"
          :selected-ticker="selectedTicker"
          :graph="graph"
          @clear-selected-ticker="clearSelectedTicker"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from './api';
import AddTicker from './components/AddTicker.vue';
import GraphTicker from './components/GraphTicker.vue';
import BaseTicker from './components/BaseTicker.vue';

export default {
  name: 'App',

  components: {
    AddTicker,
    GraphTicker,
    BaseTicker,
  },

  data() {
    return {
      tickers: [],
      selectedTicker: null,
      graph: [],
      includeTicker: false,
      page: 1,
      filter: '',
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
      this.page = windowData.page;
    }

    const tickersData = localStorage.getItem('cryptonomicon-list');

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
    tickers() {
      localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers));
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
