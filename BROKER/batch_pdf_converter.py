#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BROKER - Batch PDF to Excel Converter
모든 PDF 파일을 자동으로 순차 처리하는 배치 변환기

Author: AI Assistant (Seo Daeri)
Date: 2024-12
Purpose: 21회~28회 모든 PDF 파일을 자동으로 Excel에 변환
"""

import os
import re
import pandas as pd
import PyPDF2
import json
from datetime import datetime
import logging
from pathlib import Path

class BatchPDFConverter:
    def __init__(self):
        self.setup_logging()
        self.excel_file = "GEP_MASTER_DB_V1.0.xlsx"
        self.pdf_directory = "."  # 현재 폴더
        
    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('batch_converter.log', encoding='utf-8'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def scan_pdf_files(self):
        """PDF 파일 스캔 및 정렬"""
        pdf_files = []
        
        # PDF 파일 찾기
        for file in os.listdir(self.pdf_directory):
            if file.endswith('.pdf') and '회' in file:
                pdf_files.append(file)
        
        # 파일명에서 회차와 과목 추출하여 정렬
        parsed_files = []
        for file in pdf_files:
            match = re.match(r'(\d+)회\((\d+)\)_(.+?)\.pdf', file)
            if match:
                round_num = int(match.group(1))
                year = int(match.group(2))
                subject = match.group(3)
                
                # 과목 매핑
                layer1 = self.map_subject_to_layer1(subject)
                
                parsed_files.append({
                    'filename': file,
                    'round_num': round_num,
                    'year': year,
                    'subject': subject,
                    'layer1': layer1
                })
        
        # 회차 내림차순 정렬 (28회 → 27회 → ... → 21회)
        parsed_files.sort(key=lambda x: x['round_num'], reverse=True)
        
        return parsed_files
    
    def map_subject_to_layer1(self, subject):
        """과목명을 LAYER1으로 매핑"""
        mapping = {
            '공통(보험관계법령 등)': '관계법령',
            '공통(보험관련법령 등)': '관계법령',
            '손보1부': '손보1부',
            '손보2부': '손보2부',
            '생보1부': '생보1부',
            '생보2부': '생보2부'
        }
        return mapping.get(subject, subject)
    
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
        """텍스트에서 문제 파싱"""
        questions = []
        
        # 문제 번호 패턴 (1., 2., 3. 등)
        question_pattern = r'(\d+)\.\s*(.*?)(?=\d+\.|$)'
        matches = re.findall(question_pattern, text, re.DOTALL)
        
        for match in matches:
            question_num = int(match[0])
            question_text = match[1].strip()
            
            # ACIU S4 표준 포맷팅
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
        """텍스트 구성 요소 클리닝"""
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
    
    def load_excel_file(self):
        """엑셀 파일 로드"""
        try:
            df = pd.read_excel(self.excel_file)
            self.logger.info(f"엑셀 파일 로드 완료: {len(df)}행")
            return df
        except Exception as e:
            self.logger.error(f"엑셀 파일 로드 실패: {e}")
            return None
    
    def ensure_excel_rows_exist(self, round_num, layer1):
        """Excel에 해당 회차/과목의 행이 없으면 자동 생성"""
        df = self.load_excel_file()
        if df is None:
            return False
        
        # 해당 회차/과목의 행이 있는지 확인
        target_mask = (df['EROUND'] == round_num) & (df['LAYER1'] == layer1)
        existing_rows = df[target_mask]
        
        if len(existing_rows) == 0:
            self.logger.info(f"{round_num}회 {layer1} 행이 없습니다. 자동 생성합니다.")
            
            # 23회 데이터를 템플릿으로 사용하여 새 행 생성
            template_mask = (df['EROUND'] == 23) & (df['LAYER1'] == layer1)
            template_rows = df[template_mask]
            
            if len(template_rows) == 0:
                self.logger.error(f"23회 {layer1} 템플릿 데이터가 없습니다.")
                return False
            
            # 새 행들을 생성
            new_rows = []
            for _, template_row in template_rows.iterrows():
                new_row = template_row.copy()
                new_row['EROUND'] = round_num
                new_row['QUESTION'] = ''  # 빈 값으로 초기화
                new_rows.append(new_row)
            
            # DataFrame에 새 행 추가
            new_df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
            
            # Excel 파일 저장
            try:
                new_df.to_excel(self.excel_file, index=False)
                self.logger.info(f"{round_num}회 {layer1} 행 {len(new_rows)}개 생성 완료")
                return True
            except Exception as e:
                self.logger.error(f"Excel 파일 저장 실패: {e}")
                return False
        
        return True

    def update_excel_with_questions(self, questions, round_num, layer1):
        """엑셀 파일에 문제 업데이트"""
        # 먼저 해당 회차/과목의 행이 존재하는지 확인하고 없으면 생성
        if not self.ensure_excel_rows_exist(round_num, layer1):
            return {'success': False, 'error': f'{round_num}회 {layer1} 행 생성 실패'}
        
        # 엑셀 파일 로드
        df = self.load_excel_file()
        if df is None:
            return {'success': False, 'error': '엑셀 파일 로드 실패'}
        
        # 대상 문제 필터링
        target_mask = (df['EROUND'] == round_num) & (df['LAYER1'] == layer1)
        target_indices = df[target_mask].index
        
        self.logger.info(f"{round_num}회 {layer1} 문제 대상: {len(target_indices)}개")
        
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
            verification_mask = (verification_df['EROUND'] == round_num) & (verification_df['LAYER1'] == layer1)
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
    
    def process_single_file(self, file_info):
        """단일 PDF 파일 처리"""
        self.logger.info(f"=== {file_info['round_num']}회 {file_info['layer1']} 처리 시작 ===")
        self.logger.info(f"파일: {file_info['filename']}")
        
        # 1. PDF 텍스트 추출
        text = self.extract_text_from_pdf(file_info['filename'])
        if not text:
            return {'success': False, 'error': 'PDF 텍스트 추출 실패'}
        
        # 2. 문제 파싱
        questions = self.parse_questions_from_text(text)
        self.logger.info(f"추출된 문제 수: {len(questions)}")
        
        # 3. 엑셀 업데이트
        result = self.update_excel_with_questions(
            questions, 
            file_info['round_num'], 
            file_info['layer1']
        )
        
        return result
    
    def run_batch_conversion(self):
        """배치 변환 실행"""
        self.logger.info("=== 배치 PDF 변환 시작 ===")
        
        # 1. PDF 파일 스캔
        pdf_files = self.scan_pdf_files()
        self.logger.info(f"발견된 PDF 파일 수: {len(pdf_files)}")
        
        # 2. 각 파일 처리
        total_results = []
        
        for file_info in pdf_files:
            self.logger.info(f"\n{'='*50}")
            self.logger.info(f"처리 중: {file_info['filename']}")
            self.logger.info(f"회차: {file_info['round_num']}회, 과목: {file_info['layer1']}")
            
            result = self.process_single_file(file_info)
            result['file_info'] = file_info
            total_results.append(result)
            
            if result['success']:
                self.logger.info(f"✅ {file_info['filename']} 처리 완료")
            else:
                self.logger.error(f"❌ {file_info['filename']} 처리 실패: {result.get('error')}")
        
        # 3. 전체 결과 요약
        self.create_batch_report(total_results)
        
        return total_results
    
    def create_batch_report(self, results):
        """배치 처리 결과 보고서 생성"""
        successful_count = sum(1 for r in results if r['success'])
        total_files = len(results)
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'test_type': '배치 PDF 변환',
            'summary': {
                'total_files': total_files,
                'successful_files': successful_count,
                'failed_files': total_files - successful_count,
                'success_rate': f"{(successful_count/total_files)*100:.1f}%" if total_files > 0 else "0%"
            },
            'detailed_results': results
        }
        
        # JSON 파일로 저장
        with open('batch_conversion_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        # 결과 출력
        print(f"\n{'='*60}")
        print(f"🎉 배치 변환 완료!")
        print(f"📊 총 파일 수: {total_files}개")
        print(f"✅ 성공: {successful_count}개")
        print(f"❌ 실패: {total_files - successful_count}개")
        print(f"📈 성공률: {report['summary']['success_rate']}")
        print(f"📄 상세 보고서: batch_conversion_report.json")
        print(f"{'='*60}")

def main():
    """메인 실행 함수"""
    converter = BatchPDFConverter()
    
    # 배치 변환 실행
    results = converter.run_batch_conversion()

if __name__ == "__main__":
    main()
