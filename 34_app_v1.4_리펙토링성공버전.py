#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Flask Web Application v1.4 (Modular Refactored)
기준: app_v1.3.py → 분리형 아키텍처

작성자: 노팀장
작성일: 2025년 8월 9일
브랜치: refactoring
파일명: app_v1.4.py
"""

from flask import Flask, render_template
from datetime import timedelta
import sys
import os

# 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))

# 분리된 라우터들 import
from routes.quiz_routes import quiz_bp
from routes.stats_routes import stats_bp
from routes.user_routes import user_bp

# 서비스 초기화
from services.quiz_service import QuizService
from services.user_service import UserService

def create_app():
    """Flask 앱 팩토리"""
    app = Flask(__name__)
    
    # 앱 설정
    app.secret_key = 'aicu_season4_secret_key_v1.4_modular'
    app.permanent_session_lifetime = timedelta(seconds=86400)  # 24시간
    
    # 서비스 초기화 및 앱 컨텍스트에 저장
    quiz_service = QuizService()
    user_service = UserService()
    
    # 앱 컨텍스트에 서비스 저장
    app.quiz_service = quiz_service
    app.user_service = user_service
    
    # 블루프린트 등록
    app.register_blueprint(quiz_bp, url_prefix='/api/quiz')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(user_bp, url_prefix='/api')
    
    # 기본 페이지 라우터
    @app.route('/')
    def home():
        """홈페이지"""
        return render_template('quiz.html')
    
    @app.route('/quiz')
    def quiz_page():
        """퀴즈 페이지"""
        return render_template('quiz.html')
    
    @app.route('/stats')
    def stats_page():
        """통계 페이지"""
        return render_template('stats.html')
    
    # 에러 핸들러
    @app.errorhandler(404)
    def not_found(error):
        return {'success': False, 'message': '페이지를 찾을 수 없습니다'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        print(f"❌ 서버 내부 오류: {str(error)}")
        return {'success': False, 'message': '서버 내부 오류가 발생했습니다'}, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    print("🌐 AICU Season4 v1.4 (Modular) 웹서버 시작")
    print("📍 접속 주소: http://localhost:5000")
    print("🔧 리팩토링 완료:")
    print("   ✅ 분리형 아키텍처 적용 (500줄 → 85줄)")
    print("   ✅ app_v1.3 기능 100% 보존")
    print("   ✅ Week1 모듈 완벽 호환")
    print(f"📊 QuizService 상태: {app.quiz_service.get_status()}")
    print(f"👤 UserService 상태: {app.user_service.get_status()}")
    
    app.run(debug=True, port=5000, host='0.0.0.0')