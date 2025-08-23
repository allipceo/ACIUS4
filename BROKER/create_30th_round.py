#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Create 30th Round Data
기존 마스터 파일에 30회 데이터 추가

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import os
import re
import pandas as pd
import PyPDF2

def find_30th_pdf_files():
    """30회 PDF 파일 찾기"""
    pdf_files = []
    for file in os.listdir('.'):
        if file.endswith('.pdf') and '30회' in file:
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

def create_30th_round_data():
    """30회 데이터 생성 메인 함수"""
    excel_file = "GEP_MASTER_V1.0.xlsx"
    
    print("=== 30회 데이터 생성 시작 ===")
    
    # 1. 기존 Excel 파일 로드
    try:
        existing_df = pd.read_excel(excel_file)
        print(f"✅ 기존 Excel 파일 로드 완료: {len(existing_df)}행")
    except Exception as e:
        print(f"❌ Excel 파일 로드 실패: {e}")
        return False
    
    # 2. 30회 PDF 파일 찾기
    pdf_files = find_30th_pdf_files()
    if not pdf_files:
        print("❌ 30회 PDF 파일을 찾을 수 없습니다.")
        return False
    
    print(f"발견된 30회 PDF 파일: {pdf_files}")
    
    # 3. 새로운 데이터 생성
    new_data_rows = []
    
    # 각 PDF 파일 처리
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
        
        # 데이터 생성
        for question in questions:
            new_data_rows.append({
                'EROUND': 30,
                'LAYER1': layer1,
                'QNUM': question['question_number'],
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
        
        print(f"✅ {pdf_file} 처리 완료: {len(questions)}개 문제 생성")
    
    # 4. 기존 데이터와 새 데이터 합치기
    if new_data_rows:
        new_df = pd.DataFrame(new_data_rows)
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
        
        try:
            combined_df.to_excel(excel_file, index=False)
            print(f"✅ Excel 파일 저장 완료: {len(combined_df)}행")
            
            # 저장 후 검증
            verification_df = pd.read_excel(excel_file)
            print(f"저장 후 총 행 수: {len(verification_df)}개")
            
            # 30회 과목별 문제 수 확인
            for layer1 in ['관계법령', '손보1부', '손보2부']:
                layer_count = len(verification_df[(verification_df['EROUND'] == 30) & (verification_df['LAYER1'] == layer1)])
                print(f"  30회 {layer1}: {layer_count}개")
            
            # 전체 과목별 문제 수 확인
            print(f"\n=== 전체 현황 ===")
            for round_num in [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]:
                total_round = len(verification_df[verification_df['EROUND'] == round_num])
                print(f"  {round_num}회 총 문제: {total_round}개")
            
            return True
            
        except Exception as e:
            print(f"❌ Excel 파일 저장 실패: {e}")
            return False
    else:
        print("❌ 생성할 데이터가 없습니다.")
        return False

def main():
    """메인 실행 함수"""
    success = create_30th_round_data()
    
    if success:
        print("\n🎉 30회 데이터 생성 완료!")
    else:
        print("\n❌ 30회 데이터 생성 실패!")

if __name__ == "__main__":
    main()
