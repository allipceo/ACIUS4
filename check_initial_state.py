#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
완전초기화 상태에서 통계 기능 확인을 위한 초기 상태 확인 스크립트
"""

import requests
import json
import re
from datetime import datetime

def check_initial_state():
    """완전초기화 상태 확인"""
    print("🚀 AICU S4 초기 상태 확인")
    print("=" * 60)
    
    try:
        # 홈페이지 접근
        response = requests.get('http://localhost:5000')
        if response.status_code != 200:
            print(f"❌ 홈페이지 접근 실패: {response.status_code}")
            return False
        
        print("✅ 홈페이지 접근 성공")
        
        # localStorage 관련 데이터 확인
        localStorage_patterns = [
            r'localStorage\.getItem\([\'"]([^\'"]+)[\'"]\)',
            r'localStorage\.setItem\([\'"]([^\'"]+)[\'"]\)',
            r'localStorage\.clear\(\)'
        ]
        
        # 중앙아키텍처 키 확인
        central_keys = [
            'aicu_user_data',
            'aicu_statistics', 
            'aicu_real_time_data',
            'aicu_learning_log',
            'aicu_registration_completed',
            'aicu_registration_timestamp'
        ]
        
        # 게스트 모드 관련 확인
        guest_patterns = [
            r'게스트',
            r'Guest',
            r'guest_mode',
            r'is_guest'
        ]
        
        # 통계 초기화 확인
        zero_patterns = [
            r'0%',
            r'0회',
            r'0문제',
            r'total.*?0',
            r'correct.*?0'
        ]
        
        print("\n📊 초기 상태 분석 결과:")
        print("-" * 40)
        
        # 1. 게스트 모드 상태 확인
        guest_found = any(re.search(pattern, response.text) for pattern in guest_patterns)
        print(f"게스트 모드 상태: {'✅ 확인됨' if guest_found else '❌ 확인되지 않음'}")
        
        # 2. 통계 초기화 상태 확인
        zero_found = any(re.search(pattern, response.text) for pattern in zero_patterns)
        print(f"통계 초기화: {'✅ 0으로 초기화됨' if zero_found else '❌ 초기화되지 않음'}")
        
        # 3. 중앙아키텍처 키 확인
        central_found = any(key in response.text for key in central_keys)
        print(f"중앙아키텍처: {'✅ 키 확인됨' if central_found else '❌ 키 확인되지 않음'}")
        
        # 4. 등록 시점 절대적 보존 확인
        registration_completed_found = 'aicu_registration_completed' in response.text
        registration_timestamp_found = 'aicu_registration_timestamp' in response.text
        print(f"등록 완료 플래그: {'✅ 확인됨' if registration_completed_found else '❌ 확인되지 않음'}")
        print(f"등록 시점 타임스탬프: {'✅ 확인됨' if registration_timestamp_found else '❌ 확인되지 않음'}")
        
        # 5. 예상점수 섹션 제거 확인
        predicted_scores_removed = '예상점수' not in response.text and 'predicted_scores' not in response.text
        print(f"예상점수 섹션 제거: {'✅ 제거됨' if predicted_scores_removed else '❌ 아직 존재'}")
        
        # 6. 중앙아키텍처 기반 통계 섹션 확인
        central_stats_found = '중앙아키텍처 기반 통계' in response.text
        print(f"중앙아키텍처 통계 섹션: {'✅ 존재함' if central_stats_found else '❌ 존재하지 않음'}")
        
        print("\n📋 상세 분석:")
        print("-" * 40)
        
        # localStorage 키 상세 확인
        for key in central_keys:
            key_found = key in response.text
            print(f"  {key}: {'✅' if key_found else '❌'}")
        
        # 게스트 모드 상세 확인
        if '게스트' in response.text:
            print("  게스트 모드: ✅ 정상적으로 표시됨")
        else:
            print("  게스트 모드: ❌ 표시되지 않음")
        
        # 통계 수치 상세 확인
        zero_count = len(re.findall(r'0%|0회|0문제', response.text))
        print(f"  0으로 초기화된 통계 수: {zero_count}개")
        
        print("\n🎯 초기 상태 평가:")
        print("-" * 40)
        
        # 종합 평가
        all_checks = [
            guest_found,
            zero_found, 
            central_found,
            registration_completed_found,
            registration_timestamp_found,
            predicted_scores_removed,
            central_stats_found
        ]
        
        success_count = sum(all_checks)
        total_checks = len(all_checks)
        
        if success_count == total_checks:
            print("✅ 완전초기화 상태: 모든 조건 만족")
            print("   - 게스트 모드로 시작")
            print("   - 모든 통계가 0으로 초기화")
            print("   - 중앙아키텍처 기반")
            print("   - 등록 시점 절대적 보존")
            print("   - 예상점수 섹션 제거됨")
            print("   - 시뮬레이션 준비 완료")
            return True
        else:
            print(f"⚠️ 부분 초기화 상태: {success_count}/{total_checks} 조건 만족")
            print("   - 추가 확인 필요")
            return False
            
    except Exception as e:
        print(f"❌ 초기 상태 확인 실패: {e}")
        return False

def check_localStorage_simulation():
    """localStorage 시뮬레이션 확인"""
    print("\n🔍 localStorage 시뮬레이션 확인")
    print("=" * 40)
    
    try:
        # JavaScript 코드에서 localStorage 사용 패턴 확인
        js_files = [
            'static/js/guest_mode_defaults.js',
            'static/js/central_data_manager.js',
            'static/js/basic_learning_main.js'
        ]
        
        for js_file in js_files:
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # localStorage 키 사용 확인
                keys_found = re.findall(r'localStorage\.getItem\([\'"]([^\'"]+)[\'"]\)', content)
                keys_found.extend(re.findall(r'localStorage\.setItem\([\'"]([^\'"]+)[\'"]\)', content))
                
                print(f"\n📁 {js_file}:")
                for key in set(keys_found):
                    if key.startswith('aicu_'):
                        print(f"  ✅ {key}")
                        
            except FileNotFoundError:
                print(f"  ❌ {js_file}: 파일 없음")
                
    except Exception as e:
        print(f"❌ localStorage 시뮬레이션 확인 실패: {e}")

if __name__ == "__main__":
    print(f"🕐 시뮬레이션 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 초기 상태 확인
    initial_state_ok = check_initial_state()
    
    # localStorage 시뮬레이션 확인
    check_localStorage_simulation()
    
    print(f"\n🕐 시뮬레이션 종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if initial_state_ok:
        print("\n🎉 초기 상태 확인 완료 - 다음 단계 시뮬레이션 준비됨")
    else:
        print("\n⚠️ 초기 상태 확인 실패 - 추가 조치 필요")
