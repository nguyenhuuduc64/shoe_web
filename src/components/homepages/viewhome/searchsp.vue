<template v-if="showSearchPage">
  <div class="search-page container">
    <h2 class="search-title">Kết quả tìm kiếm cho: "{{ keyword }}"</h2>

    <div v-if="products.length > 0" class="product-grid">
      <div
        v-for="product in products"
        :key="product.SP_ma"
        class="product-card"
      >
        <img
          :src="product.SP_hinh_anh"
          :alt="product.SP_ten"
          class="product-img"
        />
        <h3 class="product-name">{{ product.SP_ten }}</h3>
        <p class="product-price">{{ product.SP_price.toLocaleString() }} đ</p>
        <router-link :to="`/san-pham/${product.NPS_ma}`" class="view-detail"
          >Xem chi tiết</router-link
        >
      </div>
    </div>

    <div v-else class="no-result">
      <p>Không tìm thấy sản phẩm nào phù hợp.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getCurrentInstance } from "vue";

export default {
  // Inject thủ công để có thể truy cập trong `this`
  beforeCreate() {
    const internalInstance = getCurrentInstance();
    this.showSearchPage = internalInstance.appContext.provides.showSearchPage;
  },

  data() {
    return {
      keyword: "",
      products: [],
    };
  },

  created() {
    this.keyword = this.$route.query.q || "";
    console.log("Injected showSearchPage:", this.showSearchPage);

    if (this.showSearchPage?.value) {
      console.log("✅ showSearchPage = true, gọi fetchSearchResults");
      this.fetchSearchResults();
    }
  },
  watch: {
    "$route.query.q": function (newQuery) {
      this.keyword = newQuery || "";
      this.fetchSearchResults();
    },
  },
  methods: {
    fetchSearchResults() {
      if (!this.keyword.trim()) return;

      axios
        .get(`http://localhost:5000/api/products`)
        .then((res) => {
          this.products = res.data.filter((product) =>
            product.SP_ten.toLowerCase().includes(this.keyword.toLowerCase())
          );
        })
        .catch(() => {
          this.products = [];
        });
    },
  },
};
</script>

<style scoped>
.search-page {
  padding: 2rem 0;
}
.search-title {
  font-size: 24px;
  margin-bottom: 1rem;
}
.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.product-card {
  width: 200px;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}
.product-img {
  width: 100%;
  height: auto;
}
.product-name {
  margin-top: 0.5rem;
  font-weight: bold;
}
.product-price {
  color: red;
  margin: 0.5rem 0;
}
.view-detail {
  display: inline-block;
  margin-top: 0.5rem;
  background-color: #007bff;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  text-decoration: none;
}
.no-result {
  font-style: italic;
  color: gray;
}
</style>
