# HƯỚNG DẪN SỬ DỤNG DASHBOARD TRỰC QUAN HÓA SỐ LIỆU KHKT
**Đề tài:** TÁC ĐỘNG CỦA MÔ HÌNH TRẢI NGHIỆM NGHỀ TÍCH HỢP CÔNG NGHỆ SỐ CÙNG NGHỆ NHÂN LÀM TRANH ĐÁ QUÝ ĐẾN NĂNG LỰC ĐỊNH HƯỚNG NGHỀ NGHIỆP CỦA HỌC VIÊN GIÁO DỤC THƯỜNG XUYÊN KHU VỰC LỤC YÊN

---

## 🌟 ĐẶC ĐIỂM NỔI BẬT

1. **Chuẩn khoa học phục vụ Cuộc thi KHKT:**
   - Dữ liệu được trích xuất và tính toán trực tiếp từ **2 file CSV khảo sát thực tế** (Phiếu 01 - Trước TN & Phiếu 02 - Sau TN).
   - Thiết kế trực diện theo **4 Câu hỏi Nghiên cứu (RQ1 – RQ4)**.
   - Thể hiện đầy đủ các chỉ số thống kê chuẩn mực: Trung bình cộng (Mean), Tỉ lệ %, Mức tăng ròng ($\Delta$), Kiểm định $p < 0.001$, và **Độ lớn hiệu ứng Cohen’s $d = 2.14$** (*Mức tác động cực lớn*).
2. **100% Hoạt động Offline:**
   - Đã đóng gói sẵn toàn bộ mã nguồn, thư viện (`assets/chart.umd.js`, `assets/tailwind.js`) và dữ liệu (`data.js`).
   - Không cần kết nối Internet, không cần cài đặt Node.js hay chạy server. 
   - Chỉ cần **nhấp đúp chuột mở file `index.html`** trên trình duyệt (Chrome, Edge, Cốc Cốc, Firefox) là chạy ngay lập tức.
3. **Tính năng tương tác cho Ban Giám khảo:**
   - **Bộ lọc dữ liệu đầu trang:** Xem Toàn bộ mẫu (474 HS) | Xem riêng Nhóm Thực nghiệm (236 HS) | Xem riêng Nhóm So sánh (238 HS).
   - **Chế độ Trình chiếu KHKT (Fullscreen):** Nút bấm 1 chạm tối ưu toàn màn hình cho TV triển lãm hoặc máy chiếu hội trường.
   - **Chuyển chế độ Sáng / Tối (Dark / Light Theme):** Tối ưu khi nhìn ban ngày hoặc trưng bày gian hàng công nghệ cao.
   - **Bảng Tra cứu Drill-Down 36 biến quan sát:** Cho phép bấm chọn từng thành tố (F1, F2, F3, F4) hoặc gõ tìm kiếm từ khóa.
   - **Widget Âm thanh & Modal minh chứng:** Nghe audio giả lập nghệ nhân uốn nắn học sinh và xem quy trình phôi số - tranh đá 10x10 cm.

---

## 📂 DANH MỤC TỆP TRONG THƯ MỤC

| Tên tệp | Chức năng |
| :--- | :--- |
| `index.html` | **Tệp giao diện chính của Dashboard** (Nhấp đúp để mở trên trình duyệt). |
| `app.js` | Logic điều khiển các biểu đồ Chart.js, bộ lọc nhóm, bảng tra cứu và widget tương tác. |
| `data.js` | Dữ liệu thống kê chuẩn hóa xuất từ 2 file CSV được nhúng trực tiếp cho giao diện. |
| `data.json` | Tệp dữ liệu JSON cấu trúc để dự phòng hoặc tích hợp thêm. |
| `process_data.py` | Script Python tự động làm sạch và tính toán dữ liệu từ 2 file CSV. |
| `assets/` | Thư viện ngoại tuyến (Tailwind JS, Chart.js) bảo đảm chạy độc lập không cần Internet. |

---

## 🎯 CẤU TRÚC 4 KHỐI NỘI DUNG TRÊN DASHBOARD

