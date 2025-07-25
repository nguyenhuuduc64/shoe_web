<template>
  <div
    class="register-container d-flex justify-content-center align-items-center vh-100 bg-light px-2"
  >
    <div class="register-box card shadow-sm p-4 w-100" style="max-width: 500px">
      <h2 class="text-center mb-4">ĐĂNG KÝ</h2>

      <!-- Fullname -->
      <div class="mb-3 text-start">
        <label for="fullname" class="form-label">Tên đầy đủ</label>
        <input
          type="text"
          id="fullname"
          class="form-control rounded-2 py-2"
          v-model="fullname"
          placeholder="VD: Trịnh Chí Sương"
        />
      </div>

      <!-- Phone -->
      <div class="mb-3 text-start">
        <label for="phone" class="form-label">Số điện thoại</label>
        <input
          type="text"
          id="phone"
          class="form-control rounded-2 py-2"
          v-model="phone"
          placeholder="Số điện thoại"
        />
      </div>

      <!-- Email -->
      <div class="mb-3 text-start">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          class="form-control rounded-2 py-2"
          v-model="email"
          placeholder="Email"
        />
      </div>

      <!-- Address -->
      <div class="mb-3 text-start">
        <label for="address" class="form-label">Địa chỉ</label>
        <input
          type="text"
          id="address"
          class="form-control rounded-2 py-2"
          v-model="address"
          placeholder="Nhập địa chỉ của bạn"
        />
      </div>

      <!-- Username -->
      <div class="mb-3 text-start">
        <label for="username" class="form-label">Tài khoản</label>
        <input
          type="text"
          id="username"
          class="form-control rounded-2 py-2"
          v-model="username"
          placeholder="Tài khoản"
        />
      </div>

      <!-- Password -->
      <div class="mb-3 text-start">
        <label for="password" class="form-label">Mật khẩu</label>
        <input
          type="password"
          id="password"
          class="form-control rounded-2 py-2"
          v-model="password"
          placeholder="Mật khẩu"
        />
      </div>

      <!-- Confirm Password -->
      <div class="mb-3 text-start">
        <label for="confirmPassword" class="form-label"
          >Nhập lại mật khẩu</label
        >
        <input
          type="password"
          id="confirmPassword"
          class="form-control rounded-2 py-2"
          v-model="confirmPassword"
          placeholder="Nhập lại mật khẩu"
        />
      </div>

      <!-- Checkbox -->
      <div class="form-check mb-3 text-start">
        <input
          type="checkbox"
          class="form-check-input"
          id="agree"
          v-model="agree"
        />
        <label class="form-check-label" for="agree">
          Tôi đồng ý với chính sách và điều khoản
        </label>
      </div>

      <!-- Submit button -->
      <button class="btn btn-success w-100 py-2" @click="handleRegister">
        Đăng ký
      </button>

      <p class="text-center mt-3">
        Đã có tài khoản?
        <router-link to="/home/login" class="text-decoration-none fw-bold"
          >Đăng nhập</router-link
        >
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      fullname: "",
      phone: "",
      email: "",
      address: "",
      username: "",
      password: "",
      confirmPassword: "",
      agree: false,
    };
  },
  methods: {
    async handleRegister() {
      if (
        !this.fullname ||
        !this.phone ||
        !this.email ||
        !this.address ||
        !this.username ||
        !this.password ||
        !this.confirmPassword
      ) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      if (this.password !== this.confirmPassword) {
        alert("Mật khẩu nhập lại không khớp!");
        return;
      }
      if (!this.agree) {
        alert("Bạn phải đồng ý với chính sách và điều khoản!");
        return;
      }

      const userData = {
        NV_hoten: this.fullname,
        NV_sdt: this.phone,
        NV_email: this.email,
        NV_addr: this.address,
        TK_username: this.username,
        TK_password: this.password,
      };

      try {
        const response = await axios.post(
          "http://localhost:5000/api/register",
          userData
        );

        alert(response.data.message);
        this.$router.push("/home/login"); // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      } catch (error) {
        alert(
          "Lỗi đăng ký: " + (error.response?.data?.message || error.message)
        );
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 85vh;
  background: #fcf6f4;
}

.register-box {
  background: rgb(244, 243, 243);
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.input-group {
  text-align: left;
  margin-bottom: 10px;
}

.input-group label {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.checkbox-group input {
  margin-right: 5px;
}

.register-btn {
  width: 100%;
  padding: 10px;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 10px;
}

.register-btn:hover {
  background: #a93226;
}

.login-link {
  margin-top: 10px;
  font-size: 14px;
}

.login-link a {
  color: #c0392b;
  font-weight: bold;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
