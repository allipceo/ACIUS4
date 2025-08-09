#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quiz Routes
- 퀴즈 관련 API 라우팅 담당
"""

from flask import Blueprint, request, jsonify, session
import os
import sys

# 내부 서비스 임포트 경로 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from services.quiz_service import get_quiz_handler, display_question_safe, submit_answer_safe


quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/quiz')


@quiz_bp.route('/start', methods=['POST'])
def start_quiz():
    try:
        data = request.get_json(silent=True) or {}
        user_name = (data.get('user_name') or 'anonymous').strip()

        session['user_name'] = user_name
        session['current_question_index'] = 0
        session['correct_count'] = 0
        session['wrong_count'] = 0
        session.permanent = True

        result = display_question_safe(0)
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': '퀴즈가 시작되었습니다',
                'question_data': result['question_data'],
                'user_name': user_name,
            })
        return jsonify({'success': False, 'message': result.get('message', '퀴즈 시작 실패')})
    except Exception as e:
        return jsonify({'success': False, 'message': f'퀴즈 시작 오류: {str(e)}'})


@quiz_bp.route('/question/<int:question_index>', methods=['GET'])
def get_question(question_index: int):
    try:
        session['current_question_index'] = question_index
        result = display_question_safe(question_index)
        if result.get('success'):
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': question_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0),
                },
            })
        return jsonify({'success': False, 'message': result.get('message', '문제를 가져올 수 없습니다')})
    except Exception as e:
        return jsonify({'success': False, 'message': f'문제 가져오기 오류: {str(e)}'})


@quiz_bp.route('/submit', methods=['POST'])
def submit_answer():
    try:
        data = request.get_json(silent=True) or {}
        user_answer = data.get('answer')
        current_index = session.get('current_question_index', 0)

        result = submit_answer_safe(user_answer, current_index)
        if result.get('success'):
            if result.get('is_correct'):
                session['correct_count'] = session.get('correct_count', 0) + 1
            else:
                session['wrong_count'] = session.get('wrong_count', 0) + 1
            return jsonify({
                'success': True,
                'is_correct': result['is_correct'],
                'user_answer': result['user_answer'],
                'correct_answer': result['correct_answer'],
                'message': result['message'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': current_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0),
                },
            })
        return jsonify({'success': False, 'message': result.get('message', '채점 실패')})
    except Exception as e:
        return jsonify({'success': False, 'message': f'답안 제출 오류: {str(e)}'})


@quiz_bp.route('/next', methods=['GET'])
def next_question():
    current_index = session.get('current_question_index', 0)
    next_index = current_index + 1
    session['current_question_index'] = next_index
    return get_question(next_index)


@quiz_bp.route('/prev', methods=['GET'])
def prev_question():
    current_index = session.get('current_question_index', 0)
    prev_index = max(0, current_index - 1)
    session['current_question_index'] = prev_index
    return get_question(prev_index)