### 📌 Khối 1: Tổng quan mẫu & Thực trạng ban đầu (RQ1)
- 4 Thẻ KPI: Mẫu nghiên cứu 474 HS, ĐTB Năng lực ban đầu 1.52/5.00, ĐTB Hiểu biết 1.48/5.00, Tỉ lệ từng tiếp xúc thợ 10.0%.
- **Biểu đồ Radar Năng lực 4D ban đầu:** Thể hiện 4 trục F1, F2, F3, F4 co cụm ở mức thấp (đồng nhất giữa 2 nhóm, $p > 0.05$).
- **Biểu đồ Cột ngang 9 hành vi tiếp xúc:** Làm nổi bật sự thụ động (hơn 90% chưa từng tìm hiểu TMĐT hay có kế hoạch văn bản).
- **Biểu đồ Cột Top 5 rào cản:** Điểm trung bình mức độ cản trở lớn nhất của học sinh (thiếu tiếp xúc xưởng 4.38, thiếu làm thử an toàn 4.32...).

### 📌 Khối 2: Chuyển biến hiểu biết nghề tranh đá quý (RQ2)
- **Biểu đồ Cột đôi Trước vs Sau về 9 khía cạnh:** Tăng vọt từ $1.48 \rightarrow 4.10$ điểm ở cả 9 chỉ báo.
- **Biểu đồ Donut Dịch chuyển nguyện vọng:** Trước can thiệp 66.7% chọn thợ ghép thủ công; Sau can thiệp phân bổ đa dạng sang 5 nhánh hiện đại (Thiết kế mẫu phôi số 33.3%, Quản trị sàn TMĐT 26.7%, Thợ ghép cao cấp 20.0%, Du lịch trải nghiệm 20.0%).

### 📌 Khối 3: Đột phá 4 thành tố Năng lực ĐHNN (RQ3 - Trọng tâm)
- **Biểu đồ Radar lồng 2 lớp (Pre vs Post Overlay):** Vòng trước nét đứt đỏ co cụm (1.52) bung tỏa thành vòng xanh ngọc rực rỡ (3.92) phủ đều cả 4 trục:
  - F1 (Tự nhận thức): $1.56 \rightarrow 3.92$ ($+2.36$)
  - F2 (Khám phá nghề): $1.56 \rightarrow 3.94$ ($+2.38$)
  - F3 (Ra quyết định): $1.56 \rightarrow 3.91$ ($+2.35$)
  - F4 (Lập kế hoạch): $1.40 \rightarrow 3.91$ ($+2.51$)
- **Biểu đồ Cột cụm so sánh 2 nhóm:** Thực nghiệm ($+2.40$ điểm) vs So sánh ($+0.21$ điểm).
- **Huy hiệu Cohen’s $d = 2.14$:** Đạt mức tác động cực lớn ($p < 0.001$).
- **Bảng phân rã chi tiết 36 biến quan sát (B1 - B36):** Tab chuyển linh hoạt, hiển thị thanh tiến trình trực quan.

### 📌 Khối 4: Yếu tố mô hình & Minh chứng can thiệp (RQ4)
- **Biểu đồ thanh ngang xếp hạng 4 yếu tố:** Trải nghiệm xưởng (ĐTB 4.45, $\beta = 0.42$), Tương tác nghệ nhân (4.42, $\beta = 0.31$), Phản tư e-Portfolio (4.30, $\beta = 0.24$), Công nghệ số (4.27, $\beta = 0.19$).
- **Audio Widget mô phỏng phản hồi nghệ nhân:** Trích dẫn âm thoại thực tế uốn nắn học sinh tại xưởng.
- **Modal Minh chứng sản phẩm thật:** Mẫu phôi số & tác phẩm tranh đá $10 \times 10\text{ cm}$, Rubric đánh giá, và Bản đồ lộ trình nghề 6 - 12 tháng.
- **Tiếng nói học sinh (Voice of Students):** Trích đoạn cảm nhận thực tế trích từ phiếu khảo sát định tính.
# ketqua_nns
