import sys, os, json, re
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

f1 = 'PHIẾU KHẢO SÁT 01 (TRƯỚC THỰC NGHIỆM) (Câu trả lời) - Câu trả lời biểu mẫu 1.csv'
f2 = 'PHIẾU KHẢO SÁT 02 (SAU THỰC NGHIỆM) (Câu trả lời) - Câu trả lời biểu mẫu 1.csv'

df1 = pd.read_csv(f1).dropna(subset=['Họ và tên:', 'Mã nhóm:']).drop_duplicates(subset=['Họ và tên:', 'Lớp:'], keep='last')
df2 = pd.read_csv(f2).dropna(subset=['Họ và tên:', 'Mã nhóm:']).drop_duplicates(subset=['Họ và tên:', 'Lớp:'], keep='last')

def extract_level(val):
    if pd.isna(val):
        return None
    s = str(val).strip()
    if len(s) > 0 and s[0].isdigit():
        return int(s[0])
    return None

def clean_col_label(c):
    m = re.search(r'\[(.*?)\]', c)
    if m:
        return m.group(1).strip()
    return c.strip()

def build_survey_meta(df, is_post=False):
    sections = []
    
    # II. Năng lực
    sec2_sub = [
        ('A. Tự nhận thức nghề nghiệp', [c for c in df.columns if 'A. Tự nhận thức' in c]),
        ('B. Khám phá thế giới nghề nghiệp', [c for c in df.columns if 'B. Khám phá thế giới' in c]),
        ('C. Ra quyết định nghề nghiệp', [c for c in df.columns if 'C. Ra quyết định' in c]),
        ('D. Lập kế hoạch nghề nghiệp', [c for c in df.columns if 'D. Lập kế hoạch' in c])
    ]
    
    q_map = [] # list of all question column names
    
    sub_list = []
    for sub_title, cols in sec2_sub:
        q_objs = []
        for c in cols:
            q_id = f"q_{len(q_map)}"
            q_map.append(c)
            q_objs.append({'id': q_id, 'label': clean_col_label(c), 'full': c})
        sub_list.append({
            'title': sub_title,
            'scale_labels': ['1 Hoàn toàn chưa biết', '2 Biết rất ít', '3 Biết cơ bản', '4 Biết khá rõ', '5 Hiểu biết chuyên sâu'],
            'questions': q_objs
        })
    sections.append({
        'title': 'II. NĂNG LỰC ĐỊNH HƯỚNG NGHỀ NGHIỆP',
        'subsections': sub_list
    })
    
    # III. Hiểu biết
    hb_cols = [c for c in df.columns if 'Hiểu biết về nghề' in c]
    hb_objs = []
    for c in hb_cols:
        q_id = f"q_{len(q_map)}"
        q_map.append(c)
        hb_objs.append({'id': q_id, 'label': clean_col_label(c), 'full': c})
    sections.append({
        'title': 'III. HIỂU BIẾT VỀ NGHỀ TRANH ĐÁ QUÝ',
        'subsections': [{
            'title': 'Hiểu biết về nghề tranh đá quý',
            'scale_labels': ['1 Hoàn toàn chưa biết', '2 Biết rất ít', '3 Biết cơ bản', '4 Biết khá rõ', '5 Hiểu biết chuyên sâu'],
            'questions': hb_objs
        }]
    })
    
    # IV. Tiếp xúc
    tx_cols = [c for c in df.columns if 'Tiếp xúc nghề nghiệp' in c]
    tx_objs = []
    for c in tx_cols:
        q_id = f"q_{len(q_map)}"
        q_map.append(c)
        tx_objs.append({'id': q_id, 'label': clean_col_label(c), 'full': c})
    sections.append({
        'title': 'IV. TIẾP XÚC NGHỀ NGHIỆP THỰC TẾ',
        'subsections': [{
            'title': 'Tiếp xúc nghề nghiệp thực tế',
            'scale_labels': ['1 Không bao giờ', '2 Hiếm khi', '3 Thỉnh thoảng', '4 Thường xuyên', '5 Rất thường xuyên'],
            'questions': tx_objs
        }]
    })
    
    if is_post:
        mh_groups = [
            ('1. Trải nghiệm nghề thực tế tại xưởng', [c for c in df.columns if '1. Trải nghiệm nghề thực tế' in c]),
            ('2. Tương tác với nghệ nhân', [c for c in df.columns if '2. Tương tác với nghệ nhân' in c]),
            ('3. Công nghệ số', [c for c in df.columns if '3. Công nghệ số' in c]),
            ('4. Phản tư và hồ sơ nghề nghiệp', [c for c in df.columns if '4. Phản tư và hồ sơ' in c])
        ]
        mh_sub_list = []
        for mh_title, cols in mh_groups:
            q_objs = []
            for c in cols:
                q_id = f"q_{len(q_map)}"
                q_map.append(c)
                q_objs.append({'id': q_id, 'label': clean_col_label(c), 'full': c})
            mh_sub_list.append({
                'title': mh_title,
                'scale_labels': ['1 Không bao giờ', '2 Hiếm khi', '3 Thỉnh thoảng', '4 Thường xuyên', '5 Rất thường xuyên'],
                'questions': q_objs
            })
        sections.append({
            'title': 'V. ĐÁNH GIÁ CÁC YẾU TỐ MÔ HÌNH CAN THIỆP',
            'subsections': mh_sub_list
        })
        
    # Extract records with compact array of scores
    records = []
    txt_col1 = df.columns[59] if not is_post else df.columns[71]
    txt_col2 = df.columns[60] if not is_post else df.columns[72]
    
    for _, row in df.iterrows():
        # Score list matching q_map order
        scores = [extract_level(row.get(col_name)) for col_name in q_map]
        records.append({
            'name': str(row.get('Họ và tên:', '')).strip(),
            'class': str(row.get('Lớp:', '')).strip(),
            'gender': str(row.get('Giới tính (tự nguyện):', '')).strip(),
            'group': str(row.get('Mã nhóm:', '')).strip(),
            's': scores,
            't1': str(row.get(txt_col1, '')).strip() if pd.notna(row.get(txt_col1)) else '',
            't2': str(row.get(txt_col2, '')).strip() if pd.notna(row.get(txt_col2)) else ''
        })
        
    return {
        'title': 'PHIẾU KHẢO SÁT 01 (TRƯỚC THỰC NGHIỆM)' if not is_post else 'PHIẾU KHẢO SÁT 02 (SAU THỰC NGHIỆM)',
        'sections': sections,
        'records': records,
        'text_titles': [txt_col1, txt_col2]
    }

meta_pre = build_survey_meta(df1, is_post=False)
meta_post = build_survey_meta(df2, is_post=True)

out = {
    'pre': meta_pre,
    'post': meta_post,
    'classes': sorted(list(set([r['class'] for r in meta_pre['records'] if r['class']]))),
    'groups': ['Thực nghiệm', 'So sánh']
}

js_str = 'window.GOOGLE_FORM_DATA = ' + json.dumps(out, ensure_ascii=False) + ';\n'

with open('form_data.js', 'w', encoding='utf-8') as f:
    f.write(js_str)

print(f"Compact form_data.js generated successfully! Size: {os.path.getsize('form_data.js')} bytes")
