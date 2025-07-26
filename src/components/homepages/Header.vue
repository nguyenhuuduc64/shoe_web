<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <!-- Logo -->
      <RouterLink to="/home" class="navbar-brand">
        <img src="/src/assets/logo.png" alt="Logo" height="40" />
      </RouterLink>

      <!-- Toggle button (hiện ra trên mobile) -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible content -->
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <!-- Menu trái -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink to="/san-pham/new_product" class="nav-link">
              Hàng mới về <span class="badge bg-danger">HOT</span>
            </RouterLink>
          </li>

          <!-- Dropdown GIÀY NAM -->
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              GIÀY NAM
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink to="/san-pham/N01" class="dropdown-item"
                  >Giày thể thao nam</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N02" class="dropdown-item"
                  >Giày tây nam</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N03" class="dropdown-item"
                  >Sandal nam</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N04" class="dropdown-item"
                  >Dép nam</RouterLink
                >
              </li>
            </ul>
          </li>

          <!-- Dropdown GIÀY NỮ -->
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              GIÀY NỮ
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink to="/san-pham/N05" class="dropdown-item"
                  >Giày thể thao nữ</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N06" class="dropdown-item"
                  >Sandal nữ</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N07" class="dropdown-item"
                  >Dép nữ</RouterLink
                >
              </li>
            </ul>
          </li>

          <!-- Dropdown PHỤ KIỆN -->
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              PHỤ KIỆN
            </a>
            <ul class="dropdown-menu">
              <li>
                <RouterLink to="/san-pham/N08" class="dropdown-item"
                  >Balo</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N09" class="dropdown-item"
                  >Tất</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N10" class="dropdown-item"
                  >Lót giày</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N11" class="dropdown-item"
                  >Dây giày</RouterLink
                >
              </li>
              <li>
                <RouterLink to="/san-pham/N12" class="dropdown-item"
                  >Nước vệ sinh giày</RouterLink
                >
              </li>
            </ul>
          </li>
        </ul>

        <!-- Search và Giỏ hàng bên phải -->
        <div class="d-flex align-items-center gap-3">
          <!-- Search -->
          <form class="d-flex flex-grow-1 flex-md-grow-0">
            <input
              class="form-control me-2"
              type="search"
              placeholder="Tìm kiếm..."
              v-model="searchQuery"
              @input="handleSearch"
              @keyup.enter="handleSubmit"
            />
            <button
              class="btn btn-outline-success"
              type="submit"
              @click.prevent="handleSubmit"
            >
              Tìm kiếm
            </button>
          </form>

          <!-- Recommand -->
          <Recommand
            v-if="suggestedProducts.length > 0"
            :products="suggestedProducts"
            @select-product="searchQuery = $event"
          />

          <!-- Cart Icon -->
          <div
            class="position-relative"
            @click="toggleCart"
            style="cursor: pointer"
          >
            <i class="fa-solid fa-cart-shopping fa-lg"></i>
            <span
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            >
              {{ cart.length }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Giỏ hàng -->
  <div v-if="showCart" class="cart-container">
    <div class="cart-header">
      <h3>Giỏ hàng của bạn</h3>
      <button class="close-btn" @click="toggleCart">✖</button>
    </div>

    <div class="cart-item-list">
      <div v-for="(item, index) in cart" :key="index" class="cart-item">
        <img :src="item.img" :alt="item.name" class="cart-img" />
        <div class="cart-details">
          <h4>{{ item.name }}</h4>
          <p>
            Giá: <span class="price">{{ item.price.toLocaleString() }} đ</span>
          </p>
          <p>Size: {{ item.size }}</p>
          <div class="quantity-controls">
            <button @click="decreaseQuantity(index)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="increaseQuantity(index)">+</button>
          </div>
        </div>
        <button class="delete-btn" @click="removeItem(index)">Xóa</button>
      </div>
    </div>

    <div class="cart-footer">
      <p>
        <strong>Tổng:</strong>
        <span class="total-price">{{ totalPrice.toLocaleString() }} đ</span>
      </p>
      <button class="checkout-btn" @click="openCheckoutModal">
        Thanh toán
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import { ref, computed, provide } from "vue";
import Recommand from "./viewhome/recommand.vue";
import { inject } from "vue";
export default {
  setup() {},
  components: {
    Recommand,
  },
  data() {
    return {
      searchQuery: "",
      cart: [],
      suggestedProducts: [],
      searchProducts: [],
      showCart: false, // Mặc định ẩn giỏ hàng,
      showCheckoutModal: false, // Điều khiển hiển thị modal
      order: {
        KH_ma: "",
        KH_hoten: "",
        KH_email: "",
        KH_sdt: "",
        shippingMethod: "Giao hàng tận nơi",
        paymentMethod: "Thanh toán khi nhận hàng",
        KH_addr: "",
        cart: JSON.parse(localStorage.getItem("cart")) || [],
      },
      user: JSON.parse(localStorage.getItem("user")) || {},
    };
  },
  computed: {
    totalPrice() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  mounted() {
    this.loadCart();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  },
  methods: {
    handleSearch() {
      console.log("da handle search", this.searchQuery);

      if (this.searchQuery) {
        axios.get("http://localhost:5000/api/products").then((res) => {
          this.suggestedProducts = res.data.filter((p) =>
            p.SP_ten.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        });
      } else {
        this.$router.push({
          path: "/search",
        });
        this.suggestedProducts = "";
      }
    },
    handleSubmit() {
      console.log("searchQuery:", this.searchQuery); // ✅ dùng this

      if (this.showSearchPage) {
        this.showSearchPage.value = true;
      }

      this.$router.push({
        path: "/search",
        query: { q: this.searchQuery },
      });

      axios.get("http://localhost:5000/api/products").then((res) => {
        this.searchProducts = res.data.filter((p) =>
          p.SP_ten.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    },

    ///////////////////
    openCheckoutModal() {
      const token = localStorage.getItem("token"); // Kiểm tra token đăng nhập
      if (!token) {
        alert("Bạn cần đăng nhập để thanh toán!");
        this.$router.push("/login"); // Chuyển hướng đến trang đăng nhập
        return;
      }

      // Gán thông tin user vào order nếu đã đăng nhập
      this.order.KH_ma = this.user.KH_ma || "";

      this.order.KH_hoten = this.user.KH_hoten || "";
      this.order.KH_email = this.user.KH_email || "";
      this.order.KH_sdt = this.user.KH_sdt || "";
      this.order.KH_addr = this.user.KH_addr || "";
      this.showCheckoutModal = true;
    },
    closeCheckoutModal() {
      this.showCheckoutModal = false;
      this.$router.push("/");
    },
    submitOrder() {
      const user = JSON.parse(localStorage.getItem("user"));
      const KH_ma = user ? user.KH_ma : null;
      // Lấy mã khách hàng từ localStorage
      if (!KH_ma) {
        alert("Bạn cần đăng nhập để đặt hàng!");
        return;
      }

      // Chuẩn bị dữ liệu gửi lên API
      const orderData = {
        KH_ma,
        DH_diachi: this.order.addr,
        DH_thanhtoan: this.order.paymentMethod,
        products: this.order.cart.map((item) => ({
          SP_ma: item.id,
          soluong: item.quantity,
        })),
      };

      // Gửi yêu cầu API để tạo đơn hàng
      axios
        .post("http://localhost:5000/api/create_order", orderData)
        .then((response) => {
          alert(response.data.message);
          this.showCheckoutModal = false; // Đóng modal thanh toán
          this.clearCart(); // Xóa giỏ hàng sau khi đặt hàng thành công
        })
        .catch((error) => {
          alert(error.response.data.error || "Lỗi khi đặt hàng");
        });
    },
    ////////////////////
    loadCart() {
      this.cart = JSON.parse(localStorage.getItem("cart")) || [];
    },
    toggleCart() {
      this.showCart = !this.showCart; // Đảo trạng thái hiển thị
    },
    increaseQuantity(index) {
      if (this.cart[index].quantity < 5) {
        this.cart[index].quantity++;
        this.saveCart();
      }
    },
    decreaseQuantity(index) {
      if (this.cart[index].quantity > 1) {
        this.cart[index].quantity--;
      } else {
        this.cart.splice(index, 1); // Xóa nếu số lượng về 0
      }
      this.saveCart();
    },
    clearCart() {
      this.cart = [];
      this.order.cart = []; // Đảm bảo giỏ hàng trong order cũng bị xóa
      localStorage.removeItem("cart"); // Xóa giỏ hàng trong localStorage
    },

    removeItem(index) {
      this.cart.splice(index, 1);
      this.saveCart();
    },
    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },
  },
};
</script>

<style>
.cart-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -10px;
  background: #de4444;
  color: white;
  font-size: 14px;
  padding: 3px 6px;
  border-radius: 50%;
}

.cart-container {
  position: absolute;
  top: 100px; /* Điều chỉnh khoảng cách dưới icon giỏ hàng */
  right: 10px;
  background: rgb(243, 232, 232);
  width: 400px;
  max-width: 90%;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.cart-item-list {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 10px;
}

.cart-item-list::-webkit-scrollbar {
  width: 6px;
}

.cart-item-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.cart-item-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.cart-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.cart-img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.cart-details {
  flex-grow: 1;
}

.price {
  color: red;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-controls button {
  padding: 3px 7px;
  margin: 0 5px;
  border: none;
  cursor: pointer;
}

.delete-btn {
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.cart-footer {
  margin-top: 10px;
  text-align: right;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: red;
  margin-top: 20px;
}

.checkout-btn {
  background: green;
  color: white;
  padding: 8px 15px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}
.payment-image {
  margin-top: 10px;
  text-align: center;
}

.payment-image img {
  max-width: 100%;
  border-radius: 10px;
}

.mo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.mo-content {
  background: white;
  width: 700px; /* Tăng chiều rộng để đủ không gian */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex; /* Chia thành 2 cột */
  gap: 20px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

/* Cột thông tin */
.info-co {
  width: 55%;
}

/* Cột giỏ hàng */
.cart-co {
  width: 45%;
  border-left: 2px solid #ddd;
  padding-left: 20px;
}

/* Label và input */
.nhan {
  display: block;
  font-weight: bold;
  margin-top: 10px;
}

.in {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Giỏ hàng */
.cart-i {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.cart-i img {
  width: 50px;
  margin-right: 10px;
  border-radius: 5px;
}

/* Nút xác nhận */
.btn-success {
  width: 100%;
  background: red;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 15px;
}

.btn-success:hover {
  background: darkred;
}
</style>
