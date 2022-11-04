<template>
  <div>
    <div
      class="mx-auto min-h-screen flex flex-col items-center p-4 bg-[url('./bg.jpg')] bg-cover"
    >
      <div class="container">
        <base-add-ticker
          @add-ticker="add"
          @check-include-ticker="checkIncludeTicker"
          :ticker-include="includeTicker"
        />

        <base-button @click="openModal"> Показать модалку </base-button>

        <template v-if="tickers.length">
          <hr class="w-full border-t border-white my-4" />
          <base-filter
            :page="page"
            :has-next-page="hasNextPage"
            @prev-page="page = page - 1"
            @next-page="page = page + 1"
            @filter="filterChange"
          />
          <hr class="w-full border-t border-white my-4" />
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
          <hr class="w-full border-t border-white my-4" />
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
      v-model="modalOpen"
      title="Заголовок"
    >
      <template #actions="{ close }">
        <base-button
          class="!block !mx-auto min-w-[100px]"
          @click="close"
        >
          Отмена
        </base-button>
      </template>
    </base-modal>
  </div>
</template>

<script>
//TODO 4 Повесить модалку на удаление крипты (Скорее всего надо использовать provide/inject)
//TODO 4 После того как модалка будет повешана на удаление крипты, удалить кнопку и импорт компонента
//TODO Возможно сломался грифик
//TODO 2 Вынести логику в api.js
//TODO 2 Установить tailwind и удалить файл tailwind'а
//TODO 1 Сделать кросс-конвертацию подпиской на BTC-USD, если крипта-USD не существует
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  setLocalStorage,
  getLocalStorage,
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
      modalOpen: false,
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
        ticker.ticker.toLowerCase().includes(this.filter.toLowerCase()),
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
    openModal() {
      this.modalOpen = true;
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
