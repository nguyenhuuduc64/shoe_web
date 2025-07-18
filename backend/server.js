import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

app.use(cors());

app.use(express.json());
app.use("/uploads", express.static("uploads"));
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "shoe_",
  connectTimeout: 10000,
});

db.connect((err) => {
  if (err) {
    console.error(" Lỗi kết nối MySQL:", err);
    return;
  }
  console.log(" Kết nối MySQL thành công");
});

//api thêm kho hàng
app.post("/api/them-kho", (req, res) => {
  const { SP_ma, so_luong } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!SP_ma || so_luong === undefined || so_luong <= 0) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập mã sản phẩm và số lượng hợp lệ!" });
  }

  // Kiểm tra xem sản phẩm có tồn tại trong `san_pham`
  const checkProductQuery = "SELECT * FROM san_pham WHERE SP_ma = ?";

  db.query(checkProductQuery, [SP_ma], (err, results) => {
    if (err) {
      console.error("Lỗi khi kiểm tra sản phẩm:", err);
      return res.status(500).json({ message: "Lỗi khi kiểm tra sản phẩm!" });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Mã sản phẩm không tồn tại trong bảng sản phẩm!" });
    }

    // Kiểm tra xem sản phẩm có trong kho chưa
    const checkStockQuery = "SELECT * FROM kho_san_pham WHERE SP_ma = ?";

    db.query(checkStockQuery, [SP_ma], (err, stockResults) => {
      if (err) {
        console.error("Lỗi khi kiểm tra kho:", err);
        return res.status(500).json({ message: "Lỗi khi kiểm tra kho!" });
      }

      if (stockResults.length > 0) {
        // Nếu sản phẩm đã có trong kho, cập nhật số lượng
        const updateQuery =
          "UPDATE kho_san_pham SET so_luong = so_luong + ? WHERE SP_ma = ?";

        db.query(updateQuery, [so_luong, SP_ma], (err) => {
          if (err) {
            console.error("Lỗi khi cập nhật số lượng kho:", err);
            return res
              .status(500)
              .json({ message: "Lỗi khi cập nhật số lượng kho!" });
          }

          return res
            .status(200)
            .json({ message: "Cập nhật số lượng thành công!", SP_ma });
        });
      } else {
        // Nếu sản phẩm chưa có trong kho, thêm mới
        const insertQuery =
          "INSERT INTO kho_san_pham (SP_ma, so_luong) VALUES (?, ?)";

        db.query(insertQuery, [SP_ma, so_luong], (err) => {
          if (err) {
            console.error("Lỗi khi thêm sản phẩm vào kho:", err);
            return res
              .status(500)
              .json({ message: "Lỗi khi thêm vào kho!", error: err });
          }

          return res
            .status(201)
            .json({ message: "Thêm sản phẩm vào kho thành công!", SP_ma });
        });
      }
    });
  });
});
//them san pham moi
app.post("/api/san_pham", (req, res) => {
  const { SP_ten, SP_price, SP_size, SP_color, SP_hinh_anh, NPS_ma } = req.body;
  console.log(req.body);

  // Kiểm tra dữ liệu đầu vào
  if (!SP_ten || !SP_price || !SP_hinh_anh) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đầy đủ thông tin sản phẩm!" });
  }

  if (SP_price < 0) {
    return res
      .status(400)
      .json({ message: "Giá sản phẩm không được là số âm!" });
  }

  // Kiểm tra trùng tên + size + color
  const checkDuplicateQuery = `
        SELECT * FROM san_pham 
        WHERE SP_ten = ? AND SP_size = ? AND SP_color = ?
    `;
  db.query(checkDuplicateQuery, [SP_ten, SP_size, SP_color], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Lỗi khi kiểm tra trùng sản phẩm!", error: err });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: "Sản phẩm đã tồn tại với cùng tên, kích thước và màu sắc!",
      });
    }

    // Lấy mã sản phẩm lớn nhất hiện tại để tạo mã mới
    const getMaxIdQuery = `SELECT MAX(CAST(SUBSTRING(SP_ma, 3, LENGTH(SP_ma) - 2) AS UNSIGNED)) AS max_id FROM san_pham`;

    db.query(getMaxIdQuery, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Lỗi khi lấy mã sản phẩm!", error: err });
      }

      let newId = 1;
      if (result[0].max_id) {
        newId = result[0].max_id + 1;
      }
      const SP_ma = `SP${newId}`;

      const insertQuery = `
                INSERT INTO san_pham (SP_ma, SP_ten, SP_price, SP_size, SP_color, SP_hinh_anh, NPS_ma)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

      db.query(
        insertQuery,
        [SP_ma, SP_ten, SP_price, SP_size, SP_color, SP_hinh_anh, NPS_ma],
        (err, result) => {
          if (err) {
            console.error("Lỗi khi thêm sản phẩm:", err);
            return res
              .status(500)
              .json({ message: "Lỗi khi thêm sản phẩm!", error: err });
          }

          const insertIntoKhoQuery = `INSERT INTO kho_san_pham (SP_ma, so_luong) VALUES (?, ?)`;
          const defaultQuantity = 0;

          db.query(insertIntoKhoQuery, [SP_ma, defaultQuantity], (err) => {
            if (err) {
              console.error("Lỗi khi thêm vào kho sản phẩm:", err);
              return res.status(500).json({
                message: "Lỗi khi thêm vào kho sản phẩm!",
                error: err,
              });
            }

            res
              .status(201)
              .json({ message: "Thêm sản phẩm thành công!", SP_ma });
          });
        }
      );
    });
  });
});

// lấy chi tiết sản phẩm
app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM san_pham WHERE SP_ma = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json(result[0]);
  });
});
// API cập nhật sản phẩm
app.put("/api/san_pham/:SP_ma", (req, res) => {
  const { SP_ma } = req.params;
  const { SP_ten, SP_price, SP_size, SP_color, NPS_ma, SP_hinh_anh } = req.body;
  if (SP_price < 0) {
    return res
      .status(400)
      .json({ message: "Giá sản phẩm không được là số âm!" });
  }
  const sql = `UPDATE san_pham SET SP_ten=?, SP_price=?, SP_size=?, SP_color=?, NPS_ma=?, SP_hinh_anh=? WHERE SP_ma=?`;
  const values = [
    SP_ten,
    SP_price,
    SP_size,
    SP_color,
    NPS_ma,
    SP_hinh_anh,
    SP_ma,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật sản phẩm:", err);
      return res.status(500).json({ message: "Cập nhật sản phẩm thất bại!" });
    }
    res.json({ message: "Cập nhật sản phẩm thành công!" });
  });
});
//xoa sp
app.delete("/api/san_pham/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID không hợp lệ" });
  }

  const deleteFromSanPham = "DELETE FROM san_pham WHERE SP_ma = ?";

  db.query(deleteFromSanPham, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      return res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  });
});
//tìm kiểm sản phẩmphẩm
app.get("/api/search", (req, res) => {
  const keyword = `%${req.query.q}%`;
  const sql = "SELECT * FROM san_pham WHERE SP_ten LIKE ?";

  db.query(sql, [keyword], (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn" });
    res.json(result);
  });
});

//lấy thông tin sản phẩm theo mã sản phẩm
app.get("/api/sanpham/:SP_ma", (req, res) => {
  const maSanPham = req.params.SP_ma;
  const query = "SELECT * FROM san_pham WHERE SP_ma = ?";

  db.query(query, [maSanPham], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(result[0]);
  });
});
// lấy danh sách sản phẩm
app.get("/api/products", (req, res) => {
  const query = `SELECT * FROM san_pham ORDER BY CAST(SUBSTRING(SP_ma, 3) AS UNSIGNED) DESC`;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn", error: err });
    }
    res.status(200).json(result);
  });
});
//láy danh sách ma sab pham
app.get("/api/danh-sach-san-pham", (req, res) => {
  const query = "SELECT SP_ma FROM san_pham"; // Truy vấn lấy danh sách mã sản phẩm

  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi khi lấy danh sách mã sản phẩm:", err);
      return res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách mã sản phẩm!", error: err });
    }

    // Nếu không có sản phẩm nào
    if (results.length === 0) {
      return res.status(404).json({ message: "Không có sản phẩm nào." });
    }

    // Gửi danh sách mã sản phẩm về client
    res.status(200).json(results);
  });
});

//lấy danh sách sản phẩm theo nhóm sản phẩmphẩm
app.get("/api/sanpham-theo-nhom/:nps_ma", (req, res) => {
  const { nps_ma } = req.params; // Lấy mã nhóm sản phẩm từ URL

  const query = "SELECT * FROM san_pham WHERE NPS_ma = ?";

  db.query(query, [nps_ma], (err, results) => {
    if (err) {
      console.error("Lỗi SQL:", err);
      return res
        .status(500)
        .json({ error: "Lỗi truy vấn", details: err.message });
    }
    res.json(results);
  });
});
//lấy tổng số sản phẩm
app.get("/api/total_products", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM san_pham";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Lỗi lấy tổng số sản phẩm:", err);
      return res.status(500).json({ message: "Lỗi lấy tổng số sản phẩm!" });
    }
    console.log("Kết quả truy vấn:", result); // Debug dữ liệu trả về
    res.json({ total: result[0].total });
  });
});
//lấy tônge số khách hànghàng
app.get("/api/customer", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM khach_hang";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Lỗi lấy tổng số sản phẩm:", err);
      return res.status(500).json({ message: "Lỗi lấy tổng số sản phẩm!" });
    }
    console.log("Kết quả truy vấn:", result); // Debug dữ liệu trả về
    res.json({ total: result[0].total });
  });
});
// lấy danh sách nhân viên
app.get("/api/nv", (req, res) => {
  const query = `select * from nhan_vien`;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ message: "errr" });
    }

    res.status(200).json(result);
  });
});
//them nhom san pham
app.post("/api/nhom-san-pham", (req, res) => {
  const { NPS_ma, NPS_ten } = req.body;

  if (!NPS_ma || !NPS_ten) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  const sql = "INSERT INTO nhom_san_pham (NPS_ma, NPS_ten) VALUES (?, ?)";
  db.query(sql, [NPS_ma, NPS_ten], (err, result) => {
    if (err) {
      console.error("Lỗi thêm nhóm sản phẩm: ", err);
      return res.status(500).json({ message: "Lỗi server!" });
    }
    res
      .status(201)
      .json({ message: "Thêm nhóm sản phẩm thành công!", data: result });
  });
});
// lấy danh sách nhóm sản phẩm
app.get("/api/nhom-sp", (req, res) => {
  const query = `select * from nhom_san_pham`;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ message: "errr" });
    }

    res.status(300).json(result);
  });
});

const generateId = (prefix, table, column, callback) => {
  const query = `SELECT ${column} FROM ${table} ORDER BY ${column} DESC LIMIT 1`;
  db.query(query, (err, result) => {
    if (err) return callback(err, null);

    let newId = prefix + "001";
    if (result.length > 0) {
      let lastId = result[0][column];
      let num = parseInt(lastId.replace(prefix, "")) + 1;
      newId = prefix + num.toString().padStart(3, "0");
    }
    callback(null, newId);
  });
};
// them tai khoan admin tạo tài
app.post("/api/add_account", async (req, res) => {
  const {
    NV_hoten,
    NV_sdt,
    TK_username,
    TK_password,
    NV_email,
    NV_addr,
    TK_role,
  } = req.body;

  console.log("📥 Dữ liệu nhận được từ client:", req.body);

  if (
    !NV_hoten ||
    !NV_sdt ||
    !TK_username ||
    !TK_password ||
    !NV_email ||
    !NV_addr ||
    !TK_role
  ) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  if (TK_role !== "admin" && TK_role !== "customer") {
    return res.status(400).json({ message: "Role không hợp lệ!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(NV_email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(TK_password, 10);
    console.log("🔐 Mật khẩu sau khi hash:", hashedPassword);

    generateId("Id", "tai_khoan", "TK_id", (err, TK_id) => {
      if (err) {
        console.error("❌ Lỗi khi tạo TK_id:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi tạo ID tài khoản", error: err });
      }

      console.log("✅ Mã tài khoản được tạo:", TK_id);

      const prefix = TK_role === "customer" ? "Kh" : "NV";
      const table = TK_role === "customer" ? "khach_hang" : "nhan_vien";
      const column = TK_role === "customer" ? "KH_ma" : "NV_ma";

      generateId(prefix, table, column, (err, user_id) => {
        if (err) {
          console.error("❌ Lỗi khi tạo mã người dùng:", err);
          return res
            .status(500)
            .json({ message: "Lỗi khi tạo ID người dùng", error: err });
        }

        console.log("✅ Mã người dùng được tạo:", user_id);

        const insertUser = `INSERT INTO ${table} (${
          TK_role === "customer"
            ? "KH_ma, KH_hoten, KH_email, KH_addr, KH_sdt"
            : "NV_ma, NV_hoten, NV_email, NV_addr, NV_sdt"
        }) VALUES (?, ?, ?, ?, ?)`;

        const userValues = [user_id, NV_hoten, NV_email, NV_addr, NV_sdt];

        console.log("📄 Câu lệnh thêm người dùng:", insertUser);
        console.log("📦 Dữ liệu thêm người dùng:", userValues);

        db.query(insertUser, userValues, (err) => {
          if (err) {
            console.error(
              "❌ Lỗi khi thêm vào bảng người dùng:",
              err.sqlMessage
            );
            return res.status(500).json({
              message: "Lỗi khi thêm vào bảng người dùng",
              error: err.sqlMessage,
            });
          }

          const insertAccount = `INSERT INTO tai_khoan (TK_id, TK_username, TK_password, TK_role, ${column}) VALUES (?, ?, ?, ?, ?)`;
          const accountValues = [
            TK_id,
            TK_username,
            hashedPassword,
            TK_role,
            user_id,
          ];

          console.log("📄 Câu lệnh thêm tài khoản:", insertAccount);
          console.log("📦 Dữ liệu thêm tài khoản:", accountValues);

          db.query(insertAccount, accountValues, (err) => {
            if (err) {
              console.error(
                "❌ Lỗi khi thêm vào bảng tài khoản:",
                err.sqlMessage
              );
              return res.status(500).json({
                message: "Lỗi khi thêm vào bảng tài khoản",
                error: err.sqlMessage,
              });
            }

            console.log("✅ Tạo tài khoản thành công cho:", TK_username);
            res.json({
              message: "Tạo tài khoản thành công!",
              userId: TK_id,
              roleId: user_id,
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Lỗi server:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
});

//api khach hang đăng ký tài khoảnkhoản
app.post("/api/register", async (req, res) => {
  const { NV_hoten, NV_sdt, TK_username, TK_password, NV_email, NV_addr } =
    req.body;
  console.log("📥 [REGISTER] Dữ liệu nhận được:", req.body);

  // Kiểm tra thông tin đầu vào
  if (
    !NV_hoten ||
    !NV_sdt ||
    !TK_username ||
    !TK_password ||
    !NV_email ||
    !NV_addr
  ) {
    console.warn("⚠️ Thiếu thông tin đầu vào");
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(NV_email)) {
    console.warn("⚠️ Email không hợp lệ:", NV_email);
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    console.log("🔐 Đang mã hóa mật khẩu...");
    const hashedPassword = await bcrypt.hash(TK_password, 10);
    console.log("✅ Mã hóa mật khẩu thành công");

    const TK_role = "customer"; // Role mặc định

    generateId("Id", "tai_khoan", "TK_id", (err, TK_id) => {
      if (err) {
        console.error("❌ Lỗi khi tạo TK_id:", err);
        return res
          .status(500)
          .json({ message: "Lỗi khi tạo ID tài khoản", error: err });
      }

      console.log("🆔 TK_id được tạo:", TK_id);

      generateId("Kh", "khach_hang", "KH_ma", (err, user_id) => {
        if (err) {
          console.error("❌ Lỗi khi tạo user_id:", err);
          return res
            .status(500)
            .json({ message: "Lỗi khi tạo ID khách hàng", error: err });
        }

        console.log("🆔 user_id được tạo:", user_id);

        const insertUser = `INSERT INTO khach_hang (KH_ma, KH_hoten, KH_email, KH_addr, KH_sdt) VALUES (?, ?, ?, ?, ?)`;
        const userValues = [user_id, NV_hoten, NV_email, NV_addr, NV_sdt];
        console.log("📦 Chuẩn bị chèn KH:", userValues);

        db.query(insertUser, userValues, (err) => {
          if (err) {
            console.error("❌ Lỗi khi thêm khách hàng:", err.sqlMessage);
            return res.status(500).json({
              message: "Lỗi khi thêm vào bảng khách hàng",
              error: err.sqlMessage,
            });
          }

          const insertAccount = `INSERT INTO tai_khoan (TK_id, TK_username, TK_password, TK_role, KH_ma) VALUES (?, ?, ?, ?, ?)`;
          const accountValues = [
            TK_id,
            TK_username,
            hashedPassword,
            TK_role,
            user_id,
          ];
          console.log("📦 Chuẩn bị chèn TK:", accountValues);

          db.query(insertAccount, accountValues, (err) => {
            if (err) {
              console.error("❌ Lỗi khi thêm tài khoản:", err.sqlMessage);
              return res.status(500).json({
                message: "Lỗi khi thêm vào bảng tài khoản",
                error: err.sqlMessage,
              });
            }

            console.log("✅ Đăng ký thành công:", TK_id, user_id);
            res.json({
              message: "Đăng ký thành công!",
              userId: TK_id,
              roleId: user_id,
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("❌ Lỗi server ngoài ý muốn:", error);
    res
      .status(500)
      .json({ message: "Lỗi server", error: error.message || error });
  }
});

//xoa tai khoan
app.delete("/api/delete_account/:TK_id", async (req, res) => {
  const { TK_id } = req.params;

  if (!TK_id) {
    return res.status(400).json({ message: "Vui lòng cung cấp TK_id hợp lệ." });
  }

  try {
    // Kiểm tra tài khoản có tồn tại không
    const checkAccountQuery = `SELECT * FROM tai_khoan WHERE TK_id = ?`;
    db.query(checkAccountQuery, [TK_id], (err, results) => {
      if (err)
        return res.status(500).json({
          message: "Lỗi khi kiểm tra tài khoản",
          error: err.sqlMessage,
        });

      if (results.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy tài khoản." });
      }

      const account = results[0];

      // Xóa tài khoản khỏi bảng `tai_khoan` trước
      const deleteAccountQuery = `DELETE FROM tai_khoan WHERE TK_id = ?`;
      db.query(deleteAccountQuery, [TK_id], (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Lỗi khi xóa tài khoản", error: err.sqlMessage });

        // Nếu tài khoản thuộc khách hàng, xóa khỏi bảng `khach_hang`
        if (account.KH_ma) {
          const deleteCustomerQuery = `DELETE FROM khach_hang WHERE KH_ma = ?`;
          db.query(deleteCustomerQuery, [account.KH_ma], (err) => {
            if (err)
              return res.status(500).json({
                message: "Lỗi khi xóa khách hàng",
                error: err.sqlMessage,
              });
            res.json({ message: "Xóa tài khoản khách hàng thành công!" });
          });
        }
        // Nếu tài khoản thuộc nhân viên, xóa khỏi bảng `nhan_vien`
        else if (account.NV_ma) {
          const deleteEmployeeQuery = `DELETE FROM nhan_vien WHERE NV_ma = ?`;
          db.query(deleteEmployeeQuery, [account.NV_ma], (err) => {
            if (err)
              return res.status(500).json({
                message: "Lỗi khi xóa nhân viên",
                error: err.sqlMessage,
              });
            res.json({ message: "Xóa tài khoản nhân viên thành công!" });
          });
        } else {
          res.json({ message: "Xóa tài khoản thành công!" });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

//cập nhật thông tin tài khoảnkhoản
app.put("/api/update_account/:TK_id", async (req, res) => {
  const { TK_id } = req.params;
  const { NV_hoten, NV_sdt, NV_email, NV_addr, TK_role } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!NV_hoten || !NV_sdt || !NV_email || !NV_addr || !TK_role) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  // Kiểm tra role hợp lệ
  if (TK_role !== "admin" && TK_role !== "customer") {
    return res.status(400).json({ message: "Role không hợp lệ!" });
  }

  // Kiểm tra định dạng email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(NV_email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    // Cập nhật thông tin trong bảng nhan_vien hoặc khach_hang
    const updateUserQuery = `
            UPDATE ${TK_role === "customer" ? "khach_hang" : "nhan_vien"}
            SET ${
              TK_role === "customer"
                ? "KH_hoten = ?, KH_email = ?, KH_addr = ?, KH_sdt = ?"
                : "NV_hoten = ?, NV_email = ?, NV_addr = ?, NV_sdt = ?"
            }
            WHERE ${TK_role === "customer" ? "KH_ma" : "NV_ma"} = (
                SELECT ${
                  TK_role === "customer" ? "KH_ma" : "NV_ma"
                } FROM tai_khoan WHERE TK_id = ?
            )
        `;
    const userValues = [NV_hoten, NV_email, NV_addr, NV_sdt, TK_id];

    db.query(updateUserQuery, userValues, (err, result) => {
      if (err)
        return res.status(500).json({
          message: "Lỗi khi cập nhật thông tin người dùng",
          error: err.sqlMessage,
        });

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tài khoản để cập nhật" });
      }

      res.json({ message: "Cập nhật thông tin thành công!" });
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});
//lay danh sach tai khoan và thông tintin
app.get("/api/accounts", async (req, res) => {
  try {
    const sql = `
            SELECT 
                tk.TK_id,
                tk.TK_role,
                tk.TK_username,
                COALESCE(kh.KH_hoten, nv.NV_hoten) AS hoten,
                COALESCE(kh.KH_sdt, nv.NV_sdt) AS sdt,
                COALESCE(kh.KH_email, nv.NV_email) AS email,
                COALESCE(kh.KH_addr, nv.NV_addr) AS addr
            FROM tai_khoan tk
            LEFT JOIN khach_hang kh ON tk.KH_ma = kh.KH_ma
            LEFT JOIN nhan_vien nv ON tk.NV_ma = nv.NV_ma
            ORDER BY tk.TK_role = 'admin' DESC, tk.TK_id ASC
        `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Lỗi truy vấn danh sách tài khoản:", err);
        return res.status(500).json({ message: "Lỗi server!", error: err });
      }

      // Thêm số thứ tự vào danh sách
      const formattedResults = results.map((item, index) => ({
        stt: index + 1,
        ...item,
      }));

      res.json(formattedResults);
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    res.status(500).json({ message: "Lỗi server!", error });
  }
});

//dang nhap
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  const sql = `
    SELECT tk.*, kh.KH_addr, kh.KH_email, kh.KH_hoten, kh.KH_sdt, 
                nv.NV_addr, nv.NV_email, nv.NV_hoten, nv.NV_sdt
    FROM tai_khoan tk
    LEFT JOIN khach_hang kh ON tk.KH_ma = kh.KH_ma
    LEFT JOIN nhan_vien nv ON tk.NV_ma = nv.NV_ma
    WHERE tk.TK_username = ?`;

  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    const user = results[0];

    // So sánh mật khẩu nhập vào với mật khẩu trong database (hashed password)
    const isMatch = await bcrypt.compare(password, user.TK_password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    // Tạo token đăng nhập
    const token = jwt.sign(
      {
        userId: user.TK_id,
        username: user.TK_username,
        role: user.TK_role,
      },
      "SECRET_KEY", // Thay thế bằng secret key thực tế của bạn
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.TK_id,
        username: user.TK_username,
        role: user.TK_role,
        KH_ma: user.KH_ma,
        KH_addr: user.KH_addr || user.NV_addr,
        KH_hoten: user.KH_hoten || user.NV_hoten,
        KH_email: user.KH_email || user.NV_email,
        KH_sdt: user.KH_sdt || user.NV_sdt,
      },
    });
  });
});

// API tạo đơn hàng
// Hàm tạo mã đơn hàng tự động
const generateOrderId = (callback) => {
  db.query("SELECT MAX(DH_ma) AS last_id FROM don_hang", (err, result) => {
    if (err) return callback(err, null);

    let lastId = result[0].last_id;
    let number = lastId ? parseInt(lastId.substring(2)) + 1 : 161001;
    let newOrderId = `DH${number}`;

    callback(null, newOrderId);
  });
};

app.post("/api/create_order", (req, res) => {
  const { KH_ma, products, DH_diachi, DH_thanhtoan } = req.body;

  if (
    !KH_ma ||
    !products ||
    products.length === 0 ||
    !DH_diachi ||
    !DH_thanhtoan
  ) {
    return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
  }

  generateOrderId((err, DH_ma) => {
    if (err) return res.status(500).json({ error: "Lỗi khi tạo mã đơn hàng" });

    const orderDate = new Date();

    // 🔹 Lấy giá sản phẩm từ `san_pham`
    let productIds = products.map((p) => p.SP_ma);
    let sql = `SELECT SP_ma, SP_price FROM san_pham WHERE SP_ma IN (?)`;

    db.query(sql, [productIds], (err, result) => {
      if (err)
        return res.status(500).json({ error: "Lỗi khi lấy giá sản phẩm" });

      let totalPrice = 0;
      let priceMap = {};
      result.forEach((item) => (priceMap[item.SP_ma] = item.SP_price));

      let values = products.map((p) => {
        let price = priceMap[p.SP_ma] || 0;
        let subtotal = (p.soluong || 1) * price;
        totalPrice += subtotal;
        return [DH_ma, p.SP_ma, p.soluong || 1];
      });

      // 🔹 Kiểm tra số lượng sản phẩm trong kho
      let stockQuery = `SELECT SP_ma, so_luong FROM kho_san_pham WHERE SP_ma IN (?)`;
      db.query(stockQuery, [productIds], (err, stockResult) => {
        if (err) return res.status(500).json({ error: "Lỗi khi kiểm tra kho" });

        let insufficientStock = false;
        let outOfStockProduct = null;
        let updatedStockValues = [];

        stockResult.forEach((item) => {
          let orderedProduct = products.find((p) => p.SP_ma === item.SP_ma);
          if (orderedProduct) {
            let stockQuantity = item.so_luong;
            let orderQuantity = orderedProduct.soluong || 1;

            // Kiểm tra sản phẩm trong kho
            if (stockQuantity === 0) {
              outOfStockProduct = orderedProduct.SP_ma;
            }
            if (stockQuantity < orderQuantity) {
              insufficientStock = true;
            } else {
              updatedStockValues.push([
                stockQuantity - orderQuantity,
                item.SP_ma,
              ]);
            }
          }
        });

        if (insufficientStock) {
          return res
            .status(400)
            .json({ error: "Sản phẩm không đủ số lượng trong kho" });
        }

        if (outOfStockProduct) {
          return res
            .status(400)
            .json({ error: `Sản phẩm ${outOfStockProduct} hết hàng` });
        }

        // 🔹 Thêm đơn hàng vào bảng `don_hang`
        db.query(
          "INSERT INTO don_hang (DH_ma, DH_orderdate, DH_totalprice, KH_ma, DH_diachi, DH_thanhtoan) VALUES (?, ?, ?, ?, ?, ?)",
          [DH_ma, orderDate, totalPrice, KH_ma, DH_diachi, DH_thanhtoan],
          (err) => {
            if (err)
              return res.status(500).json({ error: "Lỗi khi tạo đơn hàng" });

            // 🔹 Thêm chi tiết đơn hàng vào `chitiet_hoadon`
            db.query(
              "INSERT INTO chitiet_hoadon (DH_ma, SP_ma, soluong) VALUES ?",
              [values],
              (err) => {
                if (err)
                  return res
                    .status(500)
                    .json({ error: "Lỗi khi thêm sản phẩm" });

                // 🔹 Cập nhật số lượng trong kho
                let updateStockQuery = `UPDATE kho_san_pham SET so_luong = ? WHERE SP_ma = ?`;
                updatedStockValues.forEach(
                  ([newQuantity, productId], index) => {
                    db.query(
                      updateStockQuery,
                      [newQuantity, productId],
                      (err) => {
                        if (err) {
                          console.error("Lỗi cập nhật kho:", err);
                        }
                        // Nếu đã cập nhật tất cả sản phẩm thành công, gửi phản hồi thành công
                        if (index === updatedStockValues.length - 1) {
                          res.status(201).json({
                            message: "Tạo đơn hàng thành công",
                            DH_ma,
                            DH_totalprice: totalPrice,
                            DH_diachi,
                            DH_thanhtoan,
                          });
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});

// lấy lịch sử đơn hàng
app.get("/history/:KH_ma", (req, res) => {
  const { KH_ma } = req.params;

  if (!KH_ma) {
    return res.status(400).json({ message: "Thiếu mã khách hàng" });
  }

  const sql = `
        SELECT dh.DH_ma, dh.DH_orderdate, dh.DH_totalprice, dh.DH_diachi, dh.DH_thanhtoan,dh.DH_trangthai,
               ch.SP_ma, ch.soluong
        FROM don_hang dh
        LEFT JOIN chitiet_hoadon ch ON dh.DH_ma = ch.DH_ma
        WHERE dh.KH_ma = ?
        ORDER BY dh.DH_orderdate DESC
    `;

  db.query(sql, [KH_ma], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng nào" });
    }

    // Kiểm tra dữ liệu trả về từ cơ sở dữ liệu
    console.log("Dữ liệu từ cơ sở dữ liệu:", results);

    // Xử lý dữ liệu để nhóm sản phẩm theo từng đơn hàng
    const orders = {};
    results.forEach((row) => {
      if (!orders[row.DH_ma]) {
        orders[row.DH_ma] = {
          DH_ma: row.DH_ma,
          DH_orderdate: row.DH_orderdate,
          DH_totalprice: row.DH_totalprice,
          DH_diachi: row.DH_diachi,
          DH_thanhtoan: row.DH_thanhtoan,
          DH_trangthai: row.DH_trangthai, // Lấy trạng thái đơn hàng
          chitiet: [],
        };
      }
      if (row.SP_ma) {
        orders[row.DH_ma].chitiet.push({
          SP_ma: row.SP_ma,
          soluong: row.soluong,
        });
      }
    });

    // Kiểm tra dữ liệu sau khi xử lý
    console.log("Dữ liệu orders:", orders);

    // Trả về lịch sử đơn hàng
    res.json({
      message: "Lấy lịch sử đơn hàng thành công",
      orders: Object.values(orders), // Chuyển đổi thành mảng trước khi trả về
    });
  });
});
//cập nhật trạng thái đơn hàng
const validStatuses = [
  "Chưa xử lý",
  "Đã xử lý",
  "Chờ vận chuyển",
  "Đang vận chuyển",
  "Đã giao",
  "Đã đóng hàng",
  "Chờ nhận hàng",
];

app.put("/api/orders/update-status", (req, res) => {
  const { orderId, newStatus } = req.body;

  if (!orderId || !newStatus) {
    return res.status(400).json({ message: "Missing orderId or newStatus" });
  }

  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const query = "UPDATE don_hang SET DH_trangthai = ? WHERE DH_ma = ?";
  db.query(query, [newStatus, orderId], (err, result) => {
    if (err) {
      console.error("SQL Error:", err.sqlMessage);
      return res
        .status(500)
        .json({ message: "Database error", error: err.sqlMessage });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      orderId,
      newStatus,
    });
  });
});
// lấy trạng thái đơn hàng
app.get("/order-status/:id", (req, res) => {
  const orderId = req.params.id;

  const query = "SELECT DH_trangthai FROM don_hang WHERE DH_ma = ?";
  db.query(query, [orderId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res
        .status(500)
        .json({ error: "Database query error", details: error });
    }
    if (results.length > 0) {
      return res.json({ status: results[0].DH_trangthai });
    } else {
      return res.status(404).json({ error: "Order not found" });
    }
  });
});

//cap nhat thong tin tu trang chu
app.put("/api/update_accountss/:TK_id", async (req, res) => {
  const { TK_id } = req.params;
  const { TK_password, NV_hoten, NV_sdt, NV_email, NV_addr } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!NV_hoten || !NV_sdt || !NV_email || !NV_addr) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  // Kiểm tra định dạng email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(NV_email)) {
    return res.status(400).json({ message: "Email không hợp lệ!" });
  }

  try {
    // Kiểm tra role của tài khoản từ bảng `tai_khoan`
    const checkRoleQuery = `SELECT TK_role, NV_ma, KH_ma FROM tai_khoan WHERE TK_id = ?`;
    db.query(checkRoleQuery, [TK_id], async (err, results) => {
      if (err)
        return res.status(500).json({
          message: "Lỗi khi kiểm tra tài khoản",
          error: err.sqlMessage,
        });

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy tài khoản để cập nhật" });
      }

      const { TK_role, NV_ma, KH_ma } = results[0];
      const userId = TK_role === "customer" ? KH_ma : NV_ma;

      // Cập nhật bảng khách_hang hoặc nhân_viên
      const updateUserQuery = `
                UPDATE ${TK_role === "customer" ? "khach_hang" : "nhan_vien"}
                SET ${
                  TK_role === "customer"
                    ? "KH_hoten = ?, KH_email = ?, KH_addr = ?, KH_sdt = ?"
                    : "NV_hoten = ?, NV_email = ?, NV_addr = ?, NV_sdt = ?"
                }
                WHERE ${TK_role === "customer" ? "KH_ma" : "NV_ma"} = ?
            `;
      const userValues = [NV_hoten, NV_email, NV_addr, NV_sdt, userId];

      db.query(updateUserQuery, userValues, async (err) => {
        if (err)
          return res.status(500).json({
            message: "Lỗi khi cập nhật thông tin người dùng",
            error: err.sqlMessage,
          });

        // Nếu có cập nhật mật khẩu, mã hóa rồi lưu
        if (TK_password) {
          const hashedPassword = await bcrypt.hash(TK_password, 10);
          const updatePasswordQuery = `UPDATE tai_khoan SET TK_password = ? WHERE TK_id = ?`;
          db.query(updatePasswordQuery, [hashedPassword, TK_id], (err) => {
            if (err)
              return res.status(500).json({
                message: "Lỗi khi cập nhật mật khẩu",
                error: err.sqlMessage,
              });
          });
        }

        res.json({ message: "Cập nhật thông tin thành công!" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
});

// tính tổng danh thu
app.get("/api/total_revenue", (req, res) => {
  const query = "SELECT SUM(DH_totalprice) AS totalRevenue FROM don_hang";

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi server", error: err });
    }
    res.json({ totalRevenue: result[0].totalRevenue || 0 });
  });
});
//
//laya thông tin đơn hàng, tên kháchkhách
app.get("/api/orders", (req, res) => {
  const sql = `
        SELECT 
            don_hang.DH_ma, 
            khach_hang.KH_hoten, 
            khach_hang.KH_sdt, 
            don_hang.DH_orderdate, 
            don_hang.DH_diachi,
            san_pham.SP_ma,
            san_pham.SP_ten,
            chitiet_hoadon.soluong
        FROM don_hang 
        JOIN khach_hang ON don_hang.KH_ma = khach_hang.KH_ma
        JOIN chitiet_hoadon ON don_hang.DH_ma = chitiet_hoadon.DH_ma
        JOIN san_pham ON chitiet_hoadon.SP_ma = san_pham.SP_ma
        ORDER BY don_hang.DH_orderdate DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi lấy danh sách đơn hàng" });
    }

    // Nhóm sản phẩm theo từng đơn hàng
    let orders = {};
    results.forEach((row) => {
      if (!orders[row.DH_ma]) {
        orders[row.DH_ma] = {
          DH_ma: row.DH_ma,
          KH_hoten: row.KH_hoten,
          KH_sdt: row.KH_sdt,
          DH_orderdate: row.DH_orderdate,
          DH_diachi: row.DH_diachi,
          products: [],
        };
      }
      orders[row.DH_ma].products.push({
        SP_ma: row.SP_ma,
        SP_ten: row.SP_ten,
        soluong: row.soluong,
      });
    });

    res.json(Object.values(orders));
  });
});

