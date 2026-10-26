import sys, pandas as pd, numpy as np

sys.stdout.reconfigure(encoding='utf-8')

f1 = 'PHIẾU KHẢO SÁT 01 (TRƯỚC THỰC NGHIỆM) (Câu trả lời) - Câu trả lời biểu mẫu 1.csv'
df1 = pd.read_csv(f1).dropna(subset=['Họ và tên:', 'Mã nhóm:']).drop_duplicates(subset=['Họ và tên:', 'Lớp:'], keep='last')

def extract_num(val):
    if pd.isna(val): return np.nan
    s = str(val).strip()
    if len(s) > 0 and s[0].isdigit(): return float(s[0])
    return np.nan

# 1. Bảng 1: F1, F2, F3, F4
f1_cols = [c for c in df1.columns if 'A. Tự nhận thức' in c]
f2_cols = [c for c in df1.columns if 'B. Khám phá thế giới' in c]
f3_cols = [c for c in df1.columns if 'C. Ra quyết định' in c]
f4_cols = [c for c in df1.columns if 'D. Lập kế hoạch' in c]
all_36 = f1_cols + f2_cols + f3_cols + f4_cols

for c in all_36:
    df1[c + '_num'] = df1[c].apply(extract_num)

print("=== SO SÁNH BẢNG 1 (N=474 trong CSV vs N=468 trong Báo cáo) ===")
factors = [('F1', f1_cols, 1.62, 0.64), ('F2', f2_cols, 1.54, 0.68), ('F3', f3_cols, 1.45, 0.62), ('F4', f4_cols, 1.38, 0.59), ('Toàn phần 36', all_36, 1.50, 0.63)]
for name, cols, exp_m, exp_sd in factors:
    # student means
    stu_means = df1[[c + '_num' for c in cols]].mean(axis=1)
    m = stu_means.mean()
    sd = stu_means.std()
    print(f"{name:15} | CSV: ĐTB={m:.2f}, ĐLC={sd:.2f} | Báo cáo: ĐTB={exp_m:.2f}, ĐLC={exp_sd:.2f} | Lệch: {m - exp_m:+.2f}")

# 2. Bảng 2: Hiểu biết nghề
print("\n=== SO SÁNH BẢNG 2: HIỂU BIẾT NGHỀ ===")
hb_cols = [c for c in df1.columns if 'Hiểu biết về nghề' in c]
for c in hb_cols:
    df1[c + '_num'] = df1[c].apply(extract_num)

exp_b2 = [
    (1.72, 0.66), (1.65, 0.61), (1.42, 0.59), (1.46, 0.60),
    (1.40, 0.57), (1.51, 0.63), (1.48, 0.58), (1.44, 0.62), (1.28, 0.52)
]

for i, c in enumerate(hb_cols):
    s = df1[c + '_num']
    m = s.mean()
    sd = s.std()
    exp_m, exp_sd = exp_b2[i]
    print(f"Câu {i+1}: CSV: ĐTB={m:.2f}, ĐLC={sd:.2f} | Báo cáo: ĐTB={exp_m:.2f}, ĐLC={exp_sd:.2f} | Lệch: {m - exp_m:+.2f}")

stu_hb = df1[[c + '_num' for c in hb_cols]].mean(axis=1)
print(f"Chung 9 biến | CSV: ĐTB={stu_hb.mean():.2f}, ĐLC={stu_hb.std():.2f} | Báo cáo: ĐTB=1.48, ĐLC=0.58")

# 3. Bảng 3: Tiếp xúc nghề
print("\n=== SO SÁNH BẢNG 3: HÀNH VI TIẾP XÚC ===")
tx_cols = [c for c in df1.columns if 'Tiếp xúc nghề nghiệp' in c]
for c in tx_cols:
    df1[c + '_num'] = df1[c].apply(extract_num)

exp_b3 = [
    (47, 10.0), (82, 17.5), (62, 13.2), (79, 16.9),
    (51, 10.9), (43, 9.2), (38, 8.1), (86, 18.4), (31, 6.6)
]

for i, c in enumerate(tx_cols):
    # Check frequency of responses >= 2 (hiếm khi, thỉnh thoảng, thường xuyên) or >= 3
    s = df1[c + '_num']
    cnt_ge2 = (s >= 2).sum() # có tiếp xúc
    cnt_ge3 = (s >= 3).sum() # thỉnh thoảng trở lên
    cnt_eq45 = (s >= 4).sum()
    exp_cnt, exp_pct = exp_b3[i]
    print(f"Hành vi {i+1} | CSV >=2: {cnt_ge2} ({cnt_ge2/len(s)*100:.1f}%), >=3: {cnt_ge3} ({cnt_ge3/len(s)*100:.1f}%), >=4: {cnt_eq45} | Báo cáo: {exp_cnt} ({exp_pct}%)")
