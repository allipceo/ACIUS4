#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ACIU Season4 User Service Module
사용자 데이터 관리 비즈니스 로직

작성자: 코코치
작성일: 2025년 8월 8일
버전: v1.0
"""

import json
import os
import hashlib
from datetime import datetime

class UserService:
    """사용자 데이터 관리 서비스 클래스"""
    
    USER_DATA_FILE = os.path.join("data", "user_progress.json")
    
    def __init__(self):
        self.users_data = self._load_users()
        
    def _load_users(self):
        """사용자 데이터를 파일에서 로드"""
        if os.path.exists(self.USER_DATA_FILE):
            with open(self.USER_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"users": {}, "metadata": {"last_user_id": None}}
        
    def _save_users(self):
        """사용자 데이터를 파일에 저장"""
        with open(self.USER_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.users_data, f, indent=2, ensure_ascii=False)
            
    def create_new_user(self, user_info):
        """새로운 사용자 생성"""
        user_id = self._generate_user_id(user_info['userName'], user_info['userPhone'])
        
        new_user = {
            "userId": user_id,
            "userName": user_info['userName'],
            "userPhone": user_info['userPhone'],
            "examSubject": user_info.get('examSubject', '보험중개사'),
            "examDate": user_info.get('examDate', None),
            "registeredAt": datetime.now().isoformat(),
            "lastLoginAt": datetime.now().isoformat(),
            "stats": self._initialize_user_stats()
        }
        
        self.users_data['users'][user_id] = new_user
        self.users_data['metadata']['last_user_id'] = user_id
        self._save_users()
        
        return new_user

    def _generate_user_id(self, user_name, user_phone):
        """이름과 전화번호를 기반으로 해시 ID 생성"""
        # 해시 함수로 고유 ID 생성
        combined_string = f"{user_name}-{user_phone}-{datetime.now().isoformat()}"
        return hashlib.sha256(combined_string.encode()).hexdigest()
        
    def _initialize_user_stats(self):
        """새 사용자용 초기 통계 데이터 생성"""
        return {
            "overall": {
                "totalAttempted": 0,
                "totalCorrect": 0,
                "totalWrong": 0,
                "accuracy": 0.0,
            },
            "categoryLearning": {} # 카테고리별 통계
        }

    def get_user_by_id(self, user_id):
        """ID로 사용자 정보 조회"""
        return self.users_data['users'].get(user_id)
        
    def update_user_stats(self, user_id, quiz_result):
        """사용자 통계 업데이트"""
        user = self.get_user_by_id(user_id)
        if user:
            stats = user['stats']['overall']
            stats['totalAttempted'] += 1
            if quiz_result['is_correct']:
                stats['totalCorrect'] += 1
            else:
                stats['totalWrong'] += 1
            
            if stats['totalAttempted'] > 0:
                stats['accuracy'] = (stats['totalCorrect'] / stats['totalAttempted']) * 100
                
            user['lastLoginAt'] = datetime.now().isoformat()
            self._save_users()
            return True
        return False
