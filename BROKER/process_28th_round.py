#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Process 28th Round
28회 PDF 파일을 처리하여 기존 행의 QUESTION 필드만 업데이트

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import os
import re
import pandas as pd
import PyPDF2

def find_28th_pdf_files():
    """28회 PDF 파일 찾기"""
    pdf_files = []
    for file in os.listdir('.'):
        if file.endswith('.pdf') and '28회' in file:
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

def process_28th_round():
    """28회 처리 메인 함수"""
    excel_file = "GEP_MASTER_DB_V1.0.xlsx"
    
    print("=== 28회 PDF 처리 시작 ===")
    
    # 1. 28회 PDF 파일 찾기
    pdf_files = find_28th_pdf_files()
    if not pdf_files:
        print("❌ 28회 PDF 파일을 찾을 수 없습니다.")
        return False
    
    print(f"발견된 28회 PDF 파일: {pdf_files}")
    
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
        
        # 기존 28회 해당 과목 행 찾기
        target_mask = (df['EROUND'] == 28) & (df['LAYER1'] == layer1)
        target_rows = df[target_mask]
        
        if len(target_rows) == 0:
            print(f"❌ 28회 {layer1} 행을 찾을 수 없습니다.")
            continue
        
        print(f"기존 28회 {layer1} 행 수: {len(target_rows)}개")
        
        # QUESTION 필드 업데이트
        updated_count = 0
        for question in questions:
            qnum = question['question_number']
            
            # 해당 문제 번호의 행 찾기
            target_row = df[target_mask & (df['QNUM'] == qnum)]
            
            if not target_row.empty:
                try:
                    # QUESTION 컬럼 업데이트
                    row_index = target_row.index[0]
                    df.at[row_index, 'QUESTION'] = question['formatted_text']
                    updated_count += 1
                except Exception as e:
                    print(f"문제 {qnum} 업데이트 실패: {e}")
            else:
                print(f"문제 {qnum}에 해당하는 행을 찾을 수 없음")
        
        print(f"✅ {pdf_file} 처리 완료: {updated_count}개 문제 업데이트")
        total_processed += updated_count
    
    # 4. Excel 파일 저장
    try:
        df.to_excel(excel_file, index=False)
        print(f"✅ Excel 파일 저장 완료")
        
        # 저장 후 검증
        verification_df = pd.read_excel(excel_file)
        verification_mask = (verification_df['EROUND'] == 28)
        non_empty_questions = verification_df[verification_mask]['QUESTION'].notna().sum()
        total_28th_questions = len(verification_df[verification_mask])
        print(f"저장 후 28회 총 문제 수: {total_28th_questions}개")
        print(f"저장 후 28회 내용 있는 문제 수: {non_empty_questions}개")
        
        # 과목별 문제 수 확인
        for layer1 in ['관계법령', '손보1부', '손보2부']:
            layer_mask = (verification_df['EROUND'] == 28) & (verification_df['LAYER1'] == layer1)
            layer_count = len(verification_df[layer_mask])
            layer_filled = verification_df[layer_mask]['QUESTION'].notna().sum()
            print(f"  28회 {layer1}: {layer_filled}/{layer_count}개")
        
        return True
        
    except Exception as e:
        print(f"❌ Excel 파일 저장 실패: {e}")
        return False

def main():
    """메인 실행 함수"""
    success = process_28th_round()
    
    if success:
        print("\n🎉 28회 처리 완료!")
    else:
        print("\n❌ 28회 처리 실패!")

if __name__ == "__main__":
    main()
