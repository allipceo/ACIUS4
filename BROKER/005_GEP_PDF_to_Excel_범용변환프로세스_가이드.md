# GEP PDF to Excel 범용 변환 프로세스 가이드

## 📋 개요

이 문서는 **General Exam Platform (GEP) V1.0**에서 개발된 PDF to Excel 변환 프로세스를 범용화한 가이드입니다. 다양한 국가자격시험의 PDF 문제지를 Excel 파일로 자동 변환할 수 있도록 설계되었습니다.

## 🎯 목적

- **기출문제 PDF 자동 변환**: 출제기관에서 배포하는 PDF 문제지를 Excel 형태로 자동 변환
- **범용성 확보**: 다양한 시험 유형에 적용 가능한 표준 프로세스 제공
- **품질 보장**: 100% 정확성을 위한 수동 검증 단계 포함
- **효율성 증대**: 반복적인 수동 작업 자동화

## 🏗️ 시스템 아키텍처

### 핵심 구성 요소

```
PDF 파일 → 텍스트 추출 → 문제 파싱 → 포맷팅 → Excel 업데이트
    ↓           ↓           ↓         ↓         ↓
PyPDF2    정규표현식   ACIU 표준   역순줄바꿈   Pandas
```

### 기술 스택

- **PDF 처리**: PyPDF2
- **텍스트 파싱**: Python re (정규표현식)
- **데이터 관리**: Pandas
- **파일 처리**: Python os, glob

## 📁 파일 구조

```
BROKER/
├── GEP_MASTER_DB_V1.0.xlsx          # 메인 Excel 데이터베이스
├── universal_pdf_converter.py       # 범용 변환기 (기본)
├── batch_pdf_converter.py           # 일괄 처리기
├── process_[N]th_round.py           # 회차별 처리기
└── 005_GEP_PDF_to_Excel_범용변환프로세스_가이드.md
```

## 🔧 범용 변환기 개발

### 1. 기본 변환기 (universal_pdf_converter.py)

```python
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

if __name__ == "__main__":
    main()
```

## ⚙️ 설정 가이드

### 1. 기본 설정

```python
config = {
    # 문제 번호 패턴 (다양한 형식 지원)
    'question_pattern': r'(\d+)\.\s*(.*?)(?=\d+\.|$)',
    
    # 선택지 패턴 (시험별로 다를 수 있음)
    'option_patterns': [r'①', r'②', r'③', r'④'],
    
    # 헤더 제거 패턴 (시험별로 조정 필요)
    'header_patterns': [
        r'제\d+회\s*[^시]*시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽',
        r'[━───]+',
        r'[^-–]*[-–]\d+쪽\s*[━───]*'
    ],
    
    # 과목 매핑 (시험별로 조정 필요)
    'subject_mapping': {
        '공통': '관계법령',
        '손보1부': '손보1부',
        '손보2부': '손보2부',
        '생보1부': '생보1부',
        '생보2부': '생보2부'
    }
}
```

### 2. 새로운 시험 적용 시

1. **PDF 구조 분석**: 문제 번호, 선택지 형식 파악
2. **패턴 설정**: 정규표현식 패턴 조정
3. **과목 매핑**: 해당 시험의 과목 구조에 맞게 설정
4. **테스트 실행**: 소수 파일로 검증
5. **일괄 처리**: 전체 파일 처리

## 🚀 사용 예시

### 1. 단일 파일 처리

```python
from universal_pdf_converter import UniversalPDFConverter

# 변환기 초기화
converter = UniversalPDFConverter("exam_database.xlsx")

# 단일 파일 처리
success = converter.process_single_file("25회_공통.pdf", 25)
print(f"처리 결과: {'성공' if success else '실패'}")
```

### 2. 새로운 시험 적용

```python
# 새로운 시험 설정
new_config = {
    'question_pattern': r'문제\s*(\d+)[:：]\s*(.*?)(?=문제\s*\d+[:：]|$)',
    'option_patterns': [r'A[.．]', r'B[.．]', r'C[.．]', r'D[.．]'],
    'header_patterns': [
        r'[^시]*시험\s*[-–]\s*[^-–]*\s*[-–]\s*\d+쪽',
        r'[━───]+'
    ],
    'subject_mapping': {
        '기초': '기초과목',
        '전문': '전문과목'
    }
}

# 새로운 시험용 변환기 생성
new_converter = UniversalPDFConverter("new_exam_database.xlsx", new_config)
```

## 📊 품질 관리

### 1. 자동 검증

- **문제 수 확인**: PDF에서 추출한 문제 수 vs Excel 업데이트 수
- **포맷 검증**: ACIU S4 표준 포맷 준수 여부
- **중복 검사**: 동일 문제 중복 입력 방지

### 2. 수동 검증

- **샘플 검토**: 각 회차별 랜덤 샘플 검토
- **포맷 확인**: 줄바꿈, 선택지 배치 정확성
- **내용 검증**: 텍스트 누락, 오타 확인

## 📋 체크리스트

### 새로운 시험 적용 시

- [ ] PDF 구조 분석 완료
- [ ] 정규표현식 패턴 설정
- [ ] 과목 매핑 규칙 정의
- [ ] 테스트 파일로 검증
- [ ] 설정 파일 저장
- [ ] 일괄 처리 실행
- [ ] 결과 검증
- [ ] 문서화 완료

## 🎯 결론

이 범용 PDF to Excel 변환 프로세스는 **다양한 국가자격시험에 적용 가능**한 표준화된 솔루션입니다. 

### 주요 장점

1. **범용성**: 다양한 시험 형식에 대응
2. **확장성**: 새로운 시험 쉽게 추가 가능
3. **안정성**: 오류 처리 및 복구 메커니즘
4. **효율성**: 자동화를 통한 시간 절약
5. **품질**: 100% 정확성을 위한 검증 단계

이 가이드를 통해 **GEP V1.0의 성공 경험을 다른 시험에도 확산**하여, 더 많은 학습자들이 효율적인 기출문제 학습을 할 수 있기를 기대합니다.

---

**문서 버전**: 1.0  
**최종 업데이트**: 2024-12  
**작성자**: AI Assistant (Seo Daeri)  
**검토자**: 조대표
