#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API 엔드포인트 검증 스크립트
"""

import requests
import json
from datetime import datetime

class APIEndpointVerifier:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.session = requests.Session()
        self.results = {
            "verification_start": datetime.now().isoformat(),
            "endpoints": {},
            "errors": [],
            "success_count": 0,
            "total_count": 0
        }
        
    def log(self, message: str, level: str = "INFO"):
        """로그 출력"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def verify_endpoint(self, endpoint: str, method: str = "GET", expected_status: int = 200) -> dict:
        """개별 엔드포인트 검증"""
        self.log(f"검증 중: {method} {endpoint}")
        
        try:
            if method == "GET":
                response = self.session.get(f"{self.base_url}{endpoint}")
            elif method == "POST":
                response = self.session.post(f"{self.base_url}{endpoint}")
            else:
                raise ValueError(f"지원하지 않는 HTTP 메서드: {method}")
            
            result = {
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": response.status_code == expected_status,
                "response_time": response.elapsed.total_seconds(),
                "content_length": len(response.content)
            }
            
            if result["success"]:
                self.log(f"✅ 성공: {endpoint} ({response.status_code})")
                self.results["success_count"] += 1
            else:
                self.log(f"❌ 실패: {endpoint} (예상: {expected_status}, 실제: {response.status_code})")
                self.results["errors"].append(f"{endpoint}: {response.status_code}")
            
            self.results["total_count"] += 1
            return result
            
        except Exception as e:
            error_msg = f"{endpoint} 검증 실패: {str(e)}"
            self.log(error_msg, "ERROR")
            self.results["errors"].append(error_msg)
            self.results["total_count"] += 1
            
            return {
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "error": str(e)
            }
    
    def run_verification(self):
        """전체 API 엔드포인트 검증 실행"""
        self.log("🚀 API 엔드포인트 검증 시작")
        self.log("=" * 50)
        
        # 검증할 엔드포인트 목록
        endpoints = [
            {"path": "/", "method": "GET", "expected": 200},
            {"path": "/basic-learning", "method": "GET", "expected": 200},
            {"path": "/large-category-learning", "method": "GET", "expected": 200},
            {"path": "/settings", "method": "GET", "expected": 200},
            {"path": "/register", "method": "GET", "expected": 200},
            {"path": "/user-registration", "method": "GET", "expected": 200},
            {"path": "/debug", "method": "GET", "expected": 200},
            {"path": "/stats-test", "method": "GET", "expected": 200},
            {"path": "/registration-check", "method": "GET", "expected": 200}
        ]
        
        # 각 엔드포인트 검증
        for endpoint_info in endpoints:
            result = self.verify_endpoint(
                endpoint_info["path"],
                endpoint_info["method"],
                endpoint_info["expected"]
            )
            self.results["endpoints"][endpoint_info["path"]] = result
        
        # 결과 요약
        self.results["verification_end"] = datetime.now().isoformat()
        self.results["total_duration"] = (
            datetime.fromisoformat(self.results["verification_end"]) - 
            datetime.fromisoformat(self.results["verification_start"])
        ).total_seconds()
        
        self.log("✅ API 엔드포인트 검증 완료")
        return self.results
    
    def save_results(self, filename: str = "api_verification_results.json"):
        """결과 저장"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        self.log(f"결과 저장 완료: {filename}")

if __name__ == "__main__":
    verifier = APIEndpointVerifier()
    results = verifier.run_verification()
    verifier.save_results()
    
    print("\n" + "=" * 50)
    print("🎉 API 엔드포인트 검증 완료!")
    print(f"📊 총 실행 시간: {results.get('total_duration', 0):.2f}초")
    print(f"✅ 성공: {results.get('success_count', 0)}")
    print(f"❌ 실패: {len(results.get('errors', []))}")
    print(f"📈 성공률: {(results.get('success_count', 0) / results.get('total_count', 1) * 100):.1f}%")
    print("=" * 50)
