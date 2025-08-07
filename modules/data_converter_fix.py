#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - data_converter.py 클래스 수정
작성자: 노팀장
작성일: 2025-08-07
목적: DataConverter 클래스 정의 및 JSON 파일 재생성
"""

import csv
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

class DataConverter:
    """CSV를 JSON으로 변환하는 클래스"""
    
    def __init__(self, csv_path: str = "../data/ins_master_db.csv", json_path: str = "../data/questions.json"):
        """
        초기화
        
        Args:
            csv_path: CSV 파일 경로
            json_path: JSON 파일 경로
        """
        self.csv_path = csv_path
        self.json_path = json_path
        self.questions = []
        self.categories = {
            "06재산보험": [],
            "07특종보험": [],
            "08배상책임보험": [],
            "09해상보험": []
        }
        self.total_count = 0
        self.ins_count = 0
        self.excluded_count = 0
    
    def convert_csv_to_json(self) -> Optional[Dict[str, Any]]:
        """
        CSV를 JSON으로 변환
        
        Returns:
            Dict: 변환된 JSON 데이터 또는 None
        """
        print(f"CSV 파일 변환 시작: {self.csv_path}")
        print("=" * 50)
        
        try:
            with open(self.csv_path, 'r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                for row in reader:
                    self.total_count += 1
                    
                    # SOURCE 필드로 인스교재만 필터링
                    source = row.get('SOURCE', '').strip()
                    if source == '인스교재':
                        self.ins_count += 1
                        
                        # QUESTION 필드 절대 노터치 원칙
                        question_data = {
                            "index": row.get('INDEX', ''),
                            "qcode": row.get('QCODE', ''),
                            "question": row.get('QUESTION', ''),  # 절대 수정 금지
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
                        
                        # 카테고리별 분류
                        layer1 = row.get('LAYER1', '')
                        if layer1 in self.categories:
                            self.categories[layer1].append(question_data)
                    else:
                        self.excluded_count += 1
            
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
                    "categories": {cat: len(questions) for cat, questions in self.categories.items()},
                    "conversion_date": datetime.now().isoformat(),
                    "source_file": "ins_master_db.csv",
                    "version": "AICU Season4 v1.0"
                },
                "questions": self.questions
            }
            
            return json_data
            
        except Exception as e:
            print(f"❌ CSV 변환 오류: {e}")
            return None
    
    def save_json(self, json_data: Dict[str, Any]) -> bool:
        """
        JSON 데이터 저장 (안전한 방식)
        
        Args:
            json_data: 저장할 JSON 데이터
            
        Returns:
            bool: 저장 성공 여부
        """
        try:
            # 임시 파일에 먼저 저장
            temp_path = self.json_path + ".tmp"
            
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=2)
            
            # 임시 파일이 완전히 작성되면 원본 파일로 이동
            if os.path.exists(temp_path):
                if os.path.exists(self.json_path):
                    os.remove(self.json_path)
                os.rename(temp_path, self.json_path)
                print(f"✅ JSON 파일 저장 완료: {self.json_path}")
                return True
            
        except Exception as e:
            print(f"❌ JSON 저장 오류: {e}")
            # 임시 파일 정리
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return False
        
        return False

def main():
    """JSON 파일 재생성"""
    print("🔧 AICU Season4 JSON 파일 재생성 시작")
    print("🛡️ QUESTION 필드 절대 노터치 원칙 준수")
    
    # DataConverter 인스턴스 생성
    converter = DataConverter()
    
    # CSV → JSON 변환
    json_data = converter.convert_csv_to_json()
    
    if json_data:
        # JSON 파일 안전 저장
        if converter.save_json(json_data):
            print("✅ JSON 파일 재생성 완료!")
            print("🎯 통합 테스트 재실행 가능")
            return True
        else:
            print("❌ JSON 저장 실패")
    else:
        print("❌ CSV 변환 실패")
    
    return False

if __name__ == "__main__":
    main()