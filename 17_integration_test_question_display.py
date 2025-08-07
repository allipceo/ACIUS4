#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - 통합 테스트 3단계: 문제 표시 테스트
작성자: 노팀장
작성일: 2025-08-07
목적: 첫 번째 문제 표시 및 QUESTION 필드 노터치 확인
"""

import sys
import os

# 상위 모듈 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_question_display():
    """
    3단계: 문제 표시 테스트
    - QuizHandler로 문제 로드
    - 첫 번째 문제 표시
    - QUESTION 필드 노터치 확인
    """
    print("🚀 AICU Season4 통합 테스트 3단계 시작")
    print("📋 문제 표시 및 QUESTION 필드 노터치 테스트")
    print("=" * 50)
    
    # 테스트 결과 저장
    test_results = {
        "quiz_handler_init": False,
        "questions_load": False,
        "first_question_display": False,
        "question_field_intact": False
    }
    
    try:
        # 1. QuizHandler 초기화
        print("🎯 QuizHandler 초기화...")
        from quiz_handler import QuizHandler
        
        quiz = QuizHandler()
        test_results["quiz_handler_init"] = True
        print("✅ QuizHandler 초기화 성공")
        
    except Exception as e:
        print(f"❌ QuizHandler 초기화 오류: {e}")
        return False
    
    try:
        # 2. 문제 데이터 로드
        print("📦 문제 데이터 로드...")
        
        load_result = quiz.load_questions()
        if load_result:
            test_results["questions_load"] = True
            print(f"✅ 문제 로드 성공: {len(quiz.questions)}개")
        else:
            print("❌ 문제 로드 실패")
            return False
            
    except Exception as e:
        print(f"❌ 문제 로드 오류: {e}")
        return False
    
    try:
        # 3. 첫 번째 문제 표시 테스트
        print("📋 첫 번째 문제 표시 테스트...")
        
        display_result = quiz.display_question(0)
        
        if display_result.get("success"):
            test_results["first_question_display"] = True
            print("✅ 문제 표시 성공")
            
            # 문제 정보 출력
            q_data = display_result.get("question_data", {})
            print(f"문제 번호: {q_data.get('index', 'N/A')}/{q_data.get('total', 'N/A')}")
            print(f"문제 코드: {q_data.get('qcode', 'N/A')}")
            print(f"문제 유형: {q_data.get('answer_type', 'N/A')}")
            print(f"선택지: {q_data.get('choices', [])}")
            
        else:
            print("❌ 문제 표시 실패")
            print(f"오류 메시지: {display_result.get('message', 'N/A')}")
            return False
            
    except Exception as e:
        print(f"❌ 문제 표시 오류: {e}")
        return False
    
    try:
        # 4. QUESTION 필드 노터치 검증
        print("🛡️ QUESTION 필드 노터치 검증...")
        
        if display_result.get("success"):
            q_data = display_result.get("question_data", {})
            original_question = q_data.get("question", "")
            
            # 원본 문제와 비교
            original_from_data = quiz.questions[0].get("QUESTION", "")
            
            if original_question == original_from_data:
                test_results["question_field_intact"] = True
                print("✅ QUESTION 필드 노터치 원칙 준수")
                print(f"문제 내용 길이: {len(original_question)}자")
                
                # 문제 내용 일부 출력 (너무 길 경우 축약)
                if len(original_question) > 100:
                    preview = original_question[:100] + "..."
                else:
                    preview = original_question
                print(f"문제 내용 미리보기: {preview}")
                
            else:
                print("❌ QUESTION 필드가 변경되었습니다!")
                print(f"원본 길이: {len(original_from_data)}자")
                print(f"표시 길이: {len(original_question)}자")
                
        else:
            print("❌ 문제 데이터를 가져올 수 없습니다")
            
    except Exception as e:
        print(f"❌ QUESTION 필드 검증 오류: {e}")
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 3단계 테스트 결과 요약")
    print("=" * 50)
    
    success_count = sum(test_results.values())
    total_count = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{test_name}: {status}")
    
    print(f"\n총 결과: {success_count}/{total_count} 테스트 성공")
    
    if success_count == total_count:
        print("🎉 3단계 문제 표시 테스트 완료!")
        print("🛡️ QUESTION 필드 노터치 원칙 완벽 준수!")
        return True
    else:
        print("⚠️ 일부 테스트에서 오류 발생")
        return False

if __name__ == "__main__":
    test_question_display()