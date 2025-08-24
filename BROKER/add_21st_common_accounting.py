#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Add 21st Common Accounting
21회 공통(회계) PDF 파일을 기존 21회 관계법령에 추가

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import os
import re
import pandas as pd
import PyPDF2

def extract_text_from_pdf(pdf_path):
    """PDF에서 텍스트 추출"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print(f"PDF 텍스트 추출 실패: {e}")
        return None

def parse_questions_from_text(text):
    """텍스트에서 문제 파싱"""
    questions = []
    
    # 문제 번호 패턴 (1., 2., 3. 등)
    question_pattern = r'(\d+)\.\s*(.*?)(?=\d+\.|$)'
    matches = re.findall(question_pattern, text, re.DOTALL)
    
    for match in matches:
        question_num = int(match[0])
        question_text = match[1].strip()
        
        # ACIU S4 표준 포맷팅
        formatted_text = format_question_text(question_text)
        
        question_data = {
            'question_number': question_num,
            'formatted_text': formatted_text,
            'original_text': question_text
        }
        
        questions.append(question_data)
    
    return questions

def format_question_text(text):
    """문제 텍스트 포맷팅 (역순 줄바꿈 방식)"""
    # 1. 전체 텍스트에서 모든 줄바꿈 제거 (1개 문장화)
    cleaned_text = clean_text_component(text)
    
    # 2. 역순으로 선택지 앞에 줄바꿈 추가 (④ → ③ → ② → ①)
    formatted_text = cleaned_text
    
    # ④ 앞에 줄바꿈 추가
    formatted_text = re.sub(r'④', r'\n④', formatted_text)
    
    # ③ 앞에 줄바꿈 추가
    formatted_text = re.sub(r'③', r'\n③', formatted_text)
    
    # ② 앞에 줄바꿈 추가
    formatted_text = re.sub(r'②', r'\n②', formatted_text)
    
    # ① 앞에 줄바꿈 추가
    formatted_text = re.sub(r'①', r'\n①', formatted_text)
    
    # 3. 맨 앞의 불필요한 줄바꿈 제거
    formatted_text = formatted_text.lstrip('\n')
    
    return formatted_text

def clean_text_component(text):
    """텍스트 구성 요소 클리닝"""
    if not text:
        return ""
    
    # 페이지 헤더/푸터 제거
    text = remove_page_headers_footers(text)
    
    # 모든 줄바꿈을 공백으로 대체
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    # 과도한 공백 제거 및 앞뒤 공백 제거
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def remove_page_headers_footers(text):
    """페이지 헤더/푸터 제거"""
    # 헤더 패턴 제거
    text = re.sub(r'제\d+회\s*손해보험중개사시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽', '', text)
    
    # 하단 밑줄/구분선 제거
    text = re.sub(r'[━───]+', '', text)
    text = re.sub(r'보험중개사\(공통\)[-–]보험관계법령등[-–]\d+쪽\s*[━───]*', '', text)
    
    # 기타 페이지 정보 제거
    text = re.sub(r'보험중개사\(공통\)[-–][^-–]*[-–]\d+쪽', '', text)
    text = re.sub(r'보험중개사\(공통\)[-–][^-–]*[-–]\d+쪽\s*[━───]*', '', text)
    text = re.sub(r'손해보험\s*\d+부\s*[-–]\s*\d+쪽', '', text)
    text = re.sub(r'생명보험\s*\d+부\s*[-–]\s*\d+쪽', '', text)
    
    # 페이지 번호만 있는 경우
    text = re.sub(r'^\s*\d+쪽\s*$', '', text, flags=re.MULTILINE)
    
    return text.strip()

def add_21st_common_accounting():
    """21회 공통(회계) 추가 메인 함수"""
    excel_file = "GEP_MASTER_V1.0.xlsx"
    pdf_file = "21회(2015)_공통(회계).PDF"
    
    print("=== 21회 공통(회계) 추가 시작 ===")
    
    # 1. 기존 Excel 파일 로드
    try:
        existing_df = pd.read_excel(excel_file)
        print(f"✅ 기존 Excel 파일 로드 완료: {len(existing_df)}행")
    except Exception as e:
        print(f"❌ Excel 파일 로드 실패: {e}")
        return False
    
    # 2. 기존 21회 관계법령 문제 수 확인
    existing_21st_common = existing_df[(existing_df['EROUND'] == 21) & (existing_df['LAYER1'] == '관계법령')]
    existing_count = len(existing_21st_common)
    print(f"기존 21회 관계법령 문제 수: {existing_count}개")
    
    # 3. PDF 파일 존재 확인
    if not os.path.exists(pdf_file):
        print(f"❌ PDF 파일을 찾을 수 없습니다: {pdf_file}")
        return False
    
    print(f"처리할 PDF 파일: {pdf_file}")
    
    # 4. PDF 텍스트 추출
    text = extract_text_from_pdf(pdf_file)
    if not text:
        print(f"❌ PDF 텍스트 추출 실패")
        return False
    
    # 5. 문제 파싱
    questions = parse_questions_from_text(text)
    print(f"추출된 문제 수: {len(questions)}개")
    
    if len(questions) == 0:
        print(f"❌ PDF에서 문제를 추출할 수 없습니다.")
        return False
    
    # 6. 새로운 문제 번호 할당 (기존 번호에 이어서)
    new_data_rows = []
    for i, question in enumerate(questions):
        # 기존 번호에 이어서 번호 할당 (61, 62, 63, ...)
        new_question_num = existing_count + i + 1
        
        new_data_rows.append({
            'EROUND': 21,
            'LAYER1': '관계법령',
            'QNUM': new_question_num,
            'QUESTION': question['formatted_text'],
            'ANSWER': '',  # 빈 값으로 설정
            'EXPLANATION': '',  # 빈 값으로 설정
            'DIFFICULTY': '',  # 빈 값으로 설정
            'CATEGORY': '',  # 빈 값으로 설정
            'TAGS': '',  # 빈 값으로 설정
            'CREATED_DATE': '',  # 빈 값으로 설정
            'MODIFIED_DATE': '',  # 빈 값으로 설정
            'STATUS': 'ACTIVE'  # 기본값
        })
    
    # 7. 기존 데이터와 새 데이터 합치기
    new_df = pd.DataFrame(new_data_rows)
    combined_df = pd.concat([existing_df, new_df], ignore_index=True)
    
    try:
        combined_df.to_excel(excel_file, index=False)
        print(f"✅ Excel 파일 저장 완료: {len(combined_df)}행")
        
        # 저장 후 검증
        verification_df = pd.read_excel(excel_file)
        print(f"저장 후 총 행 수: {len(verification_df)}개")
        
        # 21회 관계법령 문제 수 확인
        final_21st_common = verification_df[(verification_df['EROUND'] == 21) & (verification_df['LAYER1'] == '관계법령')]
        final_count = len(final_21st_common)
        print(f"✅ 21회 관계법령 최종 문제 수: {final_count}개 (기존 {existing_count}개 + 추가 {len(questions)}개)")
        
        # 전체 현황 확인
        print(f"\n=== 전체 현황 ===")
        for round_num in [20, 21]:
            total_round = len(verification_df[verification_df['EROUND'] == round_num])
            print(f"  {round_num}회 총 문제: {total_round}개")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel 파일 저장 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    success = add_21st_common_accounting()
    
    if success:
        print("\n🎉 21회 공통(회계) 추가 완료!")
    else:
        print("\n❌ 21회 공통(회계) 추가 실패!")

if __name__ == "__main__":
    main()
