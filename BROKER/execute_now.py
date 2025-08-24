#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
즉시 실행 스크립트
"""

import pandas as pd
import os

print("=== 20회, 21회, 22회 행 생성 시작 ===")

# 현재 디렉토리 확인
print(f"현재 디렉토리: {os.getcwd()}")

# Excel 파일 존재 확인
excel_file = "GEP_MASTER_DB_V1.0.xlsx"
if not os.path.exists(excel_file):
    print(f"❌ Excel 파일을 찾을 수 없습니다: {excel_file}")
    exit(1)

print(f"✅ Excel 파일 발견: {excel_file}")

# Excel 파일 로드
try:
    df = pd.read_excel(excel_file)
    print(f"✅ Excel 파일 로드 완료: {len(df)}행")
except Exception as e:
    print(f"❌ Excel 파일 로드 실패: {e}")
    exit(1)

# 현재 회차 확인
existing_rounds = sorted(df['EROUND'].unique())
print(f"현재 존재하는 회차: {existing_rounds}")

# 생성할 회차 (20회, 21회, 22회)
missing_rounds = [20, 21, 22]
total_new_rows = 0

for round_num in missing_rounds:
    print(f"\n=== {round_num}회 행 생성 시작 ===")
    
    # 해당 회차의 행이 이미 있는지 확인
    existing_mask = (df['EROUND'] == round_num)
    if existing_mask.any():
        print(f"{round_num}회 행이 이미 존재합니다. 건너뜁니다.")
        continue
    
    # 23회 데이터를 템플릿으로 사용
    template_mask = (df['EROUND'] == 23)
    template_rows = df[template_mask]
    
    if len(template_rows) == 0:
        print(f"❌ 23회 템플릿 데이터가 없습니다.")
        continue
    
    # 새 행 생성
    new_rows = []
    for _, template_row in template_rows.iterrows():
        new_row = template_row.copy()
        new_row['EROUND'] = round_num
        new_row['QUESTION'] = ''  # 빈 값으로 초기화
        new_rows.append(new_row)
    
    # DataFrame에 새 행 추가
    new_df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
    df = new_df
    
    print(f"✅ {round_num}회 행 {len(new_rows)}개 생성 완료")
    total_new_rows += len(new_rows)

# Excel 파일 저장
if total_new_rows > 0:
    try:
        df.to_excel(excel_file, index=False)
        print(f"✅ Excel 파일 저장 완료: 총 {total_new_rows}개 행 추가")
        
        # 저장 후 검증
        verification_df = pd.read_excel(excel_file)
        print(f"저장 후 총 행 수: {len(verification_df)}행")
        
        # 새로 생성된 회차 확인
        new_rounds = sorted(verification_df['EROUND'].unique())
        print(f"저장 후 존재하는 회차: {new_rounds}")
        
        print("🎉 행 생성 완료!")
        
    except Exception as e:
        print(f"❌ Excel 파일 저장 실패: {e}")
else:
    print("생성할 새로운 행이 없습니다.")

print("=== 작업 완료 ===")
