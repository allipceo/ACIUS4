#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Flask Web Application v1.2
통계 시스템 완전 연동 및 사용자 관리 강화

작성자: 노팀장
작성일: 2025년 8월 8일
브랜치: develop02
파일명: app_v1.2.py
주요 개선: Week1 stats_handler.py 완전 웹 연동, 영구 저장 시스템
"""

from flask import Flask, render_template, request, jsonify, session
import sys
import os
import json
from datetime import datetime
import uuid

# Week1 완성 모듈 import
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))
from quiz_handler import QuizHandler
from stats_handler import StatsHandler

app = Flask(__name__)
app.secret_key = 'aicu_season4_secret_key_v1.2'
app.permanent_session_lifetime = 86400  # 24시간 세션 유지

# Week1 모듈 초기화
quiz = QuizHandler()
stats = StatsHandler()

# 사용자 데이터 파일 경로
USER_DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'user_progress.json')

def load_user_data():
    """사용자 데이터 로드"""
    try:
        if os.path.exists(USER_DATA_FILE):
            with open(USER_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"⚠️ 사용자 데이터 로드 실패: {str(e)}")
        return {}

def save_user_data(user_data):
    """사용자 데이터 저장"""
    try:
        os.makedirs(os.path.dirname(USER_DATA_FILE), exist_ok=True)
        with open(USER_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"❌ 사용자 데이터 저장 실패: {str(e)}")
        return False

# 앱 시작 시 데이터 로드
print("🚀 AICU Season4 v1.2 시작 (통계 시스템 완전 연동)")
if quiz.load_questions():
    print(f"✅ 문제 로드 성공: {len(quiz.questions)}개")
else:
    print("❌ 문제 로드 실패")

# 사용자 데이터 로드
user_data = load_user_data()
print(f"📊 사용자 데이터 로드: {len(user_data)}명의 기록")

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

@app.route('/api/quiz/start', methods=['POST'])
def start_quiz():
    """퀴즈 시작 API - 사용자 데이터 연동 강화"""
    try:
        data = request.get_json()
        user_name = data.get('user_name', 'anonymous').strip()
        
        if not user_name:
            return jsonify({
                'success': False,
                'message': '사용자 이름을 입력해주세요'
            })
        
        # 고유 사용자 ID 생성 또는 기존 ID 사용
        user_id = f"user_{user_name}_{datetime.now().strftime('%Y%m%d')}"
        
        # 기존 사용자 데이터 로드
        global user_data
        if user_id in user_data:
            existing_data = user_data[user_id]
            print(f"👤 기존 사용자 복원: {user_name}")
        else:
            existing_data = {
                'user_name': user_name,
                'created_date': datetime.now().isoformat(),
                'total_sessions': 0,
                'total_questions_answered': 0,
                'total_correct': 0,
                'total_wrong': 0,
                'best_accuracy': 0,
                'study_time_minutes': 0
            }
            print(f"🆕 신규 사용자 생성: {user_name}")
        
        # 세션 정보 설정
        session.permanent = True
        session['user_id'] = user_id
        session['user_name'] = user_name
        session['session_start'] = datetime.now().isoformat()
        session['current_question_index'] = existing_data.get('last_question_index', 0)
        session['correct_count'] = 0
        session['wrong_count'] = 0
        
        # 현재 세션 통계 초기화
        session['session_stats'] = {
            'start_time': datetime.now().isoformat(),
            'questions_in_session': 0,
            'correct_in_session': 0,
            'wrong_in_session': 0
        }
        
        # QuizHandler 설정
        start_index = session['current_question_index']
        quiz.current_index = start_index
        quiz.reset_current_question()
        
        # StatsHandler 초기화 (사용자별)
        stats_user_id = user_id
        global stats
        stats = StatsHandler(stats_user_id)
        
        # 첫 번째 문제 표시
        result = quiz.display_question(start_index)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': f'{user_name}님, 퀴즈가 시작되었습니다!',
                'question_data': result['question_data'],
                'user_info': {
                    'user_name': user_name,
                    'user_id': user_id,
                    'resume_from': start_index + 1,
                    'total_questions': len(quiz.questions),
                    'previous_stats': existing_data
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '퀴즈 시작 실패: ' + result.get('message', '')
            })
            
    except Exception as e:
        print(f"❌ 퀴즈 시작 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'퀴즈 시작 오류: {str(e)}'
        })

@app.route('/api/quiz/question/<int:question_index>')
def get_question(question_index):
    """특정 문제 가져오기 API"""
    try:
        quiz.current_index = question_index
        quiz.reset_current_question()
        
        result = quiz.display_question(question_index)
        
        if result['success']:
            session['current_question_index'] = question_index
            
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': question_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': result.get('message', '문제를 가져올 수 없습니다')
            })
            
    except Exception as e:
        print(f"❌ 문제 가져오기 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'문제 가져오기 오류: {str(e)}'
        })

@app.route('/api/quiz/submit', methods=['POST'])
def submit_answer():
    """답안 제출 API - 통계 연동 강화"""
    try:
        data = request.get_json()
        user_answer = data.get('answer')
        
        if not user_answer:
            return jsonify({
                'success': False,
                'message': '답안이 제출되지 않았습니다'
            })
        
        current_index = session.get('current_question_index', 0)
        
        # 현재 문제 정보
        if current_index < len(quiz.questions):
            current_question = quiz.questions[current_index]
            correct_answer = current_question.get('answer', '')
            
            # 답안 비교
            user_answer_clean = str(user_answer).strip().upper()
            correct_answer_clean = str(correct_answer).strip().upper()
            is_correct = user_answer_clean == correct_answer_clean
            
            # 세션 통계 업데이트
            if is_correct:
                session['correct_count'] = session.get('correct_count', 0) + 1
                session['session_stats']['correct_in_session'] += 1
                message = "정답입니다! 🎉"
            else:
                session['wrong_count'] = session.get('wrong_count', 0) + 1
                session['session_stats']['wrong_in_session'] += 1
                message = f"오답입니다. 정답은 '{correct_answer}' 입니다."
            
            session['session_stats']['questions_in_session'] += 1
            
            # StatsHandler에 기록 (Week1 모듈 활용)
            try:
                stats.record_answer(
                    question_id=current_question.get('qcode', f'Q{current_index}'),
                    user_answer=user_answer,
                    correct_answer=correct_answer,
                    is_correct=is_correct,
                    category=current_question.get('layer1', '일반'),
                    question_type=current_question.get('type', '진위형')
                )
                print(f"📊 StatsHandler 기록 완료: {is_correct}")
            except Exception as stats_error:
                print(f"⚠️ StatsHandler 기록 실패: {str(stats_error)}")
            
            # 사용자 전체 데이터 업데이트
            update_user_progress(is_correct, current_index)
            
            return jsonify({
                'success': True,
                'is_correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': correct_answer,
                'message': message,
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': current_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                },
                'question_info': {
                    'category': current_question.get('layer1', '일반'),
                    'type': current_question.get('type', '진위형'),
                    'code': current_question.get('qcode', f'Q{current_index}')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '유효하지 않은 문제입니다'
            })
            
    except Exception as e:
        print(f"❌ 답안 제출 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'답안 제출 오류: {str(e)}'
        })

def update_user_progress(is_correct, current_index):
    """사용자 진도 업데이트"""
    try:
        global user_data
        user_id = session.get('user_id')
        
        if user_id:
            if user_id not in user_data:
                user_data[user_id] = {
                    'user_name': session.get('user_name', 'anonymous'),
                    'created_date': datetime.now().isoformat(),
                    'total_sessions': 0,
                    'total_questions_answered': 0,
                    'total_correct': 0,
                    'total_wrong': 0,
                    'best_accuracy': 0,
                    'study_time_minutes': 0
                }
            
            # 업데이트
            user_data[user_id]['total_questions_answered'] += 1
            user_data[user_id]['last_question_index'] = current_index
            user_data[user_id]['last_activity'] = datetime.now().isoformat()
            
            if is_correct:
                user_data[user_id]['total_correct'] += 1
            else:
                user_data[user_id]['total_wrong'] += 1
            
            # 정답률 계산
            total_answered = user_data[user_id]['total_questions_answered']
            if total_answered > 0:
                accuracy = (user_data[user_id]['total_correct'] / total_answered) * 100
                user_data[user_id]['current_accuracy'] = round(accuracy, 1)
                
                # 최고 정답률 업데이트
                if accuracy > user_data[user_id]['best_accuracy']:
                    user_data[user_id]['best_accuracy'] = round(accuracy, 1)
            
            # 데이터 저장
            save_user_data(user_data)
            
    except Exception as e:
        print(f"❌ 사용자 진도 업데이트 실패: {str(e)}")

@app.route('/api/quiz/next')
def next_question():
    """다음 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        next_index = current_index + 1
        
        if next_index >= len(quiz.questions):
            # 퀴즈 완료 처리
            complete_quiz_session()
            return jsonify({
                'success': False,
                'message': '🎉 모든 문제를 완료했습니다!',
                'is_last': True,
                'completion_stats': get_session_completion_stats()
            })
        
        quiz.current_index = next_index
        quiz.reset_current_question()
        result = quiz.display_question(next_index)
        
        if result['success']:
            session['current_question_index'] = next_index
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': next_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '다음 문제를 가져올 수 없습니다'
            })
            
    except Exception as e:
        print(f"❌ 다음 문제 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'다음 문제 오류: {str(e)}'
        })

