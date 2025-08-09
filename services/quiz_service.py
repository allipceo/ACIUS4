#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quiz Service
- QuizHandler 래핑 및 안전 호출 제공
"""

import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'modules'))
from quiz_handler import QuizHandler  # 검증된 모듈 사용


_quiz_singleton: QuizHandler | None = None


def get_quiz_handler() -> QuizHandler:
    global _quiz_singleton
    if _quiz_singleton is None:
        _quiz_singleton = QuizHandler()
        # 앱 로드시 이미 로드되었겠지만, 서비스 단에서도 방어적으로 보장
        if not getattr(_quiz_singleton, 'questions', None):
            _quiz_singleton.load_questions()
    return _quiz_singleton


def display_question_safe(index: int) -> dict:
    handler = get_quiz_handler()
    if hasattr(handler, 'display_question'):
        return handler.display_question(index)
    return {'success': False, 'message': 'display_question 미구현'}


def submit_answer_safe(user_answer, current_index: int) -> dict:
    handler = get_quiz_handler()
    # QuizHandler는 내부 current_index를 사용하므로 동기화
    if hasattr(handler, 'current_index'):
        handler.current_index = current_index
    if hasattr(handler, 'submit_answer'):
        return handler.submit_answer(user_answer)
    return {'success': False, 'message': 'submit_answer 미구현'}



