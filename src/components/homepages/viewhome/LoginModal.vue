<template>
  <div
    class="login-page d-flex justify-content-center align-items-center vh-100 bg-light px-2"
  >
    <div class="login-box card shadow-sm p-4 w-100" style="max-width: 400px">
      <h2 class="text-center mb-4">ĐĂNG NHẬP</h2>

      <div class="mb-3">
        <label for="username" class="form-label">Tài khoản</label>
        <input
          type="text"
          id="username"
          v-model="username"
          placeholder="Nhập tài khoản..."
          class="form-control"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Mật khẩu</label>
        <div class="input-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            id="password"
            v-model="password"
            placeholder="Nhập mật khẩu..."
            class="form-control"
          />
          <span
            class="input-group-text"
            style="cursor: pointer"
            @click="togglePassword"
          >
            <i class="fa" :class="showPassword ? 'fa-eye' : 'fa-eye-slash'"></i>
          </span>
        </div>
      </div>

      <div
        class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3"
      >
        <button class="btn btn-danger w-100" @click="handleLogin">
          Đăng nhập
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      password: "",
      showPassword: false,
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      if (!this.username || !this.password) {
        alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/login", {
          username: this.username,
          password: this.password,
        });

        // Lưu token vào localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        alert("Đăng nhập thành công!");
        // window.location.reload(); // Reload trang để cập nhật giao diện
        //this.$router.push("/home");
        this.$router.push("/home").then(() => {
          // ✅ Reload lại toàn bộ trang sau khi điều hướng xong
          window.location.reload();
        });
      } catch (error) {
        alert(
          "Lỗi đăng nhập: " + (error.response?.data?.message || error.message)
        );
      }
    },
  },
};
</script>

<style scoped>
/* Trang nền căn giữa */
.login-page {
  background-color: #f8f9fa;
}

/* Khung đăng nhập */
.login-box {
  background: #ffffff;
  border-radius: 10px;
}

/* Tiêu đề */
.login-box h2 {
  font-weight: bold;
  font-size: 24px;
}

/* Icon mắt mật khẩu */
.input-group-text {
  background-color: #fff;
  border-left: 0;
}

.input-group .form-control {
  border-right: 0;
}

/* Nút đăng nhập */
.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

/* Nút đăng ký */
.btn-outline-primary {
  border-color: #007bff;
  color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  color: #fff;
}

/* Responsive chỉnh khoảng cách nút */
@media (max-width: 768px) {
  .login-box .btn {
    font-size: 16px;
  }
}
</style>
