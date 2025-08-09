#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Flask Web Application v2.0 (Modularized)
- 분리형 아키텍처: routes/*, services/* 모듈로 라우팅/비즈니스 로직 분리

작성자: 서대리 (구현), 노팀장(설계)
작성일: 2025-08-08
브랜치: refectoring
파일명: app_v2.0.py
"""

from flask import Flask, render_template
from datetime import timedelta

# 블루프린트 등록
from routes.quiz_routes import quiz_bp
from routes.stats_routes import stats_bp
from routes.health_routes import health_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # 세션/보안 설정
    app.secret_key = 'aicu_season4_secret_key_v2.0'
    app.permanent_session_lifetime = timedelta(seconds=86400)

    # 블루프린트 등록 (URL prefix는 각 모듈에서 정의)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(health_bp)

    # 기본 페이지 (UI 템플릿 연결)
    @app.route('/')
    def home():
        return render_template('quiz.html')

    @app.route('/quiz')
    def quiz_page():
        return render_template('quiz.html')

    @app.route('/stats')
    def stats_page():
        return render_template('stats.html')

    return app


if __name__ == '__main__':
    app = create_app()
    print('🌐 AICU Season4 v2.0 (Modularized) 웹서버 시작')
    print('📍 접속 주소: http://localhost:5000')
    app.run(debug=True, port=5000, host='0.0.0.0')



