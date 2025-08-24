#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Process 22nd Round
22회 PDF 파일을 처리하여 실제 문제 수에 맞게 행을 생성하고 문제 내용을 입력

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import os
import re
import pandas as pd
import PyPDF2

def find_22nd_pdf_files():
    """22회 PDF 파일 찾기"""
    pdf_files = []
    for file in os.listdir('.'):
        if file.endswith('.pdf') and '22회' in file:
            pdf_files.append(file)
    return sorted(pdf_files)

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

def map_subject_to_layer1(filename):
    """파일명에서 과목을 LAYER1으로 매핑"""
    if '공통' in filename:
        return '관계법령'
    elif '손보1부' in filename:
        return '손보1부'
    elif '손보2부' in filename:
        return '손보2부'
    elif '생보1부' in filename:
        return '생보1부'
    elif '생보2부' in filename:
        return '생보2부'
    else:
        return '기타'

def process_22nd_round():
    """22회 처리 메인 함수"""
    excel_file = "GEP_MASTER_DB_V1.0.xlsx"
    
    print("=== 22회 PDF 처리 시작 ===")
    
    # 1. 22회 PDF 파일 찾기
    pdf_files = find_22nd_pdf_files()
    if not pdf_files:
        print("❌ 22회 PDF 파일을 찾을 수 없습니다.")
        return False
    
    print(f"발견된 22회 PDF 파일: {pdf_files}")
    
    # 2. Excel 파일 로드
    try:
        df = pd.read_excel(excel_file)
        print(f"✅ Excel 파일 로드 완료: {len(df)}행")
    except Exception as e:
        print(f"❌ Excel 파일 로드 실패: {e}")
        return False
    
    # 3. 각 PDF 파일 처리
    total_processed = 0
    
    for pdf_file in pdf_files:
        print(f"\n=== {pdf_file} 처리 시작 ===")
        
        # 과목 매핑
        layer1 = map_subject_to_layer1(pdf_file)
        print(f"과목: {layer1}")
        
        # PDF 텍스트 추출
        text = extract_text_from_pdf(pdf_file)
        if not text:
            print(f"❌ {pdf_file} 텍스트 추출 실패")
            continue
        
        # 문제 파싱
        questions = parse_questions_from_text(text)
        print(f"추출된 문제 수: {len(questions)}개")
        
        if len(questions) == 0:
            print(f"❌ {pdf_file}에서 문제를 추출할 수 없습니다.")
            continue
        
        # 기존 22회 해당 과목 행 삭제 (있다면)
        existing_mask = (df['EROUND'] == 22) & (df['LAYER1'] == layer1)
        if existing_mask.any():
            df = df[~existing_mask]
            print(f"기존 22회 {layer1} 행 삭제 완료")
        
        # 새 행 생성 (실제 문제 수만큼)
        new_rows = []
        for question in questions:
            # 23회 템플릿에서 첫 번째 행 복사
            template_row = df[df['EROUND'] == 23].iloc[0].copy()
            template_row['EROUND'] = 22
            template_row['LAYER1'] = layer1
            template_row['QNUM'] = question['question_number']
            template_row['QUESTION'] = question['formatted_text']
            new_rows.append(template_row)
        
        # DataFrame에 새 행 추가
        new_df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        df = new_df
        
        print(f"✅ {pdf_file} 처리 완료: {len(questions)}개 문제")
        total_processed += len(questions)
    
    # 4. Excel 파일 저장
    try:
        df.to_excel(excel_file, index=False)
        print(f"✅ Excel 파일 저장 완료")
        
        # 저장 후 검증
        verification_df = pd.read_excel(excel_file)
        verification_mask = (verification_df['EROUND'] == 22)
        total_22nd_questions = len(verification_df[verification_mask])
        print(f"저장 후 22회 총 문제 수: {total_22nd_questions}개")
        
        # 과목별 문제 수 확인
        for layer1 in ['관계법령', '손보1부', '손보2부']:
            layer_mask = (verification_df['EROUND'] == 22) & (verification_df['LAYER1'] == layer1)
            layer_count = len(verification_df[layer_mask])
            print(f"  22회 {layer1}: {layer_count}개")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel 파일 저장 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    success = process_22nd_round()
    
    if success:
        print("\n🎉 22회 처리 완료!")
    else:
        print("\n❌ 22회 처리 실패!")

if __name__ == "__main__":
    main()
