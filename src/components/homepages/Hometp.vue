<template>
  <div class="topbar">
    <div class="container">
      <!-- tp = topbar -->
      <div
        class="tp-wp d-flex flex-wrap justify-content-between align-items-center py-2"
      >
        <div class="tp__left d-flex align-items-center mb-2 mb-md-0">
          <div class="tp__left-hline d-flex align-items-center">
            <i class="fa fa-phone tp__left-icon me-1"></i>
            Hotline:
            <a href="tel:0123456789" class="tp__left-phone ms-1"
              >0123 456 789
            </a>
          </div>
        </div>

        <div
          class="tp__right d-flex flex-column flex-md-row align-items-md-center gap-2"
        >
          <div class="tp__right-nav">
            <ul class="tp__right-menu list-unstyled d-flex gap-3 mb-0">
              <RouterLink to="/home/gioithieu" class="tp__right-item">
                <div class="tp__right-link">Giới thiệu</div>
              </RouterLink>
              <RouterLink to="/home/chonsize" class="tp__right-item">
                <div class="tp__right-link">Cách chọn size</div>
              </RouterLink>
            </ul>
          </div>

          <!-- topbar user -->
          <div class="tp-usr">
            <div class="tp-usr-wp d-flex align-items-center gap-2">
              <span class="tp-usr-icon">
                <i class="fa fa-user"></i>
              </span>

              <div class="tp-usr-acc" v-if="user">
                <!-- Đã đăng nhập -->
                <div
                  class="tp-usr-heading d-flex align-items-center gap-1"
                  @click="toggleDropdown"
                >
                  <h3 class="tp-usr-name mb-0">{{ user.username }}</h3>
                  <i class="fa fa-angle-down"></i>
                </div>

                <div class="tp-usr-ls mt-1" v-if="dropdownOpen">
                  <RouterLink v-if="user.role === 'admin'" to="/admin">
                    <div class="tp-usr-item">Quản lý cửa hàng</div>
                  </RouterLink>
                  <RouterLink to="/account">
                    <div class="tp-usr-item">Tài khoản của tôi</div>
                  </RouterLink>
                  <RouterLink to="/orders" v-if="user.role === 'customer'">
                    <div class="tp-usr-item">Đơn hàng đã đặt</div>
                  </RouterLink>
                  <div class="tp-usr-item tp-usr-item--logout" @click="logout">
                    Đăng xuất
                  </div>
                </div>
              </div>

              <div v-else class="d-flex gap-2 flex-wrap mt-2 mt-md-0">
                <!-- Chưa đăng nhập -->
                <RouterLink to="/home/login" style="display: flex">
                  <button class="btn btn-danger">Đăng nhập</button>
                </RouterLink>
                <RouterLink to="/home/register">
                  <p
                    class="btn"
                    style="
                      margin: 0;
                      border: none;
                      color: white;
                      text-decoration: underline;
                      display: flex;
                    "
                  >
                    Đăng ký
                  </p>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      dropdownOpen: false,
    };
  },
  mounted() {
    this.loadUser();
  },
  methods: {
    // Lấy thông tin user từ localStorage
    loadUser() {
      const userData = localStorage.getItem("user");
      if (userData) {
        this.user = JSON.parse(userData);
      }
    },
    // Toggle dropdown menu
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    // Xử lý đăng nhập (thêm vào trong component đăng nhập)
    handleLogin(response) {
      localStorage.setItem("user", JSON.stringify(response.user)); // Lưu thông tin user vào localStorage
      this.user = response.user; // Cập nhật dữ liệu
      window.location.reload(); // Reload trang để cập nhật giao diện
    },
    // Xử lý đăng xuất
    logout() {
      localStorage.removeItem("user"); // Xóa thông tin user
      this.user = null;
      window.location.reload(); // Reload trang để cập nhật giao diện về trạng thái chưa đăng nhập
    },
  },
};
</script>