@app.route('/api/quiz/prev')
def prev_question():
    """이전 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        prev_index = current_index - 1
        
        if prev_index < 0:
            return jsonify({
                'success': False,
                'message': '첫 번째 문제입니다',
                'is_first': True
            })
        
        quiz.current_index = prev_index
        quiz.reset_current_question()
        result = quiz.display_question(prev_index)
        
        if result['success']:
            session['current_question_index'] = prev_index
            return jsonify({
                'success': True,
                'question_data': result['question_data'],
                'session_info': {
                    'user_name': session.get('user_name', 'anonymous'),
                    'current_index': prev_index,
                    'correct_count': session.get('correct_count', 0),
                    'wrong_count': session.get('wrong_count', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '이전 문제를 가져올 수 없습니다'
            })
            
    except Exception as e:
        print(f"❌ 이전 문제 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'이전 문제 오류: {str(e)}'
        })

@app.route('/api/stats/current')
def get_current_stats():
    """현재 세션 통계 API - Week1 StatsHandler 연동"""
    try:
        # 기본 세션 통계
        current_index = session.get('current_question_index', 0)
        correct_count = session.get('correct_count', 0)
        wrong_count = session.get('wrong_count', 0)
        total_answered = correct_count + wrong_count
        
        accuracy = 0
        if total_answered > 0:
            accuracy = round((correct_count / total_answered) * 100, 1)
        
        progress = round(((current_index + 1) / len(quiz.questions)) * 100, 1)
        
        # Week1 StatsHandler에서 추가 통계 가져오기
        try:
            user_progress = stats.get_user_progress()
            user_accuracy = stats.get_user_accuracy()
            category_stats = stats.get_category_stats()
            
            print(f"📊 StatsHandler 데이터: 진도={user_progress}, 정답률={user_accuracy}")
        except Exception as stats_error:
            print(f"⚠️ StatsHandler 접근 실패: {str(stats_error)}")
            user_progress = {}
            user_accuracy = {}
            category_stats = {}
        
        # 전체 사용자 데이터
        user_id = session.get('user_id')
        overall_stats = {}
        if user_id and user_id in user_data:
            overall_stats = user_data[user_id]
        
        return jsonify({
            'success': True,
            'stats': {
                # 현재 세션 통계
                'user_name': session.get('user_name', 'anonymous'),
                'current_question': current_index + 1,
                'total_questions': len(quiz.questions),
                'progress_percent': progress,
                'correct_count': correct_count,
                'wrong_count': wrong_count,
                'total_answered': total_answered,
                'accuracy_percent': accuracy,
                
                # Week1 StatsHandler 통계
                'stats_handler_progress': user_progress,
                'stats_handler_accuracy': user_accuracy,
                'category_breakdown': category_stats,
                
                # 전체 누적 통계
                'overall_stats': overall_stats,
                
                # 세션 정보
                'session_stats': session.get('session_stats', {})
            }
        })
        
    except Exception as e:
        print(f"❌ 통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'통계 조회 오류: {str(e)}'
        })

@app.route('/api/stats/detailed')
def get_detailed_stats():
    """상세 통계 API - 통계 페이지용"""
    try:
        user_id = session.get('user_id')
        
        # 전체 사용자 통계
        overall_stats = {}
        if user_id and user_id in user_data:
            overall_stats = user_data[user_id]
        
        # Week1 StatsHandler 상세 통계
        try:
            detailed_stats = {
                'overall_stats': stats.get_overall_stats(),
                'category_stats': stats.get_category_stats(),
                'daily_progress': stats.get_daily_progress() if hasattr(stats, 'get_daily_progress') else {},
                'session_history': stats.get_session_history() if hasattr(stats, 'get_session_history') else []
            }
        except Exception as stats_error:
            print(f"⚠️ 상세 통계 조회 실패: {str(stats_error)}")
            detailed_stats = {}
        
        return jsonify({
            'success': True,
            'detailed_stats': detailed_stats,
            'user_stats': overall_stats,
            'current_session': session.get('session_stats', {}),
            'meta_info': {
                'total_questions_available': len(quiz.questions),
                'data_last_updated': datetime.now().isoformat(),
                'user_id': user_id
            }
        })
        
    except Exception as e:
        print(f"❌ 상세 통계 조회 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'상세 통계 조회 오류: {str(e)}'
        })

def complete_quiz_session():
    """퀴즈 세션 완료 처리"""
    try:
        user_id = session.get('user_id')
        if user_id and user_id in user_data:
            # 세션 완료 기록
            user_data[user_id]['total_sessions'] += 1
            user_data[user_id]['last_completed'] = datetime.now().isoformat()
            
            # 세션 시간 계산
            session_start = session.get('session_start')
            if session_start:
                start_time = datetime.fromisoformat(session_start)
                session_duration = (datetime.now() - start_time).total_seconds() / 60
                user_data[user_id]['study_time_minutes'] += round(session_duration, 1)
            
            save_user_data(user_data)
            print(f"🎉 퀴즈 세션 완료: {session.get('user_name')}")
            
    except Exception as e:
        print(f"❌ 세션 완료 처리 실패: {str(e)}")

def get_session_completion_stats():
    """세션 완료 통계"""
    try:
        correct_count = session.get('correct_count', 0)
        wrong_count = session.get('wrong_count', 0)
        total_answered = correct_count + wrong_count
        
        accuracy = 0
        if total_answered > 0:
            accuracy = round((correct_count / total_answered) * 100, 1)
        
        return {
            'total_answered': total_answered,
            'correct_count': correct_count,
            'wrong_count': wrong_count,
            'accuracy_percent': accuracy,
            'session_duration': session.get('session_stats', {})
        }
    except:
        return {}

@app.route('/api/users/list')
def get_users_list():
    """등록된 사용자 목록 API"""
    try:
        users_summary = []
        for user_id, user_info in user_data.items():
            summary = {
                'user_id': user_id,
                'user_name': user_info.get('user_name', 'Unknown'),
                'total_questions': user_info.get('total_questions_answered', 0),
                'accuracy': user_info.get('current_accuracy', 0),
                'last_activity': user_info.get('last_activity', ''),
                'created_date': user_info.get('created_date', '')
            }
            users_summary.append(summary)
        
        # 최근 활동순으로 정렬
        users_summary.sort(key=lambda x: x.get('last_activity', ''), reverse=True)
        
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

@app.route('/api/health')
def health_check():
    """헬스 체크 API"""
    return jsonify({
        'success': True,
        'version': 'v1.2',
        'status': 'healthy',
        'features': [
            'Week1 모듈 완전 연동',
            'StatsHandler 통계 시스템',
            '영구 사용자 데이터 저장',
            '상세 통계 대시보드',
            '세션 관리 시스템'
        ],
        'questions_loaded': len(quiz.questions),
        'users_registered': len(user_data),
        'message': 'AICU Season4 v1.2 완전 통합 시스템 정상 동작 중'
    })

# 에러 핸들러
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': '페이지를 찾을 수 없습니다'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    print(f"❌ 서버 내부 오류: {str(error)}")
    return jsonify({
        'success': False,
        'message': '서버 내부 오류가 발생했습니다'
    }), 500

if __name__ == '__main__':
    print("🌐 AICU Season4 v1.2 웹서버 시작")
    print("📍 접속 주소: http://localhost:5000")
    print("🔧 새로운 기능:")
    print("   ✅ Week1 StatsHandler 완전 연동")
    print("   ✅ 영구 사용자 데이터 저장")
    print("   ✅ 상세 통계 대시보드")
    print("   ✅ 다중 사용자 지원")
    app.run(debug=True, port=5000, host='0.0.0.0')