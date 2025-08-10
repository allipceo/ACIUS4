#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 - 통합 테스트 1단계: 기본 연동 테스트
작성자: 노팀장
작성일: 2025-08-07
목적: 3개 모듈의 기본 import 및 초기화 테스트
"""

import sys
import os

# 상위 모듈 경로 추가 (modules 폴더에서 실행하므로)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_basic_integration():
    """
    1단계: 기본 연동 테스트
    - 3개 모듈 import 테스트
    - 기본 초기화 확인
    """
    print("🚀 AICU Season4 통합 테스트 1단계 시작")
    print("=" * 50)
    
    # 테스트 결과 저장
    test_results = {
        "data_converter": False,
        "quiz_handler": False, 
        "stats_handler": False
    }
    
    try:
        # 1. data_converter 모듈 테스트
        print("📦 data_converter 모듈 테스트...")
        from data_converter import DataConverter
        converter = DataConverter()
        test_results["data_converter"] = True
        print("✅ data_converter 모듈 정상")
        
    except Exception as e:
        print(f"❌ data_converter 오류: {e}")
    
    try:
        # 2. quiz_handler 모듈 테스트  
        print("📦 quiz_handler 모듈 테스트...")
        from quiz_handler import QuizHandler
        quiz = QuizHandler()
        test_results["quiz_handler"] = True
        print("✅ quiz_handler 모듈 정상")
        
    except Exception as e:
        print(f"❌ quiz_handler 오류: {e}")
    
    try:
        # 3. stats_handler 모듈 테스트
        print("📦 stats_handler 모듈 테스트...")
        from stats_handler import StatsHandler
        stats = StatsHandler()
        test_results["stats_handler"] = True
        print("✅ stats_handler 모듈 정상")
        
    except Exception as e:
        print(f"❌ stats_handler 오류: {e}")
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 1단계 테스트 결과 요약")
    print("=" * 50)
    
    success_count = sum(test_results.values())
    total_count = len(test_results)
    
    for module, result in test_results.items():
        status = "✅ 성공" if result else "❌ 실패"
        print(f"{module}: {status}")
    
    print(f"\n총 결과: {success_count}/{total_count} 모듈 성공")
    
    if success_count == total_count:
        print("🎉 1단계 기본 연동 테스트 완료!")
        return True
    else:
        print("⚠️ 일부 모듈에서 오류 발생")
        return False

if __name__ == "__main__":
    test_basic_integration()