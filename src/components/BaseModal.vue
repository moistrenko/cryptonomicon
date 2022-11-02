<template>
  <div
    v-if="isShowModal"
    class="flex justify-center items-center absolute top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,.4)] cursor-pointer"
    @click.self="$emit('close-modal')"
  >
    <div
      class="modal flex flex-col justify-between relative w-96 h-96 bg-white rounded-xl p-6 cursor-default"
    >
      <div
        class="close absolute top-1 right-2 cursor-pointer"
        @click="$emit('close-modal')"
      >
        X
      </div>
      <h2 class="modal__title text-center text-3xl">{{ title }}</h2>
      <div class="modal__content">
        <slot name="content" />
      </div>
      <div class="modal__btn-group">
        <slot name="btns" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    isShowModal: {
      type: Boolean,
      required: true,
    },
  },

  emits: {
    'close-modal': null,
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
        this.$emit('close-modal');
      }
    },
  },
};
</script>
