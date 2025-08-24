#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GEP V1.0 - PDF to Excel Converter
기출문제 PDF를 Excel로 변환하여 수동 검증 및 응용문제 생성을 위한 도구

Author: AI Assistant (Seo Daeri)
Date: 2024-12
Purpose: 기출문제 데이터 처리 자동화의 첫 단계
"""

import os
import re
import pandas as pd
import PyPDF2
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils.dataframe import dataframe_to_rows
import json
from datetime import datetime
import logging

class PDFToExcelConverter:
    def __init__(self):
        self.setup_logging()
        self.exam_data = []
        
    def setup_logging(self):
        """로깅 설정"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('pdf_converter.log', encoding='utf-8'),
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
        """텍스트에서 문제 패턴 파싱"""
        questions = []
        
        # 문제 번호 패턴 (1., 2., 3. 등)
        question_pattern = r'(\d+)\.\s*(.*?)(?=\d+\.|$)'
        matches = re.findall(question_pattern, text, re.DOTALL)
        
        for match in matches:
            question_num = int(match[0])
            question_text = match[1].strip()
            
            # 보기 패턴 (①, ②, ③, ④ 또는 1), 2), 3), 4))
            option_pattern = r'[①②③④]|\(\d+\)'
            options = re.findall(option_pattern, question_text)
            
            # 보기 텍스트 추출
            option_texts = []
            option_splits = re.split(r'[①②③④]|\(\d+\)', question_text)
            for i, split in enumerate(option_splits[1:], 1):  # 첫 번째는 문제 텍스트
                option_texts.append(split.strip())
            
            question_data = {
                'question_number': question_num,
                'question_text': question_text,
                'options': option_texts[:4],  # 4지선다형
                'correct_answer': None,  # 수동 입력 필요
                'category': None,  # 수동 분류 필요
                'subcategory': None,  # 수동 분류 필요
                'year': None,  # 수동 입력 필요
                'exam_type': None,  # 수동 입력 필요
                'verification_status': '미검증',
                'application_problems': []  # 진위형 응용문제 (수동 생성)
            }
            
            questions.append(question_data)
        
        return questions
    
    def create_excel_template(self, questions, output_path):
        """Excel 템플릿 생성"""
        try:
            # DataFrame 생성
            df_data = []
            for q in questions:
                row = {
                    '문제번호': q['question_number'],
                    '문제텍스트': q['question_text'],
                    '보기1': q['options'][0] if len(q['options']) > 0 else '',
                    '보기2': q['options'][1] if len(q['options']) > 1 else '',
                    '보기3': q['options'][2] if len(q['options']) > 2 else '',
                    '보기4': q['options'][3] if len(q['options']) > 3 else '',
                    '정답': q['correct_answer'],
                    '카테고리': q['category'],
                    '세부카테고리': q['subcategory'],
                    '출제년도': q['year'],
                    '시험종류': q['exam_type'],
                    '검증상태': q['verification_status'],
                    '진위형1': '',
                    '진위형2': '',
                    '진위형3': '',
                    '진위형4': '',
                    '진위형5': '',
                    '진위형6': '',
                    '진위형7': '',
                    '진위형8': '',
                    '비고': ''
                }
                df_data.append(row)
            
            df = pd.DataFrame(df_data)
            
            # Excel 파일 생성
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='기출문제_검증', index=False)
                
                # 워크시트 가져오기
                workbook = writer.book
                worksheet = writer.sheets['기출문제_검증']
                
                # 스타일 적용
                self.apply_excel_styles(worksheet)
                
                # 데이터 검증 규칙 추가
                self.add_data_validation(worksheet)
            
            self.logger.info(f"Excel 템플릿 생성 완료: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Excel 생성 실패: {e}")
            return False
    
    def apply_excel_styles(self, worksheet):
        """Excel 스타일 적용"""
        # 헤더 스타일
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
        
        for cell in worksheet[1]:
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center", vertical="center")
        
        # 열 너비 조정
        column_widths = {
            'A': 10,  # 문제번호
            'B': 50,  # 문제텍스트
            'C': 20,  # 보기1
            'D': 20,  # 보기2
            'E': 20,  # 보기3
            'F': 20,  # 보기4
            'G': 8,   # 정답
            'H': 15,  # 카테고리
            'I': 15,  # 세부카테고리
            'J': 10,  # 출제년도
            'K': 15,  # 시험종류
            'L': 10,  # 검증상태
            'M': 20,  # 진위형1
            'N': 20,  # 진위형2
            'O': 20,  # 진위형3
            'P': 20,  # 진위형4
            'Q': 20,  # 진위형5
            'R': 20,  # 진위형6
            'S': 20,  # 진위형7
            'T': 20,  # 진위형8
            'U': 30   # 비고
        }
        
        for col, width in column_widths.items():
            worksheet.column_dimensions[col].width = width
    
    def add_data_validation(self, worksheet):
        """데이터 검증 규칙 추가"""
        from openpyxl.worksheet.datavalidation import DataValidation
        
        # 정답 검증 (1-4만 허용)
        dv = DataValidation(type="whole", operator="between", formula1="1", formula2="4")
        dv.add('G2:G1000')  # 정답 열
        worksheet.add_data_validation(dv)
        
        # 검증상태 검증
        status_dv = DataValidation(type="list", formula1='"미검증,검증완료,오류발견"')
        status_dv.add('L2:L1000')  # 검증상태 열
        worksheet.add_data_validation(status_dv)
    
    def convert_pdf_to_excel(self, pdf_path, output_path):
        """PDF를 Excel로 변환하는 메인 함수"""
        self.logger.info(f"PDF 변환 시작: {pdf_path}")
        
        # 1. PDF 텍스트 추출
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            return False
        
        # 2. 문제 파싱
        questions = self.parse_questions_from_text(text)
        self.logger.info(f"추출된 문제 수: {len(questions)}")
        
        # 3. Excel 템플릿 생성
        success = self.create_excel_template(questions, output_path)
        
        if success:
            self.logger.info(f"변환 완료: {output_path}")
            self.logger.info("다음 단계: Excel 파일에서 수동 검증 및 응용문제 생성")
        
        return success
    
    def excel_to_json(self, excel_path, output_path):
        """검증된 Excel을 JSON으로 변환"""
        try:
            df = pd.read_excel(excel_path, sheet_name='기출문제_검증')
            
            questions = []
            for _, row in df.iterrows():
                if pd.isna(row['문제번호']):
                    continue
                
                question_data = {
                    'question_number': int(row['문제번호']),
                    'question_text': str(row['문제텍스트']),
                    'options': [
                        str(row['보기1']),
                        str(row['보기2']),
                        str(row['보기3']),
                        str(row['보기4'])
                    ],
                    'correct_answer': int(row['정답']) if pd.notna(row['정답']) else None,
                    'category': str(row['카테고리']) if pd.notna(row['카테고리']) else None,
                    'subcategory': str(row['세부카테고리']) if pd.notna(row['세부카테고리']) else None,
                    'year': int(row['출제년도']) if pd.notna(row['출제년도']) else None,
                    'exam_type': str(row['시험종류']) if pd.notna(row['시험종류']) else None,
                    'verification_status': str(row['검증상태']),
                    'application_problems': [
                        str(row['진위형1']) if pd.notna(row['진위형1']) else '',
                        str(row['진위형2']) if pd.notna(row['진위형2']) else '',
                        str(row['진위형3']) if pd.notna(row['진위형3']) else '',
                        str(row['진위형4']) if pd.notna(row['진위형4']) else '',
                        str(row['진위형5']) if pd.notna(row['진위형5']) else '',
                        str(row['진위형6']) if pd.notna(row['진위형6']) else '',
                        str(row['진위형7']) if pd.notna(row['진위형7']) else '',
                        str(row['진위형8']) if pd.notna(row['진위형8']) else ''
                    ],
                    'notes': str(row['비고']) if pd.notna(row['비고']) else ''
                }
                questions.append(question_data)
            
            # JSON 파일로 저장
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(questions, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"JSON 변환 완료: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"JSON 변환 실패: {e}")
            return False

def main():
    """메인 실행 함수"""
    converter = PDFToExcelConverter()
    
    # 사용 예시
    pdf_path = "sample_exam.pdf"  # 실제 PDF 파일 경로
    excel_path = "기출문제_검증_템플릿.xlsx"
    json_path = "questions.json"
    
    if os.path.exists(pdf_path):
        # PDF → Excel 변환
        if converter.convert_pdf_to_excel(pdf_path, excel_path):
            print(f"✅ PDF → Excel 변환 완료: {excel_path}")
            print("📝 다음 단계: Excel 파일에서 수동 검증 및 응용문제 생성")
            print("📝 검증 완료 후: python pdf_to_excel_converter.py --convert-json")
        else:
            print("❌ PDF → Excel 변환 실패")
    else:
        print(f"❌ PDF 파일을 찾을 수 없습니다: {pdf_path}")
        print("📝 사용법: python pdf_to_excel_converter.py [PDF파일경로]")

if __name__ == "__main__":
    main()
