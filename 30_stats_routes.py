#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stats Routes - 통계 관련 API 라우터
기존 app_v1.3.py의 통계 API 부분을 분리

작성자: 노팀장
작성일: 2025년 8월 9일
파일: routes/stats_routes.py
"""

from flask import Blueprint, jsonify, session, current_app
from datetime import datetime

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/current')
def get_current_stats():
    """현재 세션 통계 API - app_v1.3.py에서 분리"""
    try:
        quiz_service = current_app.quiz_service
        user_service = current_app.user_service
        
        # 기본 세션 통계
        current_index = session.get('current_question_index', 0)
        correct_count = session.get('correct_count', 0)
        wrong_count = session.get('wrong_count', 0)
        total_answered = correct_count + wrong_count
        
        accuracy = 0
        if total_answered > 0:
            accuracy = round((correct_count / total_answered) * 100, 1)
        
        total_questions = quiz_service.get_total_questions()
        progress = round(((current_index + 1) / total_questions) * 100, 1)
        
        # 전체 사용자 데이터
        user_id = session.get('user_id')
        overall_stats = user_service.get_user_data(user_id) if user_id else {}
        
        # Week1 StatsHandler에서 추가 통계 (선택적)
        quiz_stats = quiz_service.get_stats_data()
        
        return jsonify({
            'success': True,
            'stats': {
                'user_name': session.get('user_name', 'anonymous'),
                'current_question': current_index + 1,
                'total_questions': total_questions,
                'progress_percent': progress,
                'correct_count': correct_count,
                'wrong_count': wrong_count,
                'total_answered': total_answered,
                'accuracy_percent': accuracy,
                'overall_stats': overall_stats,
                'session_stats': session.get('session_stats', {}),
                'quiz_handler_stats': quiz_stats,
                'system_info': {
                    'version': 'v1.4_modular',
                    'quiz_service_status': quiz_service.get_status(),
                    'user_service_status': user_service.get_status()
                }
            }
        })
        
    except Exception as e:
        print(f"❌ 통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'통계 조회 오류: {str(e)}'
        })

@stats_bp.route('/detailed')
def get_detailed_stats():
    """상세 통계 API - app_v1.3.py에서 분리"""
    try:
        user_service = current_app.user_service
        quiz_service = current_app.quiz_service
        user_id = session.get('user_id')
        
        # 전체 사용자 통계
        overall_stats = user_service.get_user_data(user_id) if user_id else {}
        
        # Week1 StatsHandler 상세 통계
        quiz_stats = quiz_service.get_stats_data()
        
        return jsonify({
            'success': True,
            'detailed_stats': {
                'user_stats': overall_stats,
                'current_session': session.get('session_stats', {}),
                'quiz_handler_stats': quiz_stats,
                'meta_info': {
                    'total_questions_available': quiz_service.get_total_questions(),
                    'data_last_updated': datetime.now().isoformat(),
                    'user_id': user_id,
                    'version': 'v1.4_modular'
                }
            }
        })
        
    except Exception as e:
        print(f"❌ 상세 통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'상세 통계 조회 오류: {str(e)}'
        })