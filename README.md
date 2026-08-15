# 🌸 Aesthetic Focus To-Do & Companion Mascot

Ứng dụng quản lý công việc (To-Do List) cá nhân hóa với giao diện Kính mờ (Glassmorphism), bộ tùy biến hình nền tự do (hỗ trợ upload ảnh/GIF từ máy tính), nhân vật đồng hành chúc mừng khi hoàn thành việc và hỗ trợ cài đặt chuẩn **PWA (Progressive Web App)** chạy $100\%$ Offline trên cả **Máy tính (Windows/Mac)** và **Điện thoại (iOS/Android)**.

---

## ✨ Tính Năng Nổi Bật

- 🎨 **Giao diện Glassmorphism cao cấp**: Thẻ công việc kính mờ ảo diệu, tự điều chỉnh độ tối nền và độ mờ hậu cảnh để chữ luôn rõ nét.
- 🖼️ **Tùy biến hình nền tự do**:
  - Chọn các bộ preset gradient/anime có sẵn (*Ghibli Forest, Cozy Sunset, Pastel Sky, Neon City, Lavender Chill, Emerald Aurora*).
  - Tải lên trực tiếp bất kỳ ảnh tĩnh (PNG/JPG) hay ảnh động (GIF) từ thiết bị cá nhân.
- 💖 **Bạn đồng hành chúc mừng (Companion Mascot)**:
  - Tự tải lên Avatar/GIF nhân vật của riêng bạn (Anime, Chibi, Meme, Thú cưng...).
  - Tự soạn danh sách câu khen ngợi ngẫu nhiên.
  - Khi tick xong 1 việc: Nhân vật nhảy ra ở góc màn hình + pháo hoa Confetti + âm thanh Ting Ting vui tai.
- 🎯 **Quản lý công việc tinh gọn**: Mức ưu tiên (🔥 Gấp, ⭐ Thường, 🌿 Thư thả), hạn chót, bộ lọc thông minh và thanh tiến độ trong ngày.
- 💻 **Chuẩn Desktop & Mobile PWA**: Cài đặt thành app độc lập trên thanh Taskbar Windows hoặc Màn hình chính điện thoại, chạy $100\%$ Offline không cần internet.
- 🔒 **Bảo mật & Không tốn phí**: Lưu trữ toàn bộ dữ liệu trên thiết bị người dùng qua `IndexedDB` & `LocalStorage`, chi phí duy trì $0$đ.

---

## 🚀 Hướng Dẫn Sử Dụng Nhanh

### 1. Dùng Trực Tiếp Trên Web
Truy cập link GitHub Pages chính thức (hoặc mở file `index.html` trong bất kỳ trình duyệt nào).

### 2. Cài Đặt Làm App Máy Tính (PC / Laptop)
1. Mở ứng dụng trên trình duyệt **Google Chrome** hoặc **Microsoft Edge**.
2. Nhìn lên góc phải thanh địa chỉ URL, bấm vào biểu tượng **"Cài đặt ứng dụng / Install App 💻"** (hoặc bấm nút **"Cài App"** trên thanh header).
3. Chọn **Install** để ghim app vào Desktop & Taskbar Windows.

### 3. Cài Đặt Trên Điện Thoại (iOS Safari / Android Chrome)
- **iPhone (Safari)**: Bấm nút **Chia sẻ `[ ↑ ]`** ➔ Chọn **"Thêm vào MH chính" (Add to Home Screen)**.
- **Android (Chrome)**: Bấm dấu **3 chấm `[ ⋮ ]`** ➔ Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: HTML5 Semantic, Vanilla CSS (Glassmorphism Design Tokens), Pure Vanilla JavaScript (ES6+).
- **Audio Synth**: Web Audio API (tổng hợp âm thanh du dương không phụ thuộc file MP3 ngoài).
- **Storage**: IndexedDB (lưu trữ ảnh nền & avatar dung lượng lớn) + LocalStorage (lưu tasks & cài đặt).
- **PWA Engine**: Service Worker Cache API & Web App Manifest.
