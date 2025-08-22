#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
데이터 구조 검증 스크립트
"""

import requests
import json
import re
from datetime import datetime

class DataStructureVerifier:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.session = requests.Session()
        self.results = {
            "verification_start": datetime.now().isoformat(),
            "localStorage_keys": {},
            "data_consistency": {},
            "errors": [],
            "success_count": 0,
            "total_count": 0
        }
        
        # 검증할 localStorage 키 목록
        self.required_keys = [
            'aicu_user_data',
            'aicu_statistics',
            'aicu_real_time_data',
            'aicu_learning_log',
            'aicu_registration_completed',
            'aicu_registration_timestamp'
        ]
        
    def log(self, message: str, level: str = "INFO"):
        """로그 출력"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def verify_localStorage_keys(self):
        """localStorage 키 존재 여부 검증"""
        self.log("🔍 localStorage 키 검증 시작")
        
        try:
            # 홈페이지에서 localStorage 관련 코드 추출
            response = self.session.get(f"{self.base_url}/")
            if response.status_code != 200:
                raise Exception("홈페이지 접근 실패")
            
            content = response.text
            
            # 각 키의 존재 여부 확인
            for key in self.required_keys:
                key_exists = key in content
                self.results["localStorage_keys"][key] = {
                    "exists": key_exists,
                    "status": "✅ 존재" if key_exists else "❌ 없음"
                }
                
                if key_exists:
                    self.log(f"✅ {key}: 존재함")
                    self.results["success_count"] += 1
                else:
                    self.log(f"❌ {key}: 없음")
                    self.results["errors"].append(f"localStorage 키 없음: {key}")
                
                self.results["total_count"] += 1
                
        except Exception as e:
            self.log(f"localStorage 키 검증 실패: {str(e)}", "ERROR")
            self.results["errors"].append(f"localStorage 키 검증 실패: {str(e)}")
    
    def verify_data_format(self):
        """데이터 형식 정확성 검증"""
        self.log("🔍 데이터 형식 검증 시작")
        
        try:
            # 기본학습 페이지에서 데이터 형식 확인
            response = self.session.get(f"{self.base_url}/basic-learning")
            if response.status_code != 200:
                raise Exception("기본학습 페이지 접근 실패")
            
            content = response.text
            
            # JSON 형식 검증
            json_patterns = [
                r'JSON\.parse\(localStorage\.getItem\([\'"]([^\'"]+)[\'"]\)\)',
                r'localStorage\.setItem\([\'"]([^\'"]+)[\'"],\s*JSON\.stringify\(',
                r'JSON\.stringify\(([^)]+)\)'
            ]
            
            json_usage_found = any(re.search(pattern, content) for pattern in json_patterns)
            
            self.results["data_consistency"]["json_format"] = {
                "valid": json_usage_found,
                "status": "✅ JSON 형식 사용" if json_usage_found else "❌ JSON 형식 미사용"
            }
            
            if json_usage_found:
                self.log("✅ JSON 형식 사용 확인")
                self.results["success_count"] += 1
            else:
                self.log("❌ JSON 형식 사용 미확인")
                self.results["errors"].append("JSON 형식 사용 미확인")
            
            self.results["total_count"] += 1
            
        except Exception as e:
            self.log(f"데이터 형식 검증 실패: {str(e)}", "ERROR")
            self.results["errors"].append(f"데이터 형식 검증 실패: {str(e)}")
    
    def verify_data_consistency(self):
        """데이터 일관성 검증"""
        self.log("🔍 데이터 일관성 검증 시작")
        
        try:
            # 여러 페이지에서 동일한 데이터 구조 사용 확인
            pages = [
                "/basic-learning",
                "/large-category-learning",
                "/settings"
            ]
            
            consistency_check = {}
            
            for page in pages:
                response = self.session.get(f"{self.base_url}{page}")
                if response.status_code == 200:
                    content = response.text
                    
                    # 각 페이지에서 localStorage 키 사용 확인
                    page_keys = {}
                    for key in self.required_keys:
                        page_keys[key] = key in content
                    
                    consistency_check[page] = page_keys
            
            # 일관성 분석
            all_pages_consistent = True
            for key in self.required_keys:
                key_usage = [consistency_check[page][key] for page in consistency_check.keys()]
                if not all(key_usage) and any(key_usage):
                    all_pages_consistent = False
                    self.results["errors"].append(f"키 {key}의 페이지별 사용 불일치")
            
            self.results["data_consistency"]["cross_page"] = {
                "consistent": all_pages_consistent,
                "status": "✅ 페이지 간 일관성" if all_pages_consistent else "❌ 페이지 간 불일치"
            }
            
            if all_pages_consistent:
                self.log("✅ 페이지 간 데이터 일관성 확인")
                self.results["success_count"] += 1
            else:
                self.log("❌ 페이지 간 데이터 불일치 발견")
            
            self.results["total_count"] += 1
            
        except Exception as e:
            self.log(f"데이터 일관성 검증 실패: {str(e)}", "ERROR")
            self.results["errors"].append(f"데이터 일관성 검증 실패: {str(e)}")
    
    def run_verification(self):
        """전체 데이터 구조 검증 실행"""
        self.log("🚀 데이터 구조 검증 시작")
        self.log("=" * 50)
        
        # 1. localStorage 키 검증
        self.verify_localStorage_keys()
        
        # 2. 데이터 형식 검증
        self.verify_data_format()
        
        # 3. 데이터 일관성 검증
        self.verify_data_consistency()
        
        # 결과 요약
        self.results["verification_end"] = datetime.now().isoformat()
        self.results["total_duration"] = (
            datetime.fromisoformat(self.results["verification_end"]) - 
            datetime.fromisoformat(self.results["verification_start"])
        ).total_seconds()
        
        self.log("✅ 데이터 구조 검증 완료")
        return self.results
    
    def save_results(self, filename: str = "data_structure_verification_results.json"):
        """결과 저장"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        self.log(f"결과 저장 완료: {filename}")

if __name__ == "__main__":
    verifier = DataStructureVerifier()
    results = verifier.run_verification()
    verifier.save_results()
    
    print("\n" + "=" * 50)
    print("🎉 데이터 구조 검증 완료!")
    print(f"📊 총 실행 시간: {results.get('total_duration', 0):.2f}초")
    print(f"✅ 성공: {results.get('success_count', 0)}")
    print(f"❌ 실패: {len(results.get('errors', []))}")
    print(f"📈 성공률: {(results.get('success_count', 0) / results.get('total_count', 1) * 100):.1f}%")
    print("=" * 50)
