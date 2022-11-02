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
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="tickerLength"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="item in coinsFiltered"
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
    <base-button
      class="my-4"
      :class="{ 'opacity-60': tickerInclude }"
      :disabled="tickerInclude"
      @click="add"
    >
      <svg
        class="-ml-0.5 mr-2 h-6 w-6"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="#ffffff"
      >
        <path
          d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        />
      </svg>
      Добавить
    </base-button>
  </section>
</template>

<script>
import { getCoinsList } from '@/api';
import BaseButton from './BaseButton';

export default {
  components: {
    BaseButton,
  },

  data() {
    return {
      ticker: '',
      coinsList: {},
    };
  },

  emits: {
    'add-ticker': null,
    'check-include-ticker': null,
  },

  props: {
    tickerInclude: {
      type: Boolean,
      required: true,
      default: false,
    },
  },

  created: function () {
    getCoinsList().then((data) => {
      this.coinsList = data.Data;
    });
  },

  methods: {
    add() {
      if (this.tickerInclude || !this.ticker) return;

      this.$emit('add-ticker', this.ticker);
      this.ticker = '';
    },

    addedTicker(ticker) {
      this.ticker = ticker;
      this.add();
    },
  },
  computed: {
    coinsFilter() {
      return Object.keys(this.coinsList).filter((coin) =>
        coin.toLowerCase().includes(this.ticker.toLowerCase()),
      );
    },

    coinsFiltered() {
      return this.coinsFilter.slice(0, 4);
    },

    tickerLength() {
      return this.ticker.length;
    },
  },
  watch: {
    ticker() {
      this.$emit('check-include-ticker', this.ticker);
    },
  },
};
</script>
