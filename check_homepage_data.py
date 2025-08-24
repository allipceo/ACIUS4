#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU S4 - 홈페이지 데이터 출처 확인 스크립트
예상점수와 합격확률이 하드코딩된 값인지 확인
"""

import requests
import json
import re
from datetime import datetime

def check_homepage_data():
    """홈페이지 데이터 출처 확인"""
    print("🔍 홈페이지 데이터 출처 확인 시작")
    print("=" * 60)
    
    try:
        # 1. 홈페이지 접근
        response = requests.get("http://localhost:5000/", timeout=10)
        if response.status_code != 200:
            print(f"❌ 홈페이지 접근 실패: HTTP {response.status_code}")
            return False
        
        print("✅ 홈페이지 접근 성공")
        
        # 2. 예상점수 및 합격확률 섹션 확인
        content = response.text
        
        # 예상점수 관련 키워드 검색
        score_keywords = [
            "전체 평균:",
            "합격 확률",
            "재산보험",
            "특종보험", 
            "배상책임보험",
            "해상보험",
            "83점",
            "63점",
            "33점",
            "0점",
            "32%",
            "45점"
        ]
        
        found_keywords = []
        for keyword in score_keywords:
            if keyword in content:
                found_keywords.append(keyword)
        
        print(f"📊 발견된 수치 키워드: {found_keywords}")
        
        # 3. 하드코딩된 값 패턴 확인
        hardcoded_patterns = [
            r'전체 평균: (\d+)점',
            r'합격 확률.*?(\d+)%',
            r'재산보험.*?(\d+)점',
            r'특종보험.*?(\d+)점',
            r'배상책임보험.*?(\d+)점',
            r'해상보험.*?(\d+)점'
        ]
        
        print("\n🔍 하드코딩된 값 패턴 검색:")
        for pattern in hardcoded_patterns:
            matches = re.findall(pattern, content)
            if matches:
                print(f"   패턴 '{pattern}': {matches}")
        
        # 4. JavaScript 파일에서 하드코딩된 값 확인
        js_files = [
            "/static/js/predicted_scores.js",
            "/static/js/central_data_manager.js",
            "/static/js/guest_mode_defaults.js"
        ]
        
        print("\n📁 JavaScript 파일에서 하드코딩된 값 확인:")
        for js_file in js_files:
            try:
                js_response = requests.get(f"http://localhost:5000{js_file}", timeout=5)
                if js_response.status_code == 200:
                    js_content = js_response.text
                    
                    # 하드코딩된 숫자 패턴 검색
                    hardcoded_numbers = re.findall(r'(\d+)(?:\s*점|\s*%)', js_content)
                    if hardcoded_numbers:
                        print(f"   {js_file}: {hardcoded_numbers[:10]}...")  # 처음 10개만 표시
                    else:
                        print(f"   {js_file}: 하드코딩된 숫자 없음")
                else:
                    print(f"   {js_file}: 접근 실패 (HTTP {js_response.status_code})")
            except Exception as e:
                print(f"   {js_file}: 확인 실패 - {str(e)}")
        
        # 5. localStorage 관련 코드 확인
        print("\n💾 localStorage 관련 코드 확인:")
        localStorage_patterns = [
            r'localStorage\.getItem',
            r'localStorage\.setItem',
            r'aicu_real_time_data',
            r'aicu_statistics',
            r'aicu_user_data'
        ]
        
        for pattern in localStorage_patterns:
            matches = re.findall(pattern, content)
            if matches:
                print(f"   '{pattern}': {len(matches)}개 발견")
        
        # 6. 결론 및 해결 방안 제시
        print("\n" + "=" * 60)
        print("📋 분석 결과 및 해결 방안")
        print("=" * 60)
        
        if "45점" in found_keywords or "32%" in found_keywords:
            print("⚠️ 하드코딩된 값이 발견되었습니다!")
            print("   - 전체 평균: 45점")
            print("   - 합격 확률: 32%")
            print("   - 이 값들은 초기화 후에도 사라지지 않음")
            print("\n🔧 해결 방안:")
            print("   1. predicted_scores.js에서 하드코딩된 기본값 제거")
            print("   2. 데이터가 없을 때 0으로 표시하도록 수정")
            print("   3. localStorage 초기화 후 예상점수 계산 로직 점검")
        else:
            print("✅ 하드코딩된 값이 발견되지 않았습니다.")
            print("   다른 원인을 확인해야 합니다.")
        
        return True
        
    except Exception as e:
        print(f"❌ 홈페이지 데이터 확인 실패: {str(e)}")
        return False

def check_predicted_scores_logic():
    """예상점수 계산 로직 확인"""
    print("\n🔍 예상점수 계산 로직 확인")
    print("=" * 60)
    
    try:
        # predicted_scores.js 파일 내용 확인
        response = requests.get("http://localhost:5000/static/js/predicted_scores.js", timeout=5)
        if response.status_code == 200:
            content = response.text
            
            # 데이터가 없을 때의 처리 로직 확인
            empty_data_patterns = [
                r'return \{\}',
                r'return \{\s*\}',
                r'if.*?length.*?0',
                r'if.*?empty',
                r'default.*?0'
            ]
            
            print("📊 빈 데이터 처리 로직 확인:")
            for pattern in empty_data_patterns:
                matches = re.findall(pattern, content)
                if matches:
                    print(f"   '{pattern}': {len(matches)}개 발견")
            
            # 하드코딩된 기본값 확인
            hardcoded_defaults = re.findall(r'(\d+)(?:\s*점|\s*%)', content)
            if hardcoded_defaults:
                print(f"\n⚠️ 하드코딩된 숫자 발견: {hardcoded_defaults[:10]}...")
            else:
                print("\n✅ 하드코딩된 숫자 없음")
                
        else:
            print(f"❌ predicted_scores.js 접근 실패: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ 예상점수 계산 로직 확인 실패: {str(e)}")

def main():
    """메인 실행 함수"""
    print("🚀 AICU S4 홈페이지 데이터 출처 확인")
    print("=" * 60)
    
    # 1. 홈페이지 데이터 확인
    if check_homepage_data():
        # 2. 예상점수 계산 로직 확인
        check_predicted_scores_logic()
        
        print("\n" + "=" * 60)
        print("🎯 다음 단계")
        print("=" * 60)
        print("1. 브라우저에서 F12를 눌러 개발자 도구 열기")
        print("2. Console 탭에서 다음 명령어 실행:")
        print("   console.log('localStorage 내용:');")
        print("   console.log(localStorage);")
        print("3. Application 탭에서 localStorage 확인")
        print("4. 예상점수 계산 함수 직접 호출:")
        print("   window.predictedScoresManager.calculatePredictedScores();")
        
    else:
        print("❌ 데이터 확인 실패")

if __name__ == "__main__":
    main()
