#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AICU Season4 Flask Web Application v1.2 (Fixed)
실행 오류 수정 및 Week1 모듈 호환성 개선

작성자: 노팀장
작성일: 2025년 8월 8일
브랜치: develop02
파일명: app_v1.2_fixed.py
수정사항: Week1 모듈 호환성 개선, 실행 오류 수정
"""

from flask import Flask, render_template, request, jsonify, session
import sys
import os
import json
from datetime import datetime

# Week1 완성 모듈 import
sys.path.append(os.path.join(os.path.dirname(__file__), 'modules'))
from quiz_handler import QuizHandler

# StatsHandler는 선택적 import (오류 방지)
try:
    from stats_handler import StatsHandler
    STATS_AVAILABLE = True
    print("✅ StatsHandler 모듈 로드 성공")
except ImportError as e:
    print(f"⚠️ StatsHandler 모듈 로드 실패: {e}")
    STATS_AVAILABLE = False

app = Flask(__name__)
app.secret_key = 'aicu_season4_secret_key_v1.2_fixed'
app.permanent_session_lifetime = 86400  # 24시간 세션 유지

# Week1 모듈 초기화
quiz = QuizHandler()

# StatsHandler 안전 초기화
stats = None
if STATS_AVAILABLE:
    try:
        # 기본 사용자로 초기화 (파라미터 없이)
        stats = StatsHandler()
        print("✅ StatsHandler 초기화 성공")
    except Exception as e:
        print(f"⚠️ StatsHandler 초기화 실패: {e}")
        STATS_AVAILABLE = False

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

def safe_stats_call(func_name, *args, **kwargs):
    """StatsHandler 안전 호출"""
    if not STATS_AVAILABLE or not stats:
        print(f"⚠️ StatsHandler 사용 불가: {func_name}")
        return None
    
    try:
        method = getattr(stats, func_name, None)
        if method and callable(method):
            return method(*args, **kwargs)
        else:
            print(f"⚠️ StatsHandler 메서드 없음: {func_name}")
            return None
    except Exception as e:
        print(f"❌ StatsHandler 호출 실패 ({func_name}): {str(e)}")
        return None

# 앱 시작 시 데이터 로드
print("🚀 AICU Season4 v1.2 Fixed 시작")
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
    """퀴즈 시작 API"""
    try:
        data = request.get_json()
        user_name = data.get('user_name', 'anonymous').strip()
        
        if not user_name:
            return jsonify({
                'success': False,
                'message': '사용자 이름을 입력해주세요'
            })
        
        # 고유 사용자 ID 생성
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
                'study_time_minutes': 0,
                'last_question_index': 0
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
        
        # reset_current_question 메서드 안전 호출
        if hasattr(quiz, 'reset_current_question'):
            quiz.reset_current_question()
        
        # 첫 번째 문제 표시
        result = quiz.display_question(start_index)
        
        if result and result.get('success'):
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
                'message': '퀴즈 시작 실패: 문제를 불러올 수 없습니다'
            })
            
    except Exception as e:
        print(f"❌ 퀴즈 시작 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'퀴즈 시작 오류: {str(e)}'
        })

@app.route('/api/quiz/question/<int:question_index>')
def get_question(question_index):
    """특정 문제 가져오기 API"""
    try:
        quiz.current_index = question_index
        
        # reset_current_question 메서드 안전 호출
        if hasattr(quiz, 'reset_current_question'):
            quiz.reset_current_question()
        
        result = quiz.display_question(question_index)
        
        if result and result.get('success'):
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
                'message': '문제를 가져올 수 없습니다'
            })
            
    except Exception as e:
        print(f"❌ 문제 가져오기 오류: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'문제 가져오기 오류: {str(e)}'
        })

@app.route('/api/quiz/submit', methods=['POST'])
def submit_answer():
    """답안 제출 API"""
    try:
        print("🔍 답안 제출 API 호출")
        
        data = request.get_json()
        user_answer = data.get('answer')
        
        if not user_answer:
            return jsonify({
                'success': False,
                'message': '답안이 제출되지 않았습니다'
            })
        
        current_index = session.get('current_question_index', 0)
        print(f"📍 현재 문제 인덱스: {current_index}")
        
        # 현재 문제 정보
        if current_index < len(quiz.questions):
            current_question = quiz.questions[current_index]
            correct_answer = current_question.get('answer', '')
            
            print(f"📝 사용자 답안: {user_answer}")
            print(f"✅ 정답: {correct_answer}")
            
            # 답안 비교
            user_answer_clean = str(user_answer).strip().upper()
            correct_answer_clean = str(correct_answer).strip().upper()
            is_correct = user_answer_clean == correct_answer_clean
            
            print(f"🎯 채점 결과: {is_correct}")
            
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
            session.permanent = True
            
            # StatsHandler에 기록 (안전 호출)
            stats_recorded = safe_stats_call(
                'record_answer',
                is_correct=is_correct,
                question_id=current_question.get('qcode', f'Q{current_index}'),
                category=current_question.get('layer1', '일반')
            )
            
            if stats_recorded:
                print("📊 StatsHandler 기록 성공")
            else:
                print("⚠️ StatsHandler 기록 실패 (계속 진행)")
            
            # 사용자 전체 데이터 업데이트
            update_user_progress(is_correct, current_index)
            
            print(f"📊 세션 통계: 정답 {session.get('correct_count', 0)}, 오답 {session.get('wrong_count', 0)}")
            
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
        import traceback
        traceback.print_exc()
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
            print(f"💾 사용자 데이터 저장 완료: {user_id}")
            
    except Exception as e:
        print(f"❌ 사용자 진도 업데이트 실패: {str(e)}")

@app.route('/api/quiz/next')
def next_question():
    """다음 문제로 이동 API"""
    try:
        current_index = session.get('current_question_index', 0)
        next_index = current_index + 1
        
        print(f"➡️ 다음 문제로 이동: {current_index} → {next_index}")
        
        if next_index >= len(quiz.questions):
            complete_quiz_session()
            return jsonify({
                'success': False,
                'message': '🎉 모든 문제를 완료했습니다!',
                'is_last': True,
                'completion_stats': get_session_completion_stats()
            })
        
        quiz.current_index = next_index
        
        if hasattr(quiz, 'reset_current_question'):
            quiz.reset_current_question()
            
        result = quiz.display_question(next_index)
        
        if result and result.get('success'):
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
        
        if hasattr(quiz, 'reset_current_question'):
            quiz.reset_current_question()
            
        result = quiz.display_question(prev_index)
        
        if result and result.get('success'):
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
    """현재 세션 통계 API"""
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
        
        # Week1 StatsHandler에서 추가 통계 (안전 호출)
        stats_progress = safe_stats_call('get_user_progress') or {}
        stats_accuracy = safe_stats_call('get_user_accuracy') or {}
        category_stats = safe_stats_call('get_category_stats') or {}
        
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
                
                # Week1 StatsHandler 통계 (선택적)
                'stats_handler_progress': stats_progress,
                'stats_handler_accuracy': stats_accuracy,
                'category_breakdown': category_stats,
                
                # 전체 누적 통계
                'overall_stats': overall_stats,
                
                # 세션 정보
                'session_stats': session.get('session_stats', {}),
                
                # 시스템 정보
                'system_info': {
                    'stats_handler_available': STATS_AVAILABLE,
                    'version': 'v1.2_fixed'
                }
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
    """상세 통계 API"""
    try:
        user_id = session.get('user_id')
        
        # 전체 사용자 통계
        overall_stats = {}
        if user_id and user_id in user_data:
            overall_stats = user_data[user_id]
        
        # Week1 StatsHandler 상세 통계 (안전 호출)
        detailed_stats = {}
        if STATS_AVAILABLE:
            detailed_stats = {
                'overall_stats': safe_stats_call('get_overall_stats') or {},
                'category_stats': safe_stats_call('get_category_stats') or {}
            }
        
        return jsonify({
            'success': True,
            'detailed_stats': detailed_stats,
            'user_stats': overall_stats,
            'current_session': session.get('session_stats', {}),
            'meta_info': {
                'total_questions_available': len(quiz.questions),
                'data_last_updated': datetime.now().isoformat(),
                'user_id': user_id,
                'stats_handler_available': STATS_AVAILABLE
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
            user_data[user_id]['total_sessions'] += 1
            user_data[user_id]['last_completed'] = datetime.now().isoformat()
            
            # 세션 시간 계산
            session_start = session.get('session_start')
            if session_start:
                try:
                    start_time = datetime.fromisoformat(session_start)
                    session_duration = (datetime.now() - start_time).total_seconds() / 60
                    user_data[user_id]['study_time_minutes'] += round(session_duration, 1)
                except:
                    pass
            
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
        'version': 'v1.2_fixed',
        'status': 'healthy',
        'features': [
            'Week1 QuizHandler 완전 연동',
            f'StatsHandler 통계 시스템 ({"사용 가능" if STATS_AVAILABLE else "사용 불가"})',
            '영구 사용자 데이터 저장',
            '안정적 세션 관리',
            '오류 복구 시스템'
        ],
        'questions_loaded': len(quiz.questions),
        'users_registered': len(user_data),
        'stats_handler_available': STATS_AVAILABLE,
        'message': 'AICU Season4 v1.2 Fixed - 안정적 운영 중'
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
    import traceback
    traceback.print_exc()
    return jsonify({
        'success': False,
        'message': '서버 내부 오류가 발생했습니다'
    }), 500

if __name__ == '__main__':
    print("🌐 AICU Season4 v1.2 Fixed 웹서버 시작")
    print("📍 접속 주소: http://localhost:5000")
    print("🔧 수정사항:")
    print("   ✅ Week1 모듈 호환성 개선")
    print("   ✅ 오류 복구 시스템 강화")
    print("   ✅ 안전한 StatsHandler 연동")
    print("   ✅ 상세 디버깅 로그")
    print(f"📊 StatsHandler 상태: {'사용 가능' if STATS_AVAILABLE else '사용 불가'}")
    app.run(debug=True, port=5000, host='0.0.0.0')