#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GEP - Universal PDF to Excel Converter V3.0
완성된 범용 PDF to Excel 변환기 (정규표현식 패턴 수정)

Author: AI Assistant (Seo Daeri)
Date: 2024-12
"""

import os
import re
import pandas as pd
import PyPDF2
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime

class UniversalPDFConverterV3:
    """완성된 범용 PDF to Excel 변환기 (V3)"""
    
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
        
        # 테스트 모드 확인
        self.test_mode = "TEST" in excel_file.upper()
        if self.test_mode:
            self.logger.info("🧪 테스트 모드로 실행 중...")
    
    def _get_default_config(self) -> Dict:
        """기본 설정 반환"""
        return {
            'question_pattern': r'(\d+)\.\s*(.*?)(?=\d+\.|$)',  # 문제 번호 패턴
            'option_patterns': [r'①', r'②', r'③', r'④'],      # 선택지 패턴
            'header_patterns': [                                  # 헤더 제거 패턴
                r'제\d+회\s*[^시]*시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽',
                r'[━───]+',
                r'[^-–]*[-–]\d+쪽\s*[━───]*',
                r'보험중개사\(공통\)[-–][^-–]*[-–]\d+쪽',
                r'손해보험\s*\d+부\s*[-–]\s*\d+쪽',
                r'생명보험\s*\d+부\s*[-–]\s*\d+쪽'
            ],
            'subject_mapping': {                                  # 과목 매핑 규칙
                '공통': '관계법령',
                '손보1부': '손보1부',
                '손보2부': '손보2부',
                '생보1부': '생보1부',
                '생보2부': '생보2부'
            },
            'round_extraction_pattern': r'(\d+)회',  # 회차 추출 패턴
            'auto_create_rows': True,  # 자동 행 생성 여부
            'backup_before_update': True  # 업데이트 전 백업 여부
        }
    
    def _setup_logging(self) -> logging.Logger:
        """로깅 설정"""
        # 기존 핸들러 제거
        for handler in logging.root.handlers[:]:
            logging.root.removeHandler(handler)
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pdf_converter_v3.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)
    
    def extract_round_number(self, filename: str) -> Optional[int]:
        """파일명에서 회차 번호 추출"""
        try:
            match = re.search(self.config['round_extraction_pattern'], filename)
            if match:
                return int(match.group(1))
            return None
        except Exception as e:
            self.logger.error(f"회차 번호 추출 실패: {e}")
            return None
    
    def extract_text_from_pdf(self, pdf_path: str) -> Optional[str]:
        """PDF에서 텍스트 추출"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                
                if not text.strip():
                    self.logger.warning(f"PDF에서 텍스트를 추출할 수 없습니다: {pdf_path}")
                    return None
                
                self.logger.info(f"PDF 텍스트 추출 성공: {len(text)} 문자")
                return text
        except Exception as e:
            self.logger.error(f"PDF 텍스트 추출 실패: {e}")
            return None
    
    def parse_questions_from_text(self, text: str) -> List[Dict]:
        """텍스트에서 문제 파싱 (개선된 버전)"""
        questions = []
        
        # 개선된 정규표현식 패턴
        # 문제 번호로 시작하고, 다음 문제 번호나 파일 끝까지 매칭
        pattern = r'(\d+)\.\s*(.*?)(?=\d+\.|$)'
        matches = re.findall(pattern, text, re.DOTALL)
        
        self.logger.info(f"정규표현식 매치 결과: {len(matches)}개")
        
        for i, match in enumerate(matches):
            try:
                question_num = int(match[0])
                question_text = match[1].strip()
                
                # 빈 문제 텍스트 체크
                if not question_text:
                    self.logger.warning(f"문제 {question_num}: 빈 텍스트")
                    continue
                
                # 선택지가 포함된 문제만 처리
                if not any(option in question_text for option in self.config['option_patterns']):
                    self.logger.warning(f"문제 {question_num}: 선택지가 없음")
                    continue
                
                formatted_text = self.format_question_text(question_text)
                
                # 포맷팅 검증
                if self.validate_question_format(formatted_text, question_num):
                    questions.append({
                        'question_number': question_num,
                        'formatted_text': formatted_text,
                        'original_text': question_text
                    })
                else:
                    self.logger.warning(f"문제 {question_num}: 포맷팅 검증 실패")
                
                if i < 3:  # 처음 3개만 로그 출력
                    self.logger.debug(f"문제 {question_num}: {formatted_text[:100]}...")
                    
            except Exception as e:
                self.logger.error(f"문제 파싱 오류 (매치 {i}): {e}")
                continue
        
        return questions
    
    def validate_question_format(self, formatted_text: str, question_num: int) -> bool:
        """문제 포맷팅 검증"""
        # 최소 길이 체크
        if len(formatted_text) < 10:
            self.logger.warning(f"문제 {question_num}: 텍스트가 너무 짧음 ({len(formatted_text)} 문자)")
            return False
        
        # 선택지 개수 체크
        option_count = sum(formatted_text.count(option) for option in self.config['option_patterns'])
        if option_count < 4:
            self.logger.warning(f"문제 {question_num}: 선택지가 부족함 ({option_count}개)")
            return False
        
        return True
    
    def format_question_text(self, text: str) -> str:
        """문제 텍스트 포맷팅 (역순 줄바꿈 방식)"""
        # 1. 전체 텍스트에서 모든 줄바꿈 제거 (1개 문장화)
        cleaned_text = self.clean_text_component(text)
        
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
            df = pd.read_excel(self.excel_file)
            self.logger.info(f"Excel 파일 로드 성공: {len(df)}행")
            return df
        except Exception as e:
            self.logger.error(f"Excel 파일 로드 실패: {e}")
            return None
    
    def backup_excel_file(self) -> bool:
        """Excel 파일 백업"""
        if not self.config['backup_before_update']:
            return True
            
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{self.excel_file.replace('.xlsx', '')}_백업_{timestamp}.xlsx"
            df = pd.read_excel(self.excel_file)
            df.to_excel(backup_file, index=False)
            self.logger.info(f"백업 파일 생성: {backup_file}")
            return True
        except Exception as e:
            self.logger.error(f"백업 파일 생성 실패: {e}")
            return False
    
    def create_new_rows_if_needed(self, df: pd.DataFrame, questions: List[Dict], 
                                round_num: int, layer1: str) -> pd.DataFrame:
        """필요한 경우 새 행 생성"""
        if not self.config['auto_create_rows']:
            return df
        
        # 기존 행 확인
        existing_mask = (df['EROUND'] == round_num) & (df['LAYER1'] == layer1)
        existing_questions = set(df[existing_mask]['QNUM'].tolist())
        
        # 새로 필요한 문제 번호들
        new_question_numbers = set(q['question_number'] for q in questions)
        missing_questions = new_question_numbers - existing_questions
        
        if missing_questions:
            self.logger.info(f"새 행 생성: {len(missing_questions)}개 문제")
            
            # 새 행 데이터 생성
            new_rows = []
            for qnum in sorted(missing_questions):
                new_row = {
                    'INDEX': len(df) + len(new_rows) + 1,
                    'ETITLE': '보험중개사',
                    'ECLASS': '손해보험',
                    'QCODE': '',  # 나중에 생성
                    'EROUND': round_num,
                    'LAYER1': layer1,
                    'LAYER2': '',
                    'LAYER3': '',
                    'QNUM': qnum,
                    'QTYPE': 'A',
                    'QUESTION': '',
                    'ANSWER': '',
                    'DIFFICULTY': '',
                    'CREATED_DATE': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'MODIFIED_DATE': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'STATUS': 'ACTIVE'
                }
                new_rows.append(new_row)
            
            # DataFrame에 새 행 추가
            new_df = pd.DataFrame(new_rows)
            df = pd.concat([df, new_df], ignore_index=True)
            self.logger.info(f"새 행 추가 완료: {len(new_rows)}개")
        
        return df
    
    def update_excel_with_questions(self, df: pd.DataFrame, questions: List[Dict], 
                                  round_num: int, layer1: str) -> Tuple[pd.DataFrame, int]:
        """Excel에 문제 업데이트"""
        updated_count = 0
        
        for question in questions:
            qnum = question['question_number']
            target_mask = (df['EROUND'] == round_num) & (df['LAYER1'] == layer1) & (df['QNUM'] == qnum)
            target_rows = df[target_mask]
            
            if not target_rows.empty:
                row_index = target_rows.index[0]
                df.at[row_index, 'QUESTION'] = question['formatted_text']
                df.at[row_index, 'MODIFIED_DATE'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                updated_count += 1
            else:
                self.logger.warning(f"대상 행을 찾을 수 없음: {round_num}회 {layer1} {qnum}번")
        
        return df, updated_count
    
    def process_single_file(self, pdf_file: str, round_num: int = None) -> bool:
        """단일 PDF 파일 처리"""
        self.logger.info(f"=== {pdf_file} 처리 시작 ===")
        
        # 회차 번호 추출 (제공되지 않은 경우)
        if round_num is None:
            round_num = self.extract_round_number(pdf_file)
            if round_num is None:
                self.logger.error(f"회차 번호를 추출할 수 없습니다: {pdf_file}")
                return False
        
        # 과목 매핑
        layer1 = self.map_subject_to_layer1(pdf_file)
        self.logger.info(f"회차: {round_num}, 과목: {layer1}")
        
        # PDF 텍스트 추출
        text = self.extract_text_from_pdf(pdf_file)
        if not text:
            return False
        
        # 문제 파싱
        questions = self.parse_questions_from_text(text)
        self.logger.info(f"추출된 문제 수: {len(questions)}개")
        
        if len(questions) == 0:
            self.logger.error(f"문제를 추출할 수 없습니다: {pdf_file}")
            return False
        
        # Excel 파일 로드
        df = self.load_excel_file()
        if df is None:
            return False
        
        # 백업 생성
        if not self.backup_excel_file():
            self.logger.warning("백업 생성 실패했지만 계속 진행합니다.")
        
        # 새 행 생성 (필요한 경우)
        df = self.create_new_rows_if_needed(df, questions, round_num, layer1)
        
        # Excel 업데이트
        df, updated_count = self.update_excel_with_questions(df, questions, round_num, layer1)
        
        # Excel 파일 저장
        try:
            df.to_excel(self.excel_file, index=False)
            self.logger.info(f"✅ {pdf_file} 처리 완료: {updated_count}개 문제 업데이트")
            return True
        except Exception as e:
            self.logger.error(f"Excel 파일 저장 실패: {e}")
            return False
    
    def test_with_sample_file(self) -> bool:
        """샘플 파일로 테스트"""
        self.logger.info("🧪 샘플 파일 테스트 시작")
        
        # 테스트용 PDF 파일 찾기
        test_files = []
        for file in os.listdir('.'):
            if file.endswith('.pdf') and ('25회' in file or '26회' in file):
                test_files.append(file)
                if len(test_files) >= 2:  # 2개만 테스트
                    break
        
        if not test_files:
            self.logger.error("테스트용 PDF 파일을 찾을 수 없습니다.")
            return False
        
        success_count = 0
        for test_file in test_files:
            self.logger.info(f"테스트 파일: {test_file}")
            if self.process_single_file(test_file):
                success_count += 1
        
        self.logger.info(f"테스트 완료: {success_count}/{len(test_files)} 파일 성공")
        return success_count > 0
    
    def process_batch_files(self, round_pattern: str = None) -> bool:
        """일괄 파일 처리"""
        if round_pattern:
            self.logger.info(f"일괄 처리 시작: {round_pattern}")
        else:
            self.logger.info("전체 PDF 파일 일괄 처리 시작")
        
        pdf_files = []
        for file in os.listdir('.'):
            if file.endswith('.pdf'):
                if round_pattern is None or round_pattern in file:
                    pdf_files.append(file)
        
        if not pdf_files:
            self.logger.error("PDF 파일을 찾을 수 없습니다.")
            return False
        
        self.logger.info(f"처리할 PDF 파일: {len(pdf_files)}개")
        
        success_count = 0
        for pdf_file in sorted(pdf_files):
            if self.process_single_file(pdf_file):
                success_count += 1
        
        self.logger.info(f"일괄 처리 완료: {success_count}/{len(pdf_files)} 파일 성공")
        return success_count > 0

def main():
    """메인 실행 함수"""
    print("🚀 GEP Universal PDF Converter V3.0")
    print("=" * 50)
    
    # 테스트 모드로 실행
    test_excel = "GEP_MASTER_TEST.xlsx"
    
    # 설정
    config = {
        'question_pattern': r'(\d+)\.\s*(.*?)(?=\d+\.|$)',
        'option_patterns': [r'①', r'②', r'③', r'④'],
        'header_patterns': [
            r'제\d+회\s*[^시]*시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽',
            r'[━───]+',
            r'[^-–]*[-–]\d+쪽\s*[━───]*',
            r'보험중개사\(공통\)[-–][^-–]*[-–]\d+쪽',
            r'손해보험\s*\d+부\s*[-–]\s*\d+쪽',
            r'생명보험\s*\d+부\s*[-–]\s*\d+쪽'
        ],
        'subject_mapping': {
            '공통': '관계법령',
            '손보1부': '손보1부',
            '손보2부': '손보2부',
            '생보1부': '생보1부',
            '생보2부': '생보2부'
        },
        'round_extraction_pattern': r'(\d+)회',
        'auto_create_rows': True,
        'backup_before_update': True
    }
    
    # 변환기 초기화
    converter = UniversalPDFConverterV3(test_excel, config)
    
    # 테스트 실행
    print("\n1️⃣ 샘플 파일 테스트 실행...")
    if converter.test_with_sample_file():
        print("✅ 테스트 성공!")
        
        # 추가 테스트 옵션
        print("\n2️⃣ 추가 테스트 옵션:")
        print("   a) 25회 파일만 테스트")
        print("   b) 26회 파일만 테스트")
        print("   c) 전체 파일 테스트")
        print("   d) 종료")
        
        choice = input("\n선택하세요 (a/b/c/d): ").lower()
        
        if choice == 'a':
            converter.process_batch_files("25회")
        elif choice == 'b':
            converter.process_batch_files("26회")
        elif choice == 'c':
            converter.process_batch_files()
        else:
            print("테스트 종료")
    else:
        print("❌ 테스트 실패!")

if __name__ == "__main__":
    main()
