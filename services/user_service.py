#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
User Service - 사용자 데이터 관리 서비스
기존 app_v1.3.py의 사용자 관리 로직을 분리

작성자: 노팀장
작성일: 2025년 8월 9일
수정일: 2025년 8월 9일 20:10 KST
파일: services/user_service.py
"""

import os
import json
from datetime import datetime
from flask import session

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
            'total_wrong': 0,
            'overall_accuracy': 0.0,
            'last_question_index': 0,
            'last_session_date': datetime.now().isoformat(),
            'session_history': [],
            'category_stats': {
                '06재산보험': {'correct': 0, 'wrong': 0, 'accuracy': 0.0},
                '07특종보험': {'correct': 0, 'wrong': 0, 'accuracy': 0.0},
                '08배상책임보험': {'correct': 0, 'wrong': 0, 'accuracy': 0.0},
                '09해상보험': {'correct': 0, 'wrong': 0, 'accuracy': 0.0}
            },
            'achievements': [],
            'study_streak': 0
        }
        
        self.user_data[user_id] = new_user_data
        self.save_user_data()
        
        print(f"📝 신규 사용자 데이터 생성: {user_name} ({user_id})")
        return new_user_data
    
    def update_user_progress(self, user_id, is_correct, question_index, session_data):
        """사용자 진도 업데이트"""
        try:
            if not user_id or user_id not in self.user_data:
                print(f"⚠️ 사용자 ID {user_id} 없음")
                return False
            
            user_data = self.user_data[user_id]
            
            # 기본 통계 업데이트
            user_data['total_questions_answered'] += 1
            if is_correct:
                user_data['total_correct'] += 1
            else:
                user_data['total_wrong'] += 1
            
            # 정답률 계산
            total_answered = user_data['total_questions_answered']
            user_data['overall_accuracy'] = round(
                (user_data['total_correct'] / total_answered) * 100, 1
            ) if total_answered > 0 else 0.0
            
            # 진도 업데이트
            user_data['last_question_index'] = question_index
            user_data['last_session_date'] = datetime.now().isoformat()
            
            # 세션 통계 기록
            if 'session_stats' in session_data:
                session_stats = session_data['session_stats'].copy()
                session_stats['end_time'] = datetime.now().isoformat()
                session_stats['final_question_index'] = question_index
                
                # 세션 히스토리에 추가 (최근 10개만 보관)
                user_data['session_history'].append(session_stats)
                if len(user_data['session_history']) > 10:
                    user_data['session_history'] = user_data['session_history'][-10:]
            
            # 데이터 저장
            self.save_user_data()
            
            print(f"📊 사용자 진도 업데이트: {user_id} - Q{question_index+1}")
            return True
            
        except Exception as e:
            print(f"❌ 사용자 진도 업데이트 실패: {str(e)}")
            return False
    
    def complete_quiz_session(self, session_data):
        """퀴즈 세션 완료 처리"""
        try:
            user_id = session_data.get('user_id')
            if not user_id or user_id not in self.user_data:
                return {}
            
            user_data = self.user_data[user_id]
            
            # 세션 완료 통계
            session_stats = session_data.get('session_stats', {})
            completion_stats = {
                'session_completed': True,
                'completion_time': datetime.now().isoformat(),
                'questions_in_session': session_stats.get('questions_in_session', 0),
                'correct_in_session': session_stats.get('correct_in_session', 0),
                'wrong_in_session': session_stats.get('wrong_in_session', 0),
                'session_accuracy': 0.0,
                'total_progress': {
                    'total_answered': user_data['total_questions_answered'],
                    'overall_accuracy': user_data['overall_accuracy'],
                    'study_sessions': len(user_data['session_history'])
                }
            }
            
            # 세션 정답률 계산
            questions_answered = session_stats.get('questions_in_session', 0)
            if questions_answered > 0:
                completion_stats['session_accuracy'] = round(
                    (session_stats.get('correct_in_session', 0) / questions_answered) * 100, 1
                )
            
            # 세션 수 증가
            user_data['total_sessions'] += 1
            
            # 성취도 업데이트
            self._update_achievements(user_data, completion_stats)
            
            # 데이터 저장
            self.save_user_data()
            
            print(f"🎉 퀴즈 세션 완료: {user_id}")
            return completion_stats
            
        except Exception as e:
            print(f"❌ 퀴즈 세션 완료 처리 실패: {str(e)}")
            return {}
    
    def _update_achievements(self, user_data, completion_stats):
        """성취도 업데이트"""
        try:
            achievements = user_data.get('achievements', [])
            
            # 첫 완주 성취
            if completion_stats['session_completed'] and '첫_완주' not in achievements:
                achievements.append('첫_완주')
                print("🏆 성취 달성: 첫 완주!")
            
            # 고정확도 성취 (90% 이상)
            if completion_stats['session_accuracy'] >= 90 and '고정확도' not in achievements:
                achievements.append('고정확도')
                print("🏆 성취 달성: 고정확도 (90% 이상)!")
            
            # 연속 학습 성취
            if user_data['total_sessions'] >= 5 and '연속학습자' not in achievements:
                achievements.append('연속학습자')
                print("🏆 성취 달성: 연속학습자 (5회 이상)!")
            
            user_data['achievements'] = achievements
            
        except Exception as e:
            print(f"⚠️ 성취도 업데이트 실패: {e}")
    
    def get_users_summary(self):
        """사용자 요약 정보 반환"""
        try:
            summary = []
            for user_id, data in self.user_data.items():
                summary.append({
                    'user_id': user_id,
                    'user_name': data.get('user_name', 'Unknown'),
                    'total_sessions': data.get('total_sessions', 0),
                    'total_answered': data.get('total_questions_answered', 0),
                    'overall_accuracy': data.get('overall_accuracy', 0.0),
                    'last_session': data.get('last_session_date', ''),
                    'achievements_count': len(data.get('achievements', []))
                })
            
            # 최근 활동순으로 정렬
            summary.sort(key=lambda x: x['last_session'], reverse=True)
            return summary
            
        except Exception as e:
            print(f"❌ 사용자 요약 정보 생성 실패: {str(e)}")
            return []

# 전역 함수들 (Blueprint에서 사용)
def get_ceo_info():
    """조대표님 기본 정보 반환 - 실시간 D-Day 계산"""
    exam_date = datetime.strptime("2025-09-13", "%Y-%m-%d")
    today = datetime.now()
    days_left = max(0, (exam_date - today).days)
    daily_needed = round(1370 / max(days_left, 1), 1)
    
    return {
        "name": "조대표",
        "phone": "010-2067-6442",
        "exam_date": "2025년 9월 13일",
        "exam_date_raw": "2025-09-13",
        "days_left": days_left,
        "daily_needed": daily_needed
    }

def check_user_session():
    """사용자 세션 체크 - 강화된 디버깅"""
    current_user_id = session.get('current_user_id')
    session_data = dict(session)
    print(f"🔍 세션 체크 - 사용자 ID: {current_user_id}")
    print(f"🔍 전체 세션: {session_data}")
    print(f"🔑 세션 키 존재: {'current_user_id' in session}")
    print(f"💾 세션 영구: {session.permanent}")
    return current_user_id