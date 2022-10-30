<template>
  <div>
    <base-button
      v-if="page > 1"
      text="Назад"
      @click="$emit('prev-page')"
    />
    <base-button
      v-if="hasNextPage"
      text="Вперед"
      @click="$emit('next-page')"
    />
    <div>
      <input
        :bind="filter"
        @keyup="changeFilter"
      />
    </div>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue';

export default {
  components: {
    BaseButton,
  },

  props: {
    page: {
      type: Number,
      default: 0,
    },
    filter: {
      type: String,
      default: '',
    },
    hasNextPage: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    changeFilter(event) {
      this.$emit('filter', event.target.value);
    },
  },
};
</script>
