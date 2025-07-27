<template v-if="showSearchPage">
  <div class="search-page container">
    <h2 class="search-title">Kết quả tìm kiếm cho: "{{ keyword }}"</h2>

    <div v-if="products.length > 0" class="product-grid">
      <div
        v-for="product in products"
        :key="product.SP_ma"
        class="product-card"
        @click="openModal(product)"
      >
        <img :src="product.SP_hinh_anh" :alt="product.SP_ten" />
        <h3>{{ product.SP_ten }}</h3>
        <p>{{ product.SP_price.toLocaleString() }} đ</p>
      </div>
    </div>

    <div v-else class="no-result">
      <p>Không tìm thấy sản phẩm nào phù hợp.</p>
    </div>
  </div>
  <!-- Modal Hiển thị Chi tiết Sản phẩm -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <button class="close-btn" @click="closeModal">✖</button>
      <img :src="selectedProduct.SP_hinh_anh" :alt="selectedProduct.SP_ten" />
      <div class="modal-content">
        <h2>{{ selectedProduct.SP_ten }}</h2>
        <p>
          <strong>Giá:</strong>
          <span style="color: red"
            >{{ selectedProduct.SP_price.toLocaleString() }} đ</span
          >
        </p>
        <p><strong>Tình trạng:</strong> Còn hàng</p>
        <p>
          <strong>Mô tả sản phẩm:</strong> Là sản phẩm thời trang , trẻ trung,
          năng động phù hợp với giới trẻ hiện nay.
        </p>

        <div>
          <p>
            <strong><b>Size:</b></strong>
            <span>{{ selectedProduct.SP_size.toLocaleString() }} </span>
          </p>
          <p>
            <strong><b>Chú ý:</b></strong>
            <span
              >Để xác định size có phù hợp không vui lòng click vào trang
              <router-link to="/home/chonsize"
                ><b>Cách chọn size</b></router-link
              >
            </span>
          </p>
          <label for="quantity">Số lượng:</label>
          <input type="number" v-model="quantity" min="1" max="5" />
        </div>

        <div class="button-group">
          <button @click="buyNow">Mua ngay</button>
          <button @click="addToCart(selectedProduct)">+ Thêm giỏ hàng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { inject } from "vue";

export default {
  inject: ["showSearchPage"], // 👈 inject trực tiếp

  data() {
    return {
      keyword: "",
      products: [],
      showModal: false,
      size: this.selectedSize || "Mặc định",

      selectedProduct: {},
      quantity: 1,
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
    openModal(product) {
      this.selectedProduct = product;
      this.quantity = 1;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    addToCart(product) {
      console.log("Thêm vào giỏ hàng:", product);
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const size = this.selectedSize || "Mặc định";
      const quantityToAdd = this.quantity;

      let existingItem = cart.find(
        (item) => item.id === product.SP_ma && item.size === size
      );

      if (existingItem) {
        if (existingItem.quantity + quantityToAdd > 5) {
          alert("Bạn chỉ có thể mua tối đa 5 sản phẩm cho mỗi kích thước.");
          existingItem.quantity = 5;
        } else {
          existingItem.quantity += quantityToAdd;
        }
      } else {
        cart.push({
          id: product.SP_ma,
          name: product.SP_ten,
          img: product.SP_hinh_anh,
          price: product.SP_price,
          size: size,
          quantity: quantityToAdd,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Đã thêm vào giỏ hàng thành công!");
    },
    buyNow() {
      alert(
        `Bạn đã chọn mua ${this.quantity} sản phẩm "${this.selectedProduct.SP_ten}"`
      );
    },
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
.product-grid {
  display: flex;
  gap: 15px;
  padding: 20px;
  background-color: #f9f9f9;
  overflow-x: auto; /* Thanh cuộn ngang cho khu vực chứa sản phẩm */
  padding-bottom: 10px; /* Thêm một chút không gian dưới cùng */
}

/* Thẻ sản phẩm */
.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  text-align: center;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex: 0 0 250px; /* Mỗi sản phẩm có chiều rộng cố định */
  margin-right: 10px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-card h3 {
  margin: 15px 0;
  font-size: 1.2em;
  color: #333;
}

.product-card p {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.product-card button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.product-card button:hover {
  background-color: #2980b9;
}

/* Tiêu đề chính */
h2 {
  text-align: center;
  font-size: 2em;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-top: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.modal {
  background: white;
  display: flex;
  width: 60%;
  max-width: 900px;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal img {
  width: 300px;
  height: auto;
  border-radius: 5px;
}

.modal-content {
  flex: 1;
  padding-left: 20px;
}

.modal h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.modal p {
  font-size: 14px;
  margin-bottom: 8px;
}

.modal select,
.modal input {
  width: 100px;
  padding: 5px;
  margin-left: 10px;
}

/* Các nút trong modal */
.button-group {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.button-group button {
  background-color: #c00;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
}

.button-group button:hover {
  background-color: #900;
}

/* Nút đóng modal */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #c00;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: white;
}
</style>
