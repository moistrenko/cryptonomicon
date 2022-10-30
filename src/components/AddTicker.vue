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
          v-if="addDisabled"
          class="text-sm text-red-600"
        >
          Такой тикер уже добавлен
        </div>
      </div>
    </div>
    <add-button
      class="my-4"
      :button-disabled="addDisabled"
      @add="add"
    />
  </section>
</template>

<script>
import { getCoinsList } from '@/api';
import AddButton from './AddButton';

export default {
  components: {
    AddButton,
  },

  data() {
    return {
      ticker: '',
      coinsList: {},
    };
  },

  props: {
    tickerInclude: {
      type: Boolean,
      default: false,
    },
    addDisabled: {
      type: Boolean,
      default: true,
    },
  },

  created: function () {
    getCoinsList().then((data) => {
      this.coinsList = data.Data;
    });
  },

  methods: {
    add() {
      if (this.addDisabled || !this.ticker) return;

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
