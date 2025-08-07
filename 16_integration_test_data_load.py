#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - 통합 테스트 2단계: 데이터 로드 테스트
작성자: 노팀장
작성일: 2025-08-07
목적: questions.json 로드 및 789개 문제 수 검증
"""

import sys
import os
import json

# 상위 모듈 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_data_load():
    """
    2단계: 데이터 로드 테스트
    - questions.json 로드 확인
    - 789개 문제 수 검증
    - 데이터 구조 검증
    """
    print("🚀 AICU Season4 통합 테스트 2단계 시작")
    print("📊 데이터 로드 및 검증 테스트")
    print("=" * 50)
    
    # 테스트 결과 저장
    test_results = {
        "file_exists": False,
        "json_load": False,
        "question_count": False,
        "data_structure": False
    }
    
    try:
        # 1. questions.json 파일 존재 확인
        print("📁 questions.json 파일 존재 확인...")
        data_path = "../data/questions.json"
        
        if os.path.exists(data_path):
            test_results["file_exists"] = True
            print("✅ questions.json 파일 존재 확인")
        else:
            print("❌ questions.json 파일을 찾을 수 없습니다")
            return False
            
    except Exception as e:
        print(f"❌ 파일 확인 오류: {e}")
        return False
    
    try:
        # 2. JSON 파일 로드 테스트
        print("📦 JSON 파일 로드 테스트...")
        
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        test_results["json_load"] = True
        print("✅ JSON 파일 로드 성공")
        
    except Exception as e:
        print(f"❌ JSON 로드 오류: {e}")
        return False
    
    try:
        # 3. 문제 수 검증 (789개 예상)
        print("🔢 문제 수 검증...")
        
        questions = data.get("questions", [])
        metadata = data.get("metadata", {})
        
        question_count = len(questions)
        expected_count = 789
        
        print(f"로드된 문제 수: {question_count}개")
        print(f"예상 문제 수: {expected_count}개")
        
        if question_count == expected_count:
            test_results["question_count"] = True
            print("✅ 문제 수 검증 성공")
        else:
            print(f"⚠️ 문제 수 불일치: {question_count} vs {expected_count}")
            
    except Exception as e:
        print(f"❌ 문제 수 검증 오류: {e}")
    
    try:
        # 4. 데이터 구조 검증
        print("🏗️ 데이터 구조 검증...")
        
        # 메타데이터 확인
        if metadata:
            print(f"메타데이터 총 문제수: {metadata.get('total_questions', 'N/A')}")
            print(f"소스 필터: {metadata.get('source_filter', 'N/A')}")
            print(f"변환 날짜: {metadata.get('conversion_date', 'N/A')}")
        
        # 첫 번째 문제 구조 확인
        if questions and len(questions) > 0:
            first_question = questions[0]
            required_fields = ["qcode", "question", "answer", "layer1", "source"]
            
            missing_fields = []
            for field in required_fields:
                if field not in first_question:
                    missing_fields.append(field)
            
            if not missing_fields:
                test_results["data_structure"] = True
                print("✅ 데이터 구조 검증 성공")
                print(f"첫 번째 문제 코드: {first_question.get('qcode', 'N/A')}")
                print(f"첫 번째 문제 출처: {first_question.get('source', 'N/A')}")
            else:
                print(f"❌ 필수 필드 누락: {missing_fields}")
        
    except Exception as e:
        print(f"❌ 데이터 구조 검증 오류: {e}")
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 2단계 테스트 결과 요약")
    print("=" * 50)
    
    success_count = sum(test_results.values())
    total_count = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{test_name}: {status}")
    
    print(f"\n총 결과: {success_count}/{total_count} 테스트 성공")
    
    if success_count == total_count:
        print("🎉 2단계 데이터 로드 테스트 완료!")
        return True
    else:
        print("⚠️ 일부 테스트에서 오류 발생")
        return False

if __name__ == "__main__":
    test_data_load()