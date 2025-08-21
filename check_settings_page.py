#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
설정 페이지 내용 확인 스크립트
"""

import requests

def check_settings_page():
    """설정 페이지 내용 확인"""
    try:
        response = requests.get("http://localhost:5000/settings")
        print(f"Status Code: {response.status_code}")
        print(f"Content Length: {len(response.text)}")
        print("\n" + "="*50)
        print("설정 페이지 내용 (처음 500자):")
        print("="*50)
        print(response.text[:500])
        print("\n" + "="*50)
        print("키워드 검색 결과:")
        print("="*50)
        
        keywords = [
            "user-registration-form",
            "clearAllData", 
            "goToHome",
            "aicu_user_data",
            "localStorage",
            "사용자 등록",
            "홈으로 돌아가기"
        ]
        
        for keyword in keywords:
            count = response.text.count(keyword)
            print(f"{keyword}: {count}회 발견")
            
    except Exception as e:
        print(f"에러: {e}")

if __name__ == "__main__":
    check_settings_page()
