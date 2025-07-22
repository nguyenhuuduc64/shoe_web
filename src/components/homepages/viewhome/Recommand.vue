<template>
  <div class="wrapper">
    <h3>Sản phẩm gợi ý cho: "{{ keyword }}"</h3>
    <ul>
      <li
        v-for="product in products.slice(0, 10)"
        :key="product.id"
        @click="$emit('select', product)"
      >
        <img :src="product.SP_hinh_anh" class="product_img" />
        {{ product.SP_ten }}
      </li>
    </ul>
  </div>
</template>
<style scoped>
.wrapper {
  position: absolute;
  top: 100px;
  background-color: white;
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
