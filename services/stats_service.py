#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Stats Service
- StatsHandler 선택적 연동 및 통계 페이로드 생성
"""

import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modules'))

try:
    from stats_handler import StatsHandler  # 선택적 사용
    _stats_available = True
except Exception:
    StatsHandler = None
    _stats_available = False

_stats_singleton = None


def get_stats_handler():
    global _stats_singleton
    if not _stats_available:
        return None
    if _stats_singleton is None:
        try:
            _stats_singleton = StatsHandler()
        except Exception:
            _stats_singleton = None
    return _stats_singleton


def get_current_stats_payload(current_index: int, correct_count: int, wrong_count: int, total_questions: int | None) -> dict:
    total_answered = (correct_count or 0) + (wrong_count or 0)
    accuracy = 0
    if total_answered > 0:
        accuracy = round((correct_count / total_answered) * 100, 1)

    # total_questions를 서비스 단에서 안전하게 추정
    if total_questions is None:
        try:
            from services.quiz_service import get_quiz_handler  # 지연 임포트로 순환참조 방지
            total_questions = len(get_quiz_handler().questions)
        except Exception:
            total_questions = 0

    progress = 0
    if total_questions:
        progress = round(((current_index + 1) / total_questions) * 100, 1)

    return {
        'current_question': current_index + 1,
        'total_questions': total_questions,
        'progress_percent': progress,
        'correct_count': correct_count or 0,
        'wrong_count': wrong_count or 0,
        'total_answered': total_answered,
        'accuracy_percent': accuracy,
    }



