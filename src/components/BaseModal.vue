<template>
  <div
    v-if="modelValue"
    class="flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,.4)] cursor-pointer"
    @click.self="close"
  >
    <div
      class="modal flex flex-col justify-between relative w-96 h-96 bg-white rounded-xl p-6 cursor-default"
    >
      <div
        class="close absolute top-1 right-2 cursor-pointer"
        @click="close"
      >
        X
      </div>
      <h2 class="modal__title text-center text-3xl">{{ title }}</h2>
      <div class="modal__content">
        <slot>
          <p class="text-center">
            Данная модалка представляется из себя модалку
          </p>
        </slot>
      </div>
      <div class="modal__btn-group flex justify-between">
        <slot
          name="actions"
          :close="close"
          :send="send"
        >
          <base-button
            class="!block !mx-auto min-w-[100px]"
            @click="send"
          >
            OK
          </base-button>
          <base-button
            class="!block !mx-auto min-w-[100px]"
            @click="close"
          >
            Отмена
          </base-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import BaseButton from './BaseButton';
import { sendMessageApi } from '../api';

export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  components: {
    BaseButton,
  },

  mounted() {
    document.addEventListener('keyup', this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('keyup', this.handleKeydown);
  },

  methods: {
    handleKeydown(e) {
      if (this.isShowModal && e.key == 'Escape') {
        this.$emit('update:model-value', false);
      }
    },

    close() {
      this.$emit('update:model-value', false);
    },

    openModal() {
      this.$emit('update:model-value', true);
    },

    send() {
      sendMessageApi();
      this.close();
    },
  },
};
</script>
