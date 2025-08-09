#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Routes Package
분리된 API 라우터들을 관리하는 패키지

작성자: 노팀장
작성일: 2025년 8월 9일 20:12 KST
파일: routes/__init__.py
"""

__version__ = "1.4.0"
__author__ = "노팀장"
__description__ = "AICU Season4 분리형 API 라우터 패키지"

# 라우터 Blueprint들을 패키지 레벨에서 import 가능하게 설정
from .quiz_routes import quiz_bp
from .stats_routes import stats_bp  
from .user_routes import user_bp

__all__ = ['quiz_bp', 'stats_bp', 'user_bp']

print("📦 routes 패키지 로드 완료: quiz, stats, user 라우터")