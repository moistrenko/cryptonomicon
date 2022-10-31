<template>
  <div>
    <base-button
      v-if="page > 1"
      @click="$emit('prev-page')"
    >
      Назад
    </base-button>
    <base-button
      v-if="hasNextPage"
      @click="$emit('next-page')"
    >
      Вперед
    </base-button>
    <div>
      <input @keyup="changeFilter" />
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
      required: true,
      default: 0,
    },
    hasNextPage: {
      type: Boolean,
      required: true,
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
