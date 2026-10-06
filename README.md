# Bé Học Tiếng Việt & Toán Tiền Tiểu Học (Lớp 1) 🎒📚

Hệ sinh thái học liệu số hóa và ứng dụng tương tác hỗ trợ học sinh chuẩn bị vào lớp 1 và phụ huynh đồng hành tại nhà, bám sát bộ 80 thẻ học quy chuẩn.

---

## 🌟 Tổng Quan Dự Án & Mục Tiêu

Dự án ra đời nhằm giải quyết 4 bài toán cốt lõi của phụ huynh có con vào lớp 1:
1. **Kiểm tra chữ viết đúng hay sai:** Hướng dẫn phụ huynh nhận biết lỗi sai (độ cao, độ rộng, nét khuyết, nét móc) và định hướng ứng dụng AI / Computer Vision nhận diện lỗi nét chữ viết tay qua ảnh chụp bằng Bounding Box.
2. **Bài tập bổ trợ Đọc & Viết:** Bám sát lộ trình từng thẻ học (từ nét cơ bản, âm, vần, ghép tiếng đến câu ứng dụng).
3. **Chuẩn hóa phát âm & Khẩu hình miệng:** Hướng dẫn vị trí đặt môi, răng, lưỡi và luồng hơi; kèm gương soi camera (split-screen) và ghi âm đối chiếu.
4. **Nhận diện số, tập đếm & Tách - Gộp số (Module 4 - Thẻ 71 đến 80):** Giúp trẻ nắm vững bản chất số lượng, tập viết số và thành thạo bảng tách gộp số (nền tảng của phép cộng trừ lớp 1).

---

## 🚀 Tính Năng Nổi Bật (Module 4: Chữ Số 1 – 10)

* 🏷️ **Thẻ Học Số (Flashcard 3D):** Xem thẻ 2 mặt độ phân giải cao; 100% độc lập, đã xóa sạch mã QR và watermark bên thứ 3.
* 🎙️ **Bản Thu Âm Gốc Chuẩn Sư Phạm:** Tích hợp trực tiếp file thu âm chuẩn giọng cô giáo tiểu học (ấm áp, diễn cảm, hướng dẫn chi tiết từng nét và khẩu quyết tách gộp).
* 🦁 **Bé Tập Đếm (Interactive Counting):** Trò chơi tương tác chạm vào từng con vật để đếm kèm nốt nhạc vui tai (C4–C5) và pháo hoa chúc mừng.
* 🧺 **Tách - Gộp Số (Interactive Number Bonds):** Sơ đồ phân nhánh trực quan, rổ chia quả/con vật theo từng cặp số và chế độ Đố Vui Điền Số phản xạ nhanh.
* ✍️ **Bé Tập Viết (Interactive Canvas Lưới Ô Ly):** Bảng vẽ có lưới 4 dòng kẻ ô ly chuẩn tiểu học, hỗ trợ đồ nét theo mẫu chữ số mờ trên máy tính bảng/điện thoại.
* 👨‍👩‍👧 **Góc Phụ Huynh:** Cẩm nang 3 bước đồng hành sư phạm và bảng tra cứu toàn bộ các trường hợp tách gộp.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Frontend:** [Next.js 16](https://nextjs.org/) (React 19, Turbopack, App Router)
* **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/) (Type-safe 100%)
* **Giao diện:** [Tailwind CSS 4](https://tailwindcss.com/) (Responsive mượt mà trên iPad, Mobile và Laptop)
* **Âm thanh:** HTML5 Audio Native + Web Audio API (Hiệu ứng nốt nhạc tương tác)
* **Icon & Hiệu ứng:** [Lucide React](https://lucide.dev/), Canvas Confetti
* **Tự động hóa dữ liệu:** Python (PyMuPDF, ZXing-C++, FFmpeg)

---

## 📁 Cấu Trúc Thư Mục

```
├── BỘ THẺ.pdf                  # Bộ học liệu gốc 151 trang
├── MucTieu.txt                  # Mục tiêu dự án
├── extract_module_numbers.py    # Script Python tự động bóc tách dữ liệu & QR audio
├── data/
│   └── module_numbers/          # Dữ liệu số hóa (JSON, ảnh thẻ sạch, tranh vẽ, nét viết)
│       ├── cards/               # Ảnh thẻ 2 mặt (đã xóa QR bên thứ 3)
│       ├── illustrations/       # Tranh vẽ đếm số
│       ├── writing_guides/      # Mẫu hướng dẫn viết nét số
│       ├── animals/             # Ảnh con vật riêng lẻ
│       └── numbers_data.json    # File dữ liệu chuẩn hóa 10 số
└── web/                         # Ứng dụng Next.js Frontend
    ├── public/
    │   ├── audio/module_numbers/ # 10 file MP3 giọng cô giáo thu âm gốc
    │   └── data/module_numbers/  # Tài nguyên tĩnh phục vụ Web
    └── src/
        ├── app/                 # App Router, Layout và Trang chủ
        ├── components/          # Các Component tương tác (Navbar, Flashcard, Counting, Bonds, Writing)
        ├── types/               # TypeScript Definitions
        └── utils/               # Tiện ích Audio và Sound Service
```

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu cầu môi trường
* Node.js >= 18
* `pnpm` (khuyên dùng) hoặc `npm`

### Các bước khởi chạy
```bash
# 1. Di chuyển vào thư mục web
cd web

# 2. Cài đặt các gói phụ thuộc
pnpm install

# 3. Chạy môi trường phát triển (Development)
pnpm dev
```

Mở trình duyệt tại địa chỉ: **`http://localhost:3000`** (hoặc truy cập qua mạng nội bộ để dùng trên iPad/điện thoại).

---

## 📄 Bản Quyền
Dự án được xây dựng phục vụ giáo dục tiểu học và đồng hành cùng phụ huynh và học sinh Việt Nam.
