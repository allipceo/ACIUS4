#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - data_converter ANSWER 필드 수정
작성자: 노팀장
작성일: 2025-08-07
목적: ANSWER 필드 매핑 오류 수정 및 JSON 재생성
"""

import csv
import json
import os
from datetime import datetime
from typing import Dict, List, Any

def fix_answer_field_mapping():
    """ANSWER 필드 매핑 수정 및 JSON 재생성"""
    
    print("🔧 AICU Season4 ANSWER 필드 수정 시작")
    print("🎯 CSV ANSWER → JSON answer 매핑 수정")
    print("=" * 50)
    
    csv_file = "../data/ins_master_db.csv"
    json_output = "../data/questions.json"
    
    questions = []
    categories = {
        "06재산보험": [],
        "07특종보험": [],
        "08배상책임보험": [],
        "09해상보험": []
    }
    
    total_count = 0
    ins_count = 0
    excluded_count = 0
    answer_field_check = 0
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            # 헤더 확인
            print(f"📋 CSV 헤더 확인: {reader.fieldnames}")
            
            for row in reader:
                total_count += 1
                
                # SOURCE 필드로 인스교재만 필터링
                source = row.get('SOURCE', '').strip()
                if source == '인스교재':
                    ins_count += 1
                    
                    # ANSWER 필드 특별 확인
                    answer_value = row.get('ANSWER', '')
                    if answer_value and answer_value.strip():
                        answer_field_check += 1
                    
                    # 처음 5개는 디버그 로그
                    if ins_count <= 5:
                        print(f"문제 {ins_count}:")
                        print(f"  QCODE: {row.get('QCODE', 'N/A')}")
                        print(f"  ANSWER: '{answer_value}' (타입: {type(answer_value)})")
                        print(f"  QUESTION: {row.get('QUESTION', 'N/A')[:50]}...")
                    
                    # QUESTION 필드 절대 노터치 원칙
                    question_data = {
                        "index": row.get('INDEX', ''),
                        "qcode": row.get('QCODE', ''),
                        "question": row.get('QUESTION', ''),  # 절대 수정 금지
                        "answer": answer_value,  # ⭐ 이 부분 특별 주의
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
                    
                    questions.append(question_data)
                    
                    # 카테고리별 분류
                    layer1 = row.get('LAYER1', '')
                    if layer1 in categories:
                        categories[layer1].append(question_data)
                else:
                    excluded_count += 1
        
        # 결과 출력
        print("=" * 50)
        print(f"전체 데이터: {total_count}개")
        print(f"인스교재: {ins_count}개 선택됨")
        print(f"중개사시험: {excluded_count}개 제외됨")
        print(f"ANSWER 필드 값 있는 문제: {answer_field_check}개")
        print("=" * 50)
        
        # 카테고리별 통계
        for category, cat_questions in categories.items():
            print(f"{category}: {len(cat_questions)}개")
        
        # ANSWER 필드 검증
        print("\n🔍 ANSWER 필드 검증:")
        for i, question in enumerate(questions[:10]):
            answer = question.get('answer', '')
            print(f"문제 {i+1}: ANSWER = '{answer}' (길이: {len(answer)})")
        
        # JSON 구조 생성
        json_data = {
            "metadata": {
                "total_questions": len(questions),
                "source_filter": "인스교재",
                "total_original": total_count,
                "excluded_count": excluded_count,
                "answer_field_count": answer_field_check,
                "categories": {cat: len(questions) for cat, questions in categories.items()},
                "conversion_date": datetime.now().isoformat(),
                "source_file": "ins_master_db.csv",
                "version": "AICU Season4 v1.1 (ANSWER 수정)"
            },
            "questions": questions
        }
        
        # 안전한 JSON 저장
        temp_path = json_output + ".tmp"
        
        with open(temp_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        # 임시 파일이 완전히 작성되면 원본 파일로 이동
        if os.path.exists(temp_path):
            if os.path.exists(json_output):
                os.remove(json_output)
            os.rename(temp_path, json_output)
            print(f"✅ JSON 파일 저장 완료: {json_output}")
            
            # 저장된 파일 검증
            print("\n📊 저장된 JSON 검증:")
            with open(json_output, 'r', encoding='utf-8') as f:
                saved_data = json.load(f)
                saved_questions = saved_data.get('questions', [])
                
                print(f"총 문제 수: {len(saved_questions)}개")
                
                # 처음 5개 문제의 ANSWER 필드 확인
                for i, q in enumerate(saved_questions[:5]):
                    answer = q.get('answer', '')
                    qcode = q.get('qcode', 'N/A')
                    print(f"저장된 문제 {i+1} ({qcode}): answer = '{answer}'")
            
            print("\n🎉 ANSWER 필드 수정 완료!")
            print("🎯 4단계 테스트 재실행 가능!")
            return True
        else:
            print("❌ JSON 파일 저장 실패")
            return False
            
    except Exception as e:
        print(f"❌ ANSWER 필드 수정 오류: {e}")
        return False

if __name__ == "__main__":
    success = fix_answer_field_mapping()
    if success:
        print("\n✅ 수정 완료! 4단계 테스트 재실행하세요!")
    else:
        print("\n❌ 수정 실패! 오류를 확인해주세요.")