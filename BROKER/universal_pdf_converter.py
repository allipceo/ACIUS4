#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GEP - Universal PDF to Excel Converter
범용 PDF to Excel 변환기

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import os
import re
import pandas as pd
import PyPDF2
import logging
from typing import List, Dict, Optional

class UniversalPDFConverter:
    """범용 PDF to Excel 변환기"""
    
    def __init__(self, excel_file: str, config: Dict = None):
        """
        초기화
        
        Args:
            excel_file: 대상 Excel 파일 경로
            config: 설정 딕셔너리
        """
        self.excel_file = excel_file
        self.config = config or self._get_default_config()
        self.logger = self._setup_logging()
    
    def _get_default_config(self) -> Dict:
        """기본 설정 반환"""
        return {
            'question_pattern': r'(\d+)\.\s*(.*?)(?=\d+\.|$)',  # 문제 번호 패턴
            'option_patterns': [r'①', r'②', r'③', r'④'],      # 선택지 패턴
            'header_patterns': [                                  # 헤더 제거 패턴
                r'제\d+회\s*[^시]*시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽',
                r'[━───]+',
                r'[^-–]*[-–]\d+쪽\s*[━───]*'
            ],
            'subject_mapping': {                                  # 과목 매핑 규칙
                '공통': '관계법령',
                '손보1부': '손보1부',
                '손보2부': '손보2부',
                '생보1부': '생보1부',
                '생보2부': '생보2부'
            }
        }
    
    def _setup_logging(self) -> logging.Logger:
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pdf_converter.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)
    
    def extract_text_from_pdf(self, pdf_path: str) -> Optional[str]:
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
    
    def parse_questions_from_text(self, text: str) -> List[Dict]:
        """텍스트에서 문제 파싱"""
        questions = []
        pattern = self.config['question_pattern']
        matches = re.findall(pattern, text, re.DOTALL)
        
        for match in matches:
            question_num = int(match[0])
            question_text = match[1].strip()
            
            formatted_text = self.format_question_text(question_text)
            
            questions.append({
                'question_number': question_num,
                'formatted_text': formatted_text,
                'original_text': question_text
            })
        
        return questions
    
    def format_question_text(self, text: str) -> str:
        """문제 텍스트 포맷팅 (역순 줄바꿈 방식)"""
        # 1. 전체 텍스트에서 모든 줄바꿈 제거 (1개 문장화)
        cleaned_text = self.clean_text_component(text)
        
        # 2. 역순으로 선택지 앞에 줄바꿈 추가
        formatted_text = cleaned_text
        for option in reversed(self.config['option_patterns']):
            formatted_text = re.sub(option, f'\n{option}', formatted_text)
        
        # 3. 맨 앞의 불필요한 줄바꿈 제거
        formatted_text = formatted_text.lstrip('\n')
        
        return formatted_text
    
    def clean_text_component(self, text: str) -> str:
        """텍스트 구성 요소 클리닝"""
        if not text:
            return ""
        
        # 페이지 헤더/푸터 제거
        text = self.remove_page_headers_footers(text)
        
        # 모든 줄바꿈을 공백으로 대체
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        # 과도한 공백 제거 및 앞뒤 공백 제거
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def remove_page_headers_footers(self, text: str) -> str:
        """페이지 헤더/푸터 제거"""
        for pattern in self.config['header_patterns']:
            text = re.sub(pattern, '', text)
        
        # 페이지 번호만 있는 경우
        text = re.sub(r'^\s*\d+쪽\s*$', '', text, flags=re.MULTILINE)
        
        return text.strip()
    
    def map_subject_to_layer1(self, filename: str) -> str:
        """파일명에서 과목을 LAYER1으로 매핑"""
        for key, value in self.config['subject_mapping'].items():
            if key in filename:
                return value
        return '기타'
    
    def load_excel_file(self) -> Optional[pd.DataFrame]:
        """Excel 파일 로드"""
        try:
            return pd.read_excel(self.excel_file)
        except Exception as e:
            self.logger.error(f"Excel 파일 로드 실패: {e}")
            return None
    
    def update_excel_with_questions(self, df: pd.DataFrame, questions: List[Dict], 
                                  round_num: int, layer1: str) -> pd.DataFrame:
        """Excel에 문제 업데이트"""
        target_mask = (df['EROUND'] == round_num) & (df['LAYER1'] == layer1)
        
        for question in questions:
            qnum = question['question_number']
            target_row = df[target_mask & (df['QNUM'] == qnum)]
            
            if not target_row.empty:
                row_index = target_row.index[0]
                df.at[row_index, 'QUESTION'] = question['formatted_text']
        
        return df
    
    def process_single_file(self, pdf_file: str, round_num: int) -> bool:
        """단일 PDF 파일 처리"""
        self.logger.info(f"=== {pdf_file} 처리 시작 ===")
        
        # 과목 매핑
        layer1 = self.map_subject_to_layer1(pdf_file)
        self.logger.info(f"과목: {layer1}")
        
        # PDF 텍스트 추출
        text = self.extract_text_from_pdf(pdf_file)
        if not text:
            return False
        
        # 문제 파싱
        questions = self.parse_questions_from_text(text)
        self.logger.info(f"추출된 문제 수: {len(questions)}개")
        
        if len(questions) == 0:
            return False
        
        # Excel 파일 로드
        df = self.load_excel_file()
        if df is None:
            return False
        
        # Excel 업데이트
        df = self.update_excel_with_questions(df, questions, round_num, layer1)
        
        # Excel 파일 저장
        try:
            df.to_excel(self.excel_file, index=False)
            self.logger.info(f"✅ {pdf_file} 처리 완료: {len(questions)}개 문제 업데이트")
            return True
        except Exception as e:
            self.logger.error(f"Excel 파일 저장 실패: {e}")
            return False
    
    def process_batch_files(self, pdf_directory: str, round_pattern: str) -> bool:
        """일괄 파일 처리"""
        pdf_files = []
        for file in os.listdir(pdf_directory):
            if file.endswith('.pdf') and round_pattern in file:
                pdf_files.append(os.path.join(pdf_directory, file))
        
        if not pdf_files:
            self.logger.error(f"PDF 파일을 찾을 수 없습니다: {round_pattern}")
            return False
        
        # 회차 번호 추출 (예: "25회" → 25)
        round_num = int(re.search(r'(\d+)회', round_pattern).group(1))
        
        success_count = 0
        for pdf_file in sorted(pdf_files):
            if self.process_single_file(pdf_file, round_num):
                success_count += 1
        
        self.logger.info(f"일괄 처리 완료: {success_count}/{len(pdf_files)} 파일 성공")
        return success_count == len(pdf_files)

def main():
    """메인 실행 함수"""
    # 설정 예시
    config = {
        'question_pattern': r'(\d+)\.\s*(.*?)(?=\d+\.|$)',
        'option_patterns': [r'①', r'②', r'③', r'④'],
        'header_patterns': [
            r'제\d+회\s*[^시]*시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽',
            r'[━───]+',
            r'[^-–]*[-–]\d+쪽\s*[━───]*'
        ],
        'subject_mapping': {
            '공통': '관계법령',
            '손보1부': '손보1부',
            '손보2부': '손보2부',
            '생보1부': '생보1부',
            '생보2부': '생보2부'
        }
    }
    
    # 변환기 초기화
    converter = UniversalPDFConverter("GEP_MASTER_DB_V1.0.xlsx", config)
    
    # 단일 파일 처리 예시
    # converter.process_single_file("25회(2019)_공통(보험관계법령 등).pdf", 25)
    
    # 일괄 처리 예시
    # converter.process_batch_files(".", "25회")

if __name__ == "__main__":
    main()
