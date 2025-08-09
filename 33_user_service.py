#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
User Service - 사용자 데이터 관리 서비스
기존 app_v1.3.py의 사용자 관리 로직을 분리

작성자: 노팀장
작성일: 2025년 8월 9일
파일: services/user_service.py
"""

import os
import json
from datetime import datetime

class UserService:
    """사용자 서비스 클래스"""
    
    def __init__(self):
        """서비스 초기화"""
        self.user_data_file = os.path.join(
            os.path.dirname(__file__), '..', 'data', 'user_progress.json'
        )
        self.user_data = self.load_user_data()
        print(f"✅ UserService: 사용자 데이터 로드 ({len(self.user_data)}명)")
    
    def get_status(self):
        """서비스 상태 반환"""
        return {
            'users_count': len(self.user_data),
            'data_file_exists': os.path.exists(self.user_data_file),
            'initialized': True
        }
    
    def load_user_data(self):
        """사용자 데이터 로드"""
        try:
            if os.path.exists(self.user_data_file):
                with open(self.user_data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {}
        except Exception as e:
            print(f"⚠️ 사용자 데이터 로드 실패: {str(e)}")
            return {}
    
    def save_user_data(self):
        """사용자 데이터 저장"""
        try:
            os.makedirs(os.path.dirname(self.user_data_file), exist_ok=True)
            with open(self.user_data_file, 'w', encoding='utf-8') as f:
                json.dump(self.user_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"❌ 사용자 데이터 저장 실패: {str(e)}")
            return False
    
    def get_user_data(self, user_id):
        """특정 사용자 데이터 가져오기"""
        return self.user_data.get(user_id)
    
    def get_all_users(self):
        """모든 사용자 데이터 가져오기"""
        return self.user_data
    
    def create_new_user(self, user_name, user_id):
        """신규 사용자 생성"""
        new_user_data = {
            'user_name': user_name,
            'created_date': datetime.now().isoformat(),
            'total_sessions': 0,
            'total_questions_answered': 0,
            'total_correct': 0,