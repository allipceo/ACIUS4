#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV to JSON Converter for AICU Season4
QUESTION 필드 절대 노터치 원칙 준수
인스교재 데이터만 필터링
"""

import csv
import json
import os
from datetime import datetime
from typing import Dict, List, Any

class CSVToJSONConverter:
    """CSV 파일을 JSON으로 변환하는 클래스 (인스교재만)"""
    
    def __init__(self, csv_file_path: str, json_output_path: str):
        self.csv_file_path = csv_file_path
        self.json_output_path = json_output_path
        self.questions = []
        self.categories = {
            "재산보험": [],
            "특종보험": [],
            "배상책임보험": [],
            "해상보험": []
        }
        self.total_count = 0
        self.ins_count = 0
        self.excluded_count = 0
    
    def convert_csv_to_json(self) -> Dict[str, Any]:
        """
        CSV 파일을 JSON으로 변환 (인스교재만)
        QUESTION 필드는 절대 건드리지 않음
        """
        print(f"CSV 파일 변환 시작: {self.csv_file_path}")
        print("=" * 50)
        
        try:
            with open(self.csv_file_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    self.total_count += 1
                    
                    # 빈 행 건너뛰기
                    if not row.get('QCODE') or not row.get('QUESTION'):
                        continue
                    
                    # ⭐ 인스교재 필터링 (SOURCE 필드 기준)
                    source = row.get('SOURCE', '')
                    if "인스교재" not in source:
                        self.excluded_count += 1
                        continue
                    
                    self.ins_count += 1
                    
                    # QUESTION 필드 절대 노터치 - 그대로 복사
                    question_data = {
                        "index": row.get('INDEX', ''),
                        "qcode": row.get('QCODE', ''),
                        "question": row.get('QUESTION', ''),  # 절대 노터치!
                        "answer": row.get('ANSWER', ''),
                        "type": row.get('TYPE', ''),
                        "layer1": row.get('LAYER1', ''),
                        "layer2": row.get('LAYER2', ''),
                        "layer3": row.get('LAYER3', ''),
                        "source": row.get('SOURCE', ''),
                        "title": row.get('TITLE', ''),
                        "code1": row.get('CODE1', ''),
                        "code2": row.get('CODE2', ''),
                        "input": row.get('INPUT', ''),
                        "result": row.get('RESULT', ''),
                        "explain": row.get('EXPLAIN', ''),
                        "analysis": row.get('ANALSYS', ''),
                        "solve_count": row.get('풀이회수', '0'),
                        "correct_count": row.get('정답회수', '0'),
                        "incorrect_count": row.get('오답회수', '0'),
                        "error_rate": row.get('오답율', '0')
                    }
                    
                    self.questions.append(question_data)
                    
                    # 카테고리별 분류 (LAYER1 기준)
                    layer1 = row.get('LAYER1', '')
                    if layer1 in self.categories:
                        self.categories[layer1].append(question_data)
                    else:
                        # 예상하지 못한 카테고리가 있을 경우 로그
                        print(f"알 수 없는 카테고리: {layer1}")
                
                # 결과 출력
                print(f"전체 데이터: {self.total_count}개")
                print(f"인스교재: {self.ins_count}개 선택됨")
                print(f"중개사시험: {self.excluded_count}개 제외됨")
                print(f"총 {len(self.questions)}개 문제 변환 완료")
                print("=" * 50)
                
                # 카테고리별 통계 출력
                for category, questions in self.categories.items():
                    print(f"{category}: {len(questions)}개")
                
                # JSON 구조 생성
                json_data = {
                    "metadata": {
                        "total_questions": len(self.questions),
                        "source_filter": "인스교재",
                        "total_original": self.total_count,
                        "excluded_count": self.excluded_count,
                        "categories": {
                            category: len(questions) for category, questions in self.categories.items()
                        },
                        "conversion_date": datetime.now().isoformat(),
                        "source_file": os.path.basename(self.csv_file_path),
                        "version": "AICU Season4 v1.0"
                    },
                    "questions": self.questions,
                    "categories": self.categories
                }
                
                return json_data
                
        except FileNotFoundError:
            print(f"❌ 오류: CSV 파일을 찾을 수 없습니다: {self.csv_file_path}")
            return {}
        except UnicodeDecodeError:
            print("❌ 오류: 파일 인코딩 문제. UTF-8로 저장된 파일인지 확인해주세요.")
            return {}
        except Exception as e:
            print(f"❌ 오류: CSV 변환 중 예외 발생: {str(e)}")
            return {}
    
    def save_json(self, json_data: Dict[str, Any]) -> bool:
        """JSON 데이터를 파일로 저장"""
        try:
            # 출력 디렉토리 생성
            os.makedirs(os.path.dirname(self.json_output_path), exist_ok=True)
            
            with open(self.json_output_path, 'w', encoding='utf-8') as jsonfile:
                json.dump(json_data, jsonfile, ensure_ascii=False, indent=2)
            
            print(f"✅ JSON 파일 저장 완료: {self.json_output_path}")
            return True
            
        except Exception as e:
            print(f"❌ 오류: JSON 파일 저장 실패: {str(e)}")
            return False
    
    def validate_data(self, json_data: Dict[str, Any]) -> bool:
        """변환된 데이터 검증"""
        if not json_data:
            print("❌ 검증 실패: 변환된 데이터가 없습니다")
            return False
        
        questions = json_data.get('questions', [])
        if not questions:
            print("❌ 검증 실패: 변환된 문제가 없습니다")
            return False
        
        # QUESTION 필드 검증 (노터치 원칙 확인)
        validation_count = min(5, len(questions))
        for i, question in enumerate(questions[:validation_count]):
            if 'question' not in question:
                print(f"❌ 검증 실패: {i+1}번째 문제에 QUESTION 필드가 누락되었습니다")
                return False
            
            if not question['question'].strip():
                print(f"❌ 검증 실패: {i+1}번째 문제의 QUESTION 필드가 비어있습니다")
                return False
        
        # 카테고리 검증
        categories = json_data.get('categories', {})
        expected_categories = ["재산보험", "특종보험", "배상책임보험", "해상보험"]
        
        for category in expected_categories:
            if category not in categories:
                print(f"⚠️  경고: {category} 카테고리가 없습니다")
        
        print("✅ 데이터 검증 완료")
        print(f"📊 검증 항목: {validation_count}개 문제 확인")
        return True
    
    def generate_report(self, json_data: Dict[str, Any]) -> str:
        """변환 결과 보고서 생성"""
        if not json_data:
            return "변환 실패: 데이터 없음"
        
        metadata = json_data.get('metadata', {})
        
        report = f"""
