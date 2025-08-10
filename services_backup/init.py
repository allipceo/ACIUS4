#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Services Package
비즈니스 로직 서비스들을 관리하는 패키지

작성자: 노팀장
작성일: 2025년 8월 9일 20:13 KST
파일: services/__init__.py
"""

__version__ = "1.4.0"
__author__ = "노팀장"
__description__ = "AICU Season4 분리형 서비스 레이어 패키지"

# 서비스 클래스들을 패키지 레벨에서 import 가능하게 설정
from .quiz_service import QuizService
from .user_service import UserService

__all__ = ['QuizService', 'UserService']

print("📦 services 패키지 로드 완료: QuizService, UserService")