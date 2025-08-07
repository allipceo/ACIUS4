#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - QuizHandler 채점 로직 수정
작성자: 노팀장
작성일: 2025-08-07
목적: _check_answer 메서드 오류 수정
"""

# QuizHandler 클래스의 _check_answer 메서드만 수정합니다
# 기존 quiz_handler.py에서 다음 메서드를 찾아 교체해 주세요:

def _check_answer(self, user_answer: str, correct_answer: str) -> bool:
    """
    답안 정확성 확인 (수정된 버전)
    
    Args:
        user_answer: 사용자 답안
        correct_answer: 정답
        
    Returns:
        bool: 정답 여부
    """
    # 정규화 (공백 제거, 대문자 변환)
    user_normalized = str(user_answer).upper().strip()
    correct_normalized = str(correct_answer).upper().strip()
    
    print(f"🔍 채점 디버그:")
    print(f"  사용자 답안: '{user_answer}' -> '{user_normalized}'")
    print(f"  정답: '{correct_answer}' -> '{correct_normalized}'")
    
    # 1차: 직접 비교
    if user_normalized == correct_normalized:
        print(f"  ✅ 직접 비교 일치: {user_normalized} == {correct_normalized}")
        return True
    
    # 2차: 진위형 변환 비교
    true_values = ["O", "참", "TRUE", "T", "1", "YES", "Y"]
    false_values = ["X", "거짓", "FALSE", "F", "0", "NO", "N"]
    
    # 사용자 답안과 정답을 모두 불린으로 변환
    user_is_true = user_normalized in true_values
    correct_is_true = correct_normalized in true_values
    
    user_is_false = user_normalized in false_values
    correct_is_false = correct_normalized in false_values
    
    print(f"  사용자 답안 분류: True={user_is_true}, False={user_is_false}")
    print(f"  정답 분류: True={correct_is_true}, False={correct_is_false}")
    
    # 3차: 불린 비교
    if (user_is_true and correct_is_true) or (user_is_false and correct_is_false):
        print(f"  ✅ 불린 비교 일치")
        return True
    
    # 4차: 숫자 선택지 비교 (1,2,3,4)
    if user_normalized.isdigit() and correct_normalized.isdigit():
        if user_normalized == correct_normalized:
            print(f"  ✅ 숫자 비교 일치: {user_normalized} == {correct_normalized}")
            return True
    
    print(f"  ❌ 모든 비교 불일치")
    return False