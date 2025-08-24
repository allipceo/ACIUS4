#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - PDF to Excel Converter (Pandas Version)
28회 공통 문제 PDF에서 엑셀 QUESTION 필드로 변환하는 도구 (pandas 사용)

Author: AI Assistant (Seo Daeri)
Date: 2024-12
Purpose: PDF 텍스트 추출 및 엑셀 자동 입력 (pandas 방식)
"""

import os
import re
import pandas as pd
import PyPDF2
import json
from datetime import datetime
import logging

class PDF2ExcelPandasConverter:
    def __init__(self):
        self.setup_logging()
        self.excel_file = "GEP_MASTER_DB_V1.0.xlsx"
        self.pdf_file = "28회(2022)_손보1부.pdf"
        
    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pdf_converter_pandas.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def extract_text_from_pdf(self, pdf_path):
        """PDF에서 텍스트 추출"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            self.logger.error(f"PDF 텍스트 추출 실패: {e}")
            return None
    
    def parse_questions_from_text(self, text):
        """텍스트에서 문제 파싱 (줄바꿈 기반)"""
        questions = []
        
        # 문제 번호 패턴 (1., 2., 3. 등)
        question_pattern = r'(\d+)\.\s*(.*?)(?=\d+\.|$)'
        matches = re.findall(question_pattern, text, re.DOTALL)
        
        for match in matches:
            question_num = int(match[0])
            question_text = match[1].strip()
            
            # 줄바꿈 처리: 문제끝, ①앞, ②앞, ③앞, ④앞
            formatted_text = self.format_question_text(question_text)
            
            question_data = {
                'question_number': question_num,
                'formatted_text': formatted_text,
                'original_text': question_text
            }
            
            questions.append(question_data)
        
        return questions
    
    def format_question_text(self, text):
        """문제 텍스트 포맷팅 (역순 줄바꿈 방식)"""
        # 1. 전체 텍스트에서 모든 줄바꿈 제거 (1개 문장화)
        cleaned_text = self._clean_text_component(text)
        
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
    
    def _clean_text_component(self, text):
        """텍스트 구성 요소 클리닝 (내부 줄바꿈 및 과도한 공백 제거)"""
        if not text:
            return ""
        
        # 페이지 헤더/푸터 제거
        text = self._remove_page_headers_footers(text)
        
        # 모든 줄바꿈을 공백으로 대체
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        # 과도한 공백 제거 및 앞뒤 공백 제거
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _remove_page_headers_footers(self, text):
        """페이지 헤더/푸터 제거"""
        # 헤더 패턴 제거 (예: "제XX회 손해보험중개사시험 - XXX - X쪽")
        text = re.sub(r'제\d+회\s*손해보험중개사시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽', '', text)
        
        # 하단 밑줄/구분선 제거
        text = re.sub(r'[━───]+', '', text)  # 밑줄 패턴
        text = re.sub(r'보험중개사\(공통\)[-–]보험관계법령등[-–]\d+쪽\s*[━───]*', '', text)
        
        # 기타 페이지 정보 제거
        text = re.sub(r'보험중개사\(공통\)[-–][^-–]*[-–]\d+쪽', '', text)
        
        # 추가 패턴들
        text = re.sub(r'보험중개사\(공통\)[-–][^-–]*[-–]\d+쪽\s*[━───]*', '', text)
        text = re.sub(r'손해보험\s*\d+부\s*[-–]\s*\d+쪽', '', text)
        text = re.sub(r'생명보험\s*\d+부\s*[-–]\s*\d+쪽', '', text)
        
        # 페이지 번호만 있는 경우
        text = re.sub(r'^\s*\d+쪽\s*$', '', text, flags=re.MULTILINE)
        
        return text.strip()
    
    def load_excel_file(self):
        """엑셀 파일 로드 (pandas)"""
        try:
            df = pd.read_excel(self.excel_file)
            self.logger.info(f"엑셀 파일 로드 완료: {len(df)}행")
            return df
        except Exception as e:
            self.logger.error(f"엑셀 파일 로드 실패: {e}")
            return None
    
    def update_excel_with_questions(self, questions):
        """엑셀 파일에 문제 업데이트 (pandas)"""
        # 엑셀 파일 로드
        df = self.load_excel_file()
        if df is None:
            return {'success': False, 'error': '엑셀 파일 로드 실패'}
        
        # 28회 손보1부 문제 필터링
        target_mask = (df['EROUND'] == 28) & (df['LAYER1'] == '손보1부')
        target_indices = df[target_mask].index
        
        self.logger.info(f"28회 손보1부 문제 대상: {len(target_indices)}개")
        
        updated_count = 0
        errors = []
        
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
                    self.logger.info(f"문제 {qnum} 업데이트 완료")
                    
                    # 디버깅: 첫 번째 문제 내용 확인
                    if qnum == 1:
                        self.logger.info(f"문제 1 내용 미리보기: {question['formatted_text'][:200]}...")
                        
                except Exception as e:
                    error_msg = f"문제 {qnum} 업데이트 실패: {e}"
                    errors.append(error_msg)
                    self.logger.error(error_msg)
            else:
                error_msg = f"문제 {qnum}에 해당하는 행을 찾을 수 없음"
                errors.append(error_msg)
                self.logger.warning(error_msg)
        
        # 엑셀 파일 저장
        try:
            df.to_excel(self.excel_file, index=False)
            self.logger.info(f"엑셀 파일 저장 완료: {updated_count}개 문제 업데이트")
            
            # 저장 후 검증
            verification_df = pd.read_excel(self.excel_file)
            verification_mask = (verification_df['EROUND'] == 28) & (verification_df['LAYER1'] == '손보1부')
            non_empty_questions = verification_df[verification_mask]['QUESTION'].notna().sum()
            self.logger.info(f"저장 후 검증: {non_empty_questions}개 문제에 내용이 있음")
            
        except Exception as e:
            self.logger.error(f"엑셀 파일 저장 실패: {e}")
            return {'success': False, 'error': f'엑셀 파일 저장 실패: {e}'}
        
        return {
            'success': True,
            'updated_count': updated_count,
            'total_questions': len(questions),
            'errors': errors
        }
    
    def run_conversion(self):
        """메인 변환 프로세스"""
        self.logger.info("=== PDF2EXCEL 변환 시작 (Pandas Version) ===")
        
        # 1. PDF 텍스트 추출
        self.logger.info(f"PDF 파일 읽기: {self.pdf_file}")
        text = self.extract_text_from_pdf(self.pdf_file)
        if not text:
            return {'success': False, 'error': 'PDF 텍스트 추출 실패'}
        
        # 2. 문제 파싱
        self.logger.info("문제 파싱 시작")
        questions = self.parse_questions_from_text(text)
        self.logger.info(f"추출된 문제 수: {len(questions)}")
        
        # 3. 엑셀 업데이트
        self.logger.info("엑셀 파일 업데이트 시작")
        result = self.update_excel_with_questions(questions)
        
        return result
    
    def create_test_report(self, result):
        """테스트 결과 보고서 생성"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'PDF2EXCEL 변환 테스트 (Pandas Version)',
            'target_file': self.pdf_file,
            'result': result,
            'summary': {
                'success': result.get('success', False),
                'updated_count': result.get('updated_count', 0),
                'total_questions': result.get('total_questions', 0),
                'error_count': len(result.get('errors', []))
            }
        }
        
        # JSON 파일로 저장
        with open('test_result_pandas.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return report

def main():
    """메인 실행 함수"""
    converter = PDF2ExcelPandasConverter()
    
    # 변환 실행
    result = converter.run_conversion()
    
    # 결과 출력
    if result.get('success'):
        print(f"✅ 변환 성공!")
        print(f"📊 업데이트된 문제: {result.get('updated_count')}개")
        print(f"📋 총 문제 수: {result.get('total_questions')}개")
        
        if result.get('errors'):
            print(f"⚠️ 오류 수: {len(result.get('errors'))}개")
            for error in result.get('errors')[:5]:  # 처음 5개만 출력
                print(f"  - {error}")
    else:
        print(f"❌ 변환 실패: {result.get('error')}")
    
    # 테스트 보고서 생성
    report = converter.create_test_report(result)
    print(f"📄 테스트 보고서 생성 완료: test_result_pandas.json")

if __name__ == "__main__":
    main()