// lấy sản phẩm bán chạy nhất
app.get("/api/top-selling", (req, res) => {
  const sql = `
    SELECT 
      sp.SP_ma, 
      sp.SP_ten, 
      sp.SP_price, 
      sp.SP_hinh_anh, 
      sp.SP_size, 
      sp.SP_color,
      sp.NPS_ma,
      SUM(cthd.soluong) AS total_sold
    FROM chitiet_hoadon cthd
    JOIN san_pham sp ON cthd.SP_ma = sp.SP_ma
    GROUP BY sp.SP_ma
    ORDER BY total_sold DESC
    LIMIT 12;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Lỗi lấy sản phẩm bán chạy", error: err });
    }
    res.json(results);
  });
});

//lấy thông tin 12 sản phẩm vừa được thêm
app.get("/api/latest-products", (req, res) => {
  const sql = `
    SELECT * 
    FROM san_pham 
    ORDER BY SP_ma DESC 
    LIMIT 12;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Lỗi lấy sản phẩm mới nhất", error: err });
    }
    res.json(results);
  });
});
// API lấy danh sách 10 sản phẩm được thêm vào sớm nhất và có ít lượt mua nhất
app.get("/api/products/least-sold-oldest", (req, res) => {
  const query = `
    SELECT sp.SP_ma, sp.SP_ten, sp.SP_price, COALESCE(SUM(cthd.soluong), 0) AS total_sold
    FROM san_pham sp
    LEFT JOIN chitiet_hoadon cthd ON sp.SP_ma = cthd.SP_ma
    GROUP BY sp.SP_ma
    ORDER BY total_sold ASC, sp.SP_ma ASC
    LIMIT 10;
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi truy vấn", error: err });
    }
    res.status(200).json(result);
  });
});

////////////////////////////////////////
//thôngs kê
app.get("/api/orders/summary", (req, res) => {
  const sql = `
        SELECT 
            sp.SP_ma,
            sp.SP_ten,
            sp.SP_hinh_anh,
            IFNULL(SUM(cthd.soluong), 0) AS tong_soluong,
            IFNULL(SUM(cthd.soluong * sp.SP_price), 0) AS tong_tien,
            GROUP_CONCAT(DISTINCT dh.DH_ma ORDER BY dh.DH_orderdate ASC SEPARATOR ', ') AS danh_sach_don_hang,
            GROUP_CONCAT(DISTINCT DATE_FORMAT(dh.DH_orderdate, '%d/%m/%Y') ORDER BY dh.DH_orderdate ASC SEPARATOR ', ') AS danh_sach_ngay_mua,
            ks.so_luong AS so_luong_ton_kho
        FROM san_pham sp
        LEFT JOIN chitiet_hoadon cthd ON sp.SP_ma = cthd.SP_ma
        LEFT JOIN don_hang dh ON cthd.DH_ma = dh.DH_ma
        LEFT JOIN kho_san_pham ks ON sp.SP_ma = ks.SP_ma
        GROUP BY sp.SP_ma, sp.SP_ten, sp.SP_hinh_anh, ks.so_luong
        ORDER BY sp.SP_ten;
    `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// lấy số luognjw đơn hàng
app.get("/api/orders/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS total FROM don_hang";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ total_orders: result[0].total });
  });
});

////////////////////////////////////////

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
