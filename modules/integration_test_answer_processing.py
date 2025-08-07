#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - 통합 테스트 4단계: 답안 처리 테스트
작성자: 노팀장
작성일: 2025-08-07
목적: 답안 제출 및 채점 시스템 검증
"""

import sys
import os

# 상위 모듈 경로 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_answer_processing():
    """
    4단계: 답안 처리 테스트
    - 답안 제출 기능 테스트
    - 채점 시스템 검증
    - 정답/오답 판정 확인
    """
    print("🚀 AICU Season4 통합 테스트 4단계 시작")
    print("📝 답안 처리 및 채점 시스템 테스트")
    print("=" * 50)
    
    # 테스트 결과 저장
    test_results = {
        "quiz_setup": False,
        "answer_submission": False,
        "correct_answer_test": False,
        "wrong_answer_test": False
    }
    
    try:
        # 1. QuizHandler 설정
        print("🎯 QuizHandler 설정...")
        from quiz_handler import QuizHandler
        
        quiz = QuizHandler()
        
        # 문제 로드
        if quiz.load_questions():
            test_results["quiz_setup"] = True
            print(f"✅ QuizHandler 설정 성공: {len(quiz.questions)}개 문제")
        else:
            print("❌ 문제 로드 실패")
            return False
            
    except Exception as e:
        print(f"❌ QuizHandler 설정 오류: {e}")
        return False
    
    try:
        # 2. 첫 번째 문제 표시 및 답안 제출 테스트
        print("📋 첫 번째 문제 답안 제출 테스트...")
        
        # 첫 번째 문제 표시
        display_result = quiz.display_question(0)
        
        if display_result.get("success"):
            q_data = display_result.get("question_data", {})
            question_text = q_data.get("question", "")
            answer_type = q_data.get("answer_type", "")
            choices = q_data.get("choices", [])
            
            print(f"문제 유형: {answer_type}")
            print(f"선택지: {choices}")
            print(f"문제 내용: {question_text[:50]}...")
            
            test_results["answer_submission"] = True
            print("✅ 문제 표시 및 답안 구조 확인 성공")
            
        else:
            print("❌ 문제 표시 실패")
            return False
            
    except Exception as e:
        print(f"❌ 문제 표시 오류: {e}")
        return False
    
    try:
        # 3. 정답 제출 테스트
        print("✅ 정답 제출 테스트...")
        
        # 실제 정답 가져오기
        first_question = quiz.questions[0]
        correct_answer = first_question.get("answer", "")
        
        print(f"정답: {correct_answer}")
        
        # 정답 제출
        answer_result = quiz.submit_answer(correct_answer)
        
        if answer_result.get("success"):
            is_correct = answer_result.get("is_correct", False)
            user_answer = answer_result.get("user_answer", "")
            returned_correct = answer_result.get("correct_answer", "")
            
            print(f"제출 답안: {user_answer}")
            print(f"정답: {returned_correct}")
            print(f"채점 결과: {'정답' if is_correct else '오답'}")
            
            if is_correct:
                test_results["correct_answer_test"] = True
                print("✅ 정답 채점 성공")
            else:
                print("❌ 정답 채점 실패 - 정답이 오답으로 판정됨")
                
        else:
            print("❌ 답안 제출 실패")
            print(f"오류 메시지: {answer_result.get('message', 'N/A')}")
            
    except Exception as e:
        print(f"❌ 정답 제출 테스트 오류: {e}")
    
    try:
        # 4. 오답 제출 테스트 (새로운 문제로)
        print("❌ 오답 제출 테스트...")
        
        # 두 번째 문제로 이동
        if len(quiz.questions) > 1:
            display_result = quiz.display_question(1)
            
            if display_result.get("success"):
                # 실제 정답과 다른 답안 제출
                second_question = quiz.questions[1]
                correct_answer = second_question.get("answer", "")
                
                # 의도적으로 틀린 답안 생성
                if correct_answer == "O":
                    wrong_answer = "X"
                elif correct_answer == "X":
                    wrong_answer = "O"
                elif correct_answer == "1":
                    wrong_answer = "2"
                else:
                    wrong_answer = "1"
                
                print(f"정답: {correct_answer}")
                print(f"제출할 오답: {wrong_answer}")
                
                # 오답 제출
                wrong_result = quiz.submit_answer(wrong_answer)
                
                if wrong_result.get("success"):
                    is_correct = wrong_result.get("is_correct", True)
                    
                    if not is_correct:
                        test_results["wrong_answer_test"] = True
                        print("✅ 오답 채점 성공 - 오답이 정확히 오답으로 판정됨")
                    else:
                        print("❌ 오답 채점 실패 - 오답이 정답으로 판정됨")
                else:
                    print("❌ 오답 제출 실패")
                    
        else:
            print("⚠️ 오답 테스트를 위한 두 번째 문제가 없습니다")
            
    except Exception as e:
        print(f"❌ 오답 제출 테스트 오류: {e}")
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 4단계 테스트 결과 요약")
    print("=" * 50)
    
    success_count = sum(test_results.values())
    total_count = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{test_name}: {status}")
    
    print(f"\n총 결과: {success_count}/{total_count} 테스트 성공")
    
    if success_count == total_count:
        print("🎉 4단계 답안 처리 테스트 완료!")
        print("📝 채점 시스템 완벽 동작 확인!")
        return True
    else:
        print("⚠️ 일부 테스트에서 오류 발생")
        return False

if __name__ == "__main__":
    test_answer_processing()