<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label
          for="wallet"
          class="block text-sm font-medium text-gray-700"
        >
          Тикер
        </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @input="coinsFilter"
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="coinsFiltered.length"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="item in coinsFiltered.slice(0, 4)"
            :key="item"
            @click="addedTicker(item)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ item }}
          </span>
        </div>
        <div
          v-if="tickerInclude"
          class="text-sm text-red-600"
        >
          Такой тикер уже добавлен
        </div>
      </div>
    </div>

    <add-button
      class="my-4"
      @click="add"
    />
  </section>
</template>

<script>
import AddButton from './AddButton';

export default {
  components: {
    AddButton,
  },

  data() {
    return {
      ticker: '',
      coinsFiltered: [],
      tickerInclude: false,
    };
  },

  methods: {
    coinsFilter() {
      this.coinsFiltered = Object.keys(this.coinsList).filter((coin) =>
        coin.toLowerCase().includes(this.ticker.toLowerCase()),
      );

      this.tickerInclude = this.tickers
        .map((item) => item.ticker.toLowerCase())
        .includes(this.ticker.toLowerCase());
    },

    add() {
      if (this.tickerInclude || !this.ticker) {
        return;
      }

      const currentTicker = { ticker: this.ticker, price: '-' };

      // this.tickers = [...this.tickers, currentTicker];

      // this.filter = '';
      this.ticker = '';
      // this.coinsFiltered = [];

      // subscribeToTicker(currentTicker.ticker, (newPrice, status) => {
      //   this.updateTicker(currentTicker.ticker, newPrice, status);
      // });
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
  },
};
</script>
