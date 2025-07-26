<template>
  <div
    class="wrapper"
    style="position: absolute; top: 60px; right: 40px; width: 200px"
  >
    <ul>
      <li
        v-for="product in products.slice(0, 10)"
        :key="product.id"
        @click="$emit('select', product)"
      >
        {{ product.SP_ten }}
      </li>
    </ul>
  </div>
</template>
<style scoped>
.wrapper {
  position: absolute;
  top: 80px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
}
.product_img {
  width: 30px;
  height: 30px;
}
</style>
<script>
export default {
  props: {
    products: {
      type: Array,
      required: true,
    },
    keyword: {
      type: String,
      required: false,
    },
  },
};
</script>