=== AICU Season4 CSV→JSON 변환 완료 보고서 ===
변환 일시: {metadata.get('conversion_date', 'Unknown')}
원본 파일: {metadata.get('source_file', 'Unknown')}

📊 변환 통계:
- 전체 원본 데이터: {metadata.get('total_original', 0)}개
- 인스교재 선택: {metadata.get('total_questions', 0)}개
- 중개사시험 제외: {metadata.get('excluded_count', 0)}개

📁 카테고리별 분류:"""
        
        categories = metadata.get('categories', {})
        for category, count in categories.items():
            report += f"\n- {category}: {count}개"
        
        report += f"""

✅ 처리 완료 사항:
- QUESTION 필드 원본 보존 (노터치 원칙 준수)
- 인스교재 데이터만 선별 처리
- 4개 카테고리 자동 분류
- JSON 형태 변환 및 저장 완료

📁 저장 위치: {self.json_output_path}
🎯 다음 단계: quiz_handler.py 개발 시작 가능
        """
        
        return report

def main():
    """메인 실행 함수"""
    print("🚀 AICU Season4 CSV→JSON 변환기 시작")
    print("📋 QUESTION 필드 절대 노터치 원칙 준수")
    print("🎯 인스교재 데이터만 처리")
    print()
    
    # 파일 경로 설정
    csv_file = "ins_master_db.csv"
    json_output = "data/questions.json"
    
    # 변환기 생성
    converter = CSVToJSONConverter(csv_file, json_output)
    
    # CSV → JSON 변환
    json_data = converter.convert_csv_to_json()
    
    if json_data:
        # 데이터 검증
        if converter.validate_data(json_data):
            # JSON 파일 저장
            if converter.save_json(json_data):
                # 완료 보고서 출력
                print()
                print(converter.generate_report(json_data))
                return True
            else:
                print("❌ JSON 파일 저장 실패")
        else:
            print("❌ 데이터 검증 실패")
    else:
        print("❌ CSV 변환 실패")
    
    return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 변환 작업 완료! quiz_handler.py 개발을 시작할 수 있습니다.")
    else:
        print("\n💥 변환 작업 실패! 오류를 확인해주세요.")