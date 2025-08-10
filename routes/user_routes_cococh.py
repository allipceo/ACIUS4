#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ACIU Season4 User Routes Module
사용자 등록 및 인증 관련 API 엔드포인트

작성자: 노팀장
작성일: 2025년 8월 8일
버전: v1.0
"""

from flask import Blueprint, render_template, request, jsonify, session
from services.user_service import UserService

# user_routes Blueprint 생성
user_bp = Blueprint('user', __name__, url_prefix='/user')
user_service = UserService()

@user_bp.route('/register')
def register_page():
    """사용자 등록 페이지 렌더링"""
    return render_template('user_registration.html')

@user_bp.route('/api/users/register', methods=['POST'])
def register_user():
    """사용자 등록 API"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'Invalid request data.'}), 400

        user_data = user_service.create_new_user(data)
        
        # 세션에 사용자 정보 저장
        session['user_id'] = user_data.get('userId')
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully.',
            'userData': user_data
        })
    except Exception as e:
        print(f"❌ User registration failed: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@user_bp.route('/api/users/current')
def get_current_user():
    """현재 로그인한 사용자 정보 반환"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'success': False, 'message': 'No user is logged in.'}), 401
    
    user_data = user_service.get_user_by_id(user_id)
    if not user_data:
        return jsonify({'success': False, 'message': 'User not found.'}), 404
        
    return jsonify({
        'success': True,
        'message': 'Current user data retrieved.',
        'userData': user_data
    })

@user_bp.route('/api/users/logout', methods=['POST'])
def logout_user():
    """사용자 로그아웃"""
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully.'})
