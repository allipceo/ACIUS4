#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
홈으로 버튼 기능 테스트 시뮬레이션
기본학습과 대분류학습에서 홈으로 버튼이 정상 작동하는지 확인
"""

import requests
import re
from urllib.parse import urljoin

def test_home_button_functionality():
    """홈으로 버튼 기능 테스트"""
    print("🏠 홈으로 버튼 기능 테스트 시작")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    test_results = []
    
    # 1. 기본학습 페이지 테스트
    print("\n1️⃣ 기본학습 페이지 홈으로 버튼 테스트")
    try:
        response = requests.get(f"{base_url}/basic-learning")
        if response.status_code == 200:
            content = response.text
            
            # goToHome 함수 존재 확인
            if 'function goToHome()' in content:
                print("✅ goToHome 함수 발견")
                test_results.append(("기본학습 goToHome 함수", True))
            else:
                print("❌ goToHome 함수 없음")
                test_results.append(("기본학습 goToHome 함수", False))
            
            # 홈으로 버튼 onclick 이벤트 확인
            if 'onclick="goToHome()"' in content:
                print("✅ 홈으로 버튼 onclick 이벤트 발견")
                test_results.append(("기본학습 홈으로 버튼 onclick", True))
            else:
                print("❌ 홈으로 버튼 onclick 이벤트 없음")
                test_results.append(("기본학습 홈으로 버튼 onclick", False))
                
        else:
            print(f"❌ 기본학습 페이지 로드 실패: {response.status_code}")
            test_results.append(("기본학습 페이지 로드", False))
            
    except Exception as e:
        print(f"❌ 기본학습 페이지 테스트 오류: {e}")
        test_results.append(("기본학습 페이지 테스트", False))
    
    # 2. 대분류학습 페이지 테스트
    print("\n2️⃣ 대분류학습 페이지 홈으로 버튼 테스트")
    try:
        response = requests.get(f"{base_url}/large-category-learning")
        if response.status_code == 200:
            content = response.text
            
            # 홈으로 링크 확인
            if 'href="/home"' in content:
                print("✅ 홈으로 링크 발견")
                test_results.append(("대분류학습 홈으로 링크", True))
            else:
                print("❌ 홈으로 링크 없음")
                test_results.append(("대분류학습 홈으로 링크", False))
                
        else:
            print(f"❌ 대분류학습 페이지 로드 실패: {response.status_code}")
            test_results.append(("대분류학습 페이지 로드", False))
            
    except Exception as e:
        print(f"❌ 대분류학습 페이지 테스트 오류: {e}")
        test_results.append(("대분류학습 페이지 테스트", False))
    
    # 3. 홈 페이지 접근 테스트
    print("\n3️⃣ 홈 페이지 접근 테스트")
    try:
        response = requests.get(f"{base_url}/home")
        if response.status_code == 200:
            print("✅ 홈 페이지 정상 접근")
            test_results.append(("홈 페이지 접근", True))
        else:
            print(f"❌ 홈 페이지 접근 실패: {response.status_code}")
            test_results.append(("홈 페이지 접근", False))
            
    except Exception as e:
        print(f"❌ 홈 페이지 테스트 오류: {e}")
        test_results.append(("홈 페이지 테스트", False))
    
    # 4. 루트 페이지 접근 테스트
    print("\n4️⃣ 루트 페이지 접근 테스트")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ 루트 페이지 정상 접근")
            test_results.append(("루트 페이지 접근", True))
        else:
            print(f"❌ 루트 페이지 접근 실패: {response.status_code}")
            test_results.append(("루트 페이지 접근", False))
            
    except Exception as e:
        print(f"❌ 루트 페이지 테스트 오류: {e}")
        test_results.append(("루트 페이지 테스트", False))
    
    # 결과 요약
    print("\n" + "=" * 50)
    print("📊 테스트 결과 요약")
    print("=" * 50)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ 통과" if result else "❌ 실패"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n총 {total}개 테스트 중 {passed}개 통과 ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 모든 테스트 통과! 홈으로 버튼이 정상 작동합니다.")
        return True
    else:
        print(f"\n⚠️ {total-passed}개 테스트 실패. 추가 확인이 필요합니다.")
        return False

def analyze_home_button_implementation():
    """홈으로 버튼 구현 분석"""
    print("\n🔍 홈으로 버튼 구현 분석")
    print("=" * 50)
    
    # Flask 라우트 확인
    try:
        with open('app_v4.9.py', 'r', encoding='utf-8') as f:
            app_content = f.read()
        
        if '@app.route(\'/home\')' in app_content:
            print("✅ Flask /home 라우트 발견")
        else:
            print("❌ Flask /home 라우트 없음")
            
        if '@app.route(\'/\')' in app_content:
            print("✅ Flask 루트 라우트 발견")
        else:
            print("❌ Flask 루트 라우트 없음")
            
    except Exception as e:
        print(f"❌ Flask 앱 파일 분석 오류: {e}")
    
    # HTML 템플릿 확인
    try:
        with open('templates/basic_learning.html', 'r', encoding='utf-8') as f:
            basic_content = f.read()
        
        if 'function goToHome()' in basic_content:
            print("✅ 기본학습 goToHome 함수 발견")
        else:
            print("❌ 기본학습 goToHome 함수 없음")
            
    except Exception as e:
        print(f"❌ 기본학습 템플릿 분석 오류: {e}")
    
    try:
        with open('templates/large_category_learning.html', 'r', encoding='utf-8') as f:
            large_content = f.read()
        
        if 'href="/home"' in large_content:
            print("✅ 대분류학습 홈으로 링크 발견")
        else:
            print("❌ 대분류학습 홈으로 링크 없음")
            
    except Exception as e:
        print(f"❌ 대분류학습 템플릿 분석 오류: {e}")

if __name__ == "__main__":
    print("🚀 홈으로 버튼 테스트 시뮬레이션 시작")
    print("=" * 60)
    
    # 구현 분석
    analyze_home_button_implementation()
    
    # 기능 테스트
    success = test_home_button_functionality()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 홈으로 버튼 문제 해결 완료!")
        print("✅ 기본학습과 대분류학습에서 홈으로 버튼이 정상 작동합니다.")
    else:
        print("⚠️ 홈으로 버튼 문제가 일부 남아있습니다.")
        print("추가 디버깅이 필요합니다.")
    
    print("=" * 60)
