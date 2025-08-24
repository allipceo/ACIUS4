#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Add Fields and Generate QCODE
필드 추가 및 QCODE 생성

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import pandas as pd
import datetime
import os

def generate_qcode(etitle, eclass, eround, layer1, qtype, qnum):
    """QCODE 생성 함수"""
    
    # 시험 종류 코드 (첫글자)
    exam_codes = {
        '보험중개사': 'A',
        '보험심사역': 'B', 
        '손해사정사': 'C'
    }
    
    # 중분류 코드 (두번째 글자)
    class_codes = {
        '생명보험': 'A',
        '손해보험': 'B',
        '제3보험': 'C'
    }
    
    # LAYER1 코드 (세번째 글자)
    layer1_codes = {
        '관계법령': 'A',
        '손보1부': 'B',
        '손보2부': 'C'
    }
    
    # QTYPE 코드 (네번째 글자)
    qtype_codes = {
        'A': 'A',  # 기출문제(선택형)
        'B': 'B'   # 변환문제(진위형)
    }
    
    # 코드 생성
    exam_code = exam_codes.get(etitle, 'X')
    class_code = class_codes.get(eclass, 'X')
    layer1_code = layer1_codes.get(layer1, 'X')
    qtype_code = qtype_codes.get(qtype, 'X')
    
    # QCODE 형식: [시험종류][중분류][LAYER1][QTYPE]-[문제번호]
    qcode = f"{exam_code}{class_code}{layer1_code}{qtype_code}-{qnum:02d}"
    
    return qcode

def add_fields_and_generate_qcode():
    """필드 추가 및 QCODE 생성 메인 함수"""
    
    excel_file = "GEP_MASTER_V1.0.xlsx"
    
    print("=== 필드 추가 및 QCODE 생성 시작 ===")
    
    # 1. 기존 Excel 파일 로드
    try:
        df = pd.read_excel(excel_file)
        print(f"✅ Excel 파일 로드 완료: {len(df)}행")
    except Exception as e:
        print(f"❌ Excel 파일 로드 실패: {e}")
        return False
    
    # 2. 새 필드 추가
    print("\n=== 새 필드 추가 ===")
    
    # CREATED_DATE 필드 추가 (현재 시간으로 초기화)
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    df['CREATED_DATE'] = current_time
    print(f"✅ CREATED_DATE 필드 추가: {current_time}")
    
    # MODIFIED_DATE 필드 추가 (현재 시간으로 초기화)
    df['MODIFIED_DATE'] = current_time
    print(f"✅ MODIFIED_DATE 필드 추가: {current_time}")
    
    # DIFFICULTY 필드 추가 (빈 값으로 초기화)
    df['DIFFICULTY'] = ''
    print("✅ DIFFICULTY 필드 추가")
    
    # 3. QCODE 생성
    print("\n=== QCODE 생성 ===")
    
    qcode_list = []
    for index, row in df.iterrows():
        # NaN 값 처리
        eround = int(row['EROUND']) if pd.notna(row['EROUND']) else 0
        qnum = int(row['QNUM']) if pd.notna(row['QNUM']) else 0
        
        qcode = generate_qcode(
            etitle=row['ETITLE'],
            eclass=row['ECLASS'],
            eround=eround,
            layer1=row['LAYER1'],
            qtype=row['QTYPE'],
            qnum=qnum
        )
        qcode_list.append(qcode)
        
        if index < 5:  # 처음 5개만 출력
            print(f"  {index+1}: {qcode} ({row['ETITLE']} {eround}회 {row['LAYER1']} {qnum}번)")
    
    df['QCODE'] = qcode_list
    print(f"✅ QCODE 생성 완료: {len(qcode_list)}개")
    
    # 4. 필드 순서 재정렬
    column_order = [
        'INDEX', 'ETITLE', 'ECLASS', 'QCODE', 'EROUND', 
        'LAYER1', 'LAYER2', 'LAYER3', 'QNUM', 'QTYPE', 
        'QUESTION', 'ANSWER', 'DIFFICULTY', 'CREATED_DATE', 'MODIFIED_DATE'
    ]
    
    df = df[column_order]
    print("✅ 필드 순서 재정렬 완료")
    
    # 5. Excel 파일 저장
    try:
        df.to_excel(excel_file, index=False)
        print(f"✅ Excel 파일 저장 완료: {len(df)}행")
        
        # 저장 후 검증
        verification_df = pd.read_excel(excel_file)
        print(f"저장 후 총 행 수: {len(verification_df)}개")
        print(f"저장 후 필드 수: {len(verification_df.columns)}개")
        
        # 필드 목록 확인
        print(f"\n=== 최종 필드 구조 ===")
        for i, col in enumerate(verification_df.columns, 1):
            print(f"  {i:2d}. {col}")
        
        # QCODE 샘플 확인
        print(f"\n=== QCODE 샘플 ===")
        for i in range(5):
            print(f"  {i+1}: {verification_df.iloc[i]['QCODE']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel 파일 저장 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    success = add_fields_and_generate_qcode()
    
    if success:
        print("\n🎉 필드 추가 및 QCODE 생성 완료!")
    else:
        print("\n❌ 필드 추가 및 QCODE 생성 실패!")

if __name__ == "__main__":
    main()
