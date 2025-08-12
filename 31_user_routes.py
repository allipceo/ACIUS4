#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
User Routes - 사용자 관련 API 라우터
기존 app_v1.3.py의 사용자/헬스체크 API 부분을 분리

작성자: 노팀장
작성일: 2025년 8월 9일
파일: routes/user_routes.py
"""

from flask import Blueprint, jsonify, current_app

user_bp = Blueprint('user', __name__)

@user_bp.route('/users/list')
def get_users_list():
    """등록된 사용자 목록 API - app_v1.3.py에서 분리"""
    try:
        user_service = current_app.user_service
        users_summary = user_service.get_users_summary()
        
        return jsonify({
            'success': True,
            'users': users_summary,
            'total_users': len(users_summary)
        })
        
    except Exception as e:
        print(f"❌ 사용자 목록 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'사용자 목록 조회 오류: {str(e)}'
        })

@user_bp.route('/health')
def health_check():
    """헬스 체크 API - app_v1.3.py에서 분리"""
    try:
        quiz_service = current_app.quiz_service
        user_service = current_app.user_service
        
        return jsonify({
            'success': True,
            'version': 'v1.4_modular',
            'status': 'healthy',
            'architecture': 'modular_separated',
            'features': [
                'Week1 모듈 완전 호환',
                '분리형 아키텍처 적용',
                '영구 사용자 데이터 저장',
                '안정적 세션 관리',
                '모듈별 에러 격리'
            ],
            'services': {
                'quiz_service': quiz_service.get_status(),
                'user_service': user_service.get_status()
            },
            'questions_loaded': quiz_service.get_total_questions(),
            'users_registered': len(user_service.get_all_users()),
            'message': 'AICU Season4 v1.4 Modular - 안정적 운영 중'
        })
        
    except Exception as e:
        print(f"❌ 헬스체크 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'헬스체크 오류: {str(e)}'
        }), 500