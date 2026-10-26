import sys, os
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

f1 = 'PHIẾU KHẢO SÁT 01 (TRƯỚC THỰC NGHIỆM) (Câu trả lời) - Câu trả lời biểu mẫu 1.csv'
f2 = 'PHIẾU KHẢO SÁT 02 (SAU THỰC NGHIỆM) (Câu trả lời) - Câu trả lời biểu mẫu 1.csv'

df1 = pd.read_csv(f1)
df2 = pd.read_csv(f2)

df1_clean = df1.dropna(subset=['Họ và tên:', 'Mã nhóm:']).copy()
df2_clean = df2.dropna(subset=['Họ và tên:', 'Mã nhóm:']).copy()

df1_clean['name_norm'] = df1_clean['Họ và tên:'].astype(str).str.strip()
df2_clean['name_norm'] = df2_clean['Họ và tên:'].astype(str).str.strip()

# Deduplicate
df1_dedup = df1_clean.drop_duplicates(subset=['name_norm', 'Lớp:'], keep='last').copy()
df2_dedup = df2_clean.drop_duplicates(subset=['name_norm', 'Lớp:'], keep='last').copy()

print(f"DF1 size: {len(df1_dedup)}, DF2 size: {len(df2_dedup)}")

# Helper to extract numeric Likert score
def extract_num(val):
    if pd.isna(val):
        return np.nan
    s = str(val).strip()
    if len(s) > 0 and s[0].isdigit():
        return float(s[0])
    return np.nan

# Identify columns
# 36 items: col 5 to 40
f1_cols = [c for c in df1.columns if 'A. Tự nhận thức' in c]
f2_cols = [c for c in df1.columns if 'B. Khám phá thế giới' in c]
f3_cols = [c for c in df1.columns if 'C. Ra quyết định' in c]
f4_cols = [c for c in df1.columns if 'D. Lập kế hoạch' in c]
all_36 = f1_cols + f2_cols + f3_cols + f4_cols

hieu_biet_cols = [c for c in df1.columns if 'Hiểu biết về nghề' in c]
tiep_xuc_cols = [c for c in df1.columns if 'Tiếp xúc nghề nghiệp' in c]

print(f"Count F1: {len(f1_cols)}, F2: {len(f2_cols)}, F3: {len(f3_cols)}, F4: {len(f4_cols)}, All 36: {len(all_36)}")
print(f"Count Hieu biet: {len(hieu_biet_cols)}, Tiep xuc: {len(tiep_xuc_cols)}")

# Let's inspect DF2 extra columns (model factors etc)
mo_hinh_1 = [c for c in df2.columns if '1. Trải nghiệm nghề thực tế' in c]
mo_hinh_2 = [c for c in df2.columns if '2. Tương tác với nghệ nhân' in c]
mo_hinh_3 = [c for c in df2.columns if '3. Công nghệ số' in c]
mo_hinh_4 = [c for c in df2.columns if '4. Phản tư và hồ sơ' in c]
print(f"DF2 Model factors count: {len(mo_hinh_1)}, {len(mo_hinh_2)}, {len(mo_hinh_3)}, {len(mo_hinh_4)}")

# Convert DF1 scores
for c in all_36 + hieu_biet_cols + tiep_xuc_cols:
    df1_dedup[c + '_num'] = df1_dedup[c].apply(extract_num)

# Convert DF2 scores
for c in all_36 + hieu_biet_cols + tiep_xuc_cols + mo_hinh_1 + mo_hinh_2 + mo_hinh_3 + mo_hinh_4:
    if c in df2_dedup.columns:
        df2_dedup[c + '_num'] = df2_dedup[c].apply(extract_num)

# Compute means for DF1
print("\n--- DF1 (PRE) STATS ---")
for grp in ['Thực nghiệm', 'So sánh']:
    sub = df1_dedup[df1_dedup['Mã nhóm:'] == grp]
    m_all = sub[[c + '_num' for c in all_36]].mean().mean()
    m_f1 = sub[[c + '_num' for c in f1_cols]].mean().mean()
    m_f2 = sub[[c + '_num' for c in f2_cols]].mean().mean()
    m_f3 = sub[[c + '_num' for c in f3_cols]].mean().mean()
    m_f4 = sub[[c + '_num' for c in f4_cols]].mean().mean()
    m_hb = sub[[c + '_num' for c in hieu_biet_cols]].mean().mean()
    print(f"Group {grp} (N={len(sub)}): All 36={m_all:.2f}, F1={m_f1:.2f}, F2={m_f2:.2f}, F3={m_f3:.2f}, F4={m_f4:.2f}, HieuBiet={m_hb:.2f}")

# Compute means for DF2
print("\n--- DF2 (POST) STATS ---")
for grp in ['Thực nghiệm', 'So sánh']:
    sub = df2_dedup[df2_dedup['Mã nhóm:'] == grp]
    m_all = sub[[c + '_num' for c in all_36]].mean().mean()
    m_f1 = sub[[c + '_num' for c in f1_cols]].mean().mean()
    m_f2 = sub[[c + '_num' for c in f2_cols]].mean().mean()
    m_f3 = sub[[c + '_num' for c in f3_cols]].mean().mean()
    m_f4 = sub[[c + '_num' for c in f4_cols]].mean().mean()
    m_hb = sub[[c + '_num' for c in hieu_biet_cols]].mean().mean()
    print(f"Group {grp} (N={len(sub)}): All 36={m_all:.2f}, F1={m_f1:.2f}, F2={m_f2:.2f}, F3={m_f3:.2f}, F4={m_f4:.2f}, HieuBiet={m_hb:.2f}")

# Check DF2 Model Factors for Thực nghiệm
print("\n--- DF2 MODEL EVALUATION (Thực nghiệm) ---")
sub_tn = df2_dedup[df2_dedup['Mã nhóm:'] == 'Thực nghiệm']
m_mh1 = sub_tn[[c + '_num' for c in mo_hinh_1]].mean().mean()
m_mh2 = sub_tn[[c + '_num' for c in mo_hinh_2]].mean().mean()
m_mh3 = sub_tn[[c + '_num' for c in mo_hinh_3]].mean().mean()
m_mh4 = sub_tn[[c + '_num' for c in mo_hinh_4]].mean().mean()
print(f"Trải nghiệm thực tế xưởng: {m_mh1:.2f}")
print(f"Tương tác nghệ nhân: {m_mh2:.2f}")
print(f"Công nghệ số: {m_mh3:.2f}")
print(f"Phản tư e-Portfolio: {m_mh4:.2f}")
