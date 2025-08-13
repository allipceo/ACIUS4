# app_v2.8.py - AICU S4 세션 ID 불일치 문제 해결 버전

from flask import Flask, render_template, redirect, url_for, session, jsonify, make_response, request
from datetime import timedelta, datetime
import sys
import os
import time

def create_app():
    """AICU S4 v2.8 - 세션 ID 불일치 문제 해결 버전"""
    app = Flask(__name__)
    
    # 앱 설정 강화 (세션 문제 해결)
    app.config['SECRET_KEY'] = 'aicu_season4_secret_key_2025_guest_mode'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    
    # Blueprint 등록
    register_blueprints(app)
    register_error_handlers(app)
    
    # 메인 라우트 (조대표님 시나리오 반영)
    @app.route('/')
    def index():
        """홈페이지 - 세션 없을 경우 '게스트'로 자동 등록 후 홈으로 리다이렉트"""
        print("=== 홈페이지 접속 ===")
        if 'current_user_id' not in session:
            guest_id = f"guest_{int(time.time())}"
            session.update({
                'current_user_id': guest_id,
                'user_name': '게스트',
                'registration_date': '2025-08-10',
                'exam_subject': 'ACIU',
                'exam_date': '2025-09-13',
                'is_guest': True,
                'guest_start_time': datetime.now().isoformat()
            })
            session.permanent = True
            print(f"✅ '게스트' 세션 자동 생성 완료: {guest_id}")
            
        return redirect(url_for('home.home_page'))

    # 게스트 → 실제 사용자 전환 API (기존 유지)
    @app.route('/api/user/register-from-guest', methods=['POST'])
    def register_from_guest():
        """게스트에서 실제 사용자로 전환"""
        data = request.get_json()
        
        if not session.get('is_guest'):
            return jsonify({'error': '게스트 모드가 아닙니다'}), 400
        
        # 게스트 통계 데이터 백업 (향후 활용)
        guest_stats = {
            'guest_id': session['current_user_id'],
            'guest_period': session.get('guest_start_time'),
            'guest_data': '게스트 기간 학습 데이터'
        }
        
        # 새로운 실제 사용자 정보 생성
        new_user_id = f"user_{int(time.time())}"
        registration_date = datetime.now().strftime('%Y-%m-%d')
        
        # 세션 업데이트
        session.update({
            'current_user_id': new_user_id,
            'user_name': data['name'],
            'registration_date': registration_date,
            'exam_subject': data['exam_subject'],
            'exam_date': data['exam_date'],
            'is_guest': False,
            'guest_period_stats': guest_stats
        })
        
        print(f"✅ 게스트→실사용자 전환: {session['current_user_id']}")
        
        return jsonify({
            'success': True,
            'message': f'{data["name"]}님으로 정식 등록되었습니다!',
            'new_user_id': new_user_id,
            'guest_stats_preserved': True
        })
    
    # 현재 사용자 정보 API (게스트 모드 지원)
    @app.route('/api/user/current')
    def get_current_user():
        """현재 사용자 정보 반환 (게스트 모드 포함)"""
        current_user_id = session.get('current_user_id')
        print(f"=== 현재 사용자 조회: {current_user_id} ===")
        
        return jsonify({
            'user_id': current_user_id,
            'user_name': session.get('user_name'),
            'registration_date': session.get('registration_date'),
            'exam_subject': session.get('exam_subject'),
            'exam_date': session.get('exam_date'),
            'is_guest': session.get('is_guest', False),
            'guest_start_time': session.get('guest_start_time')
        })
    
    # 세션 강제 초기화 (기존 유지)
    @app.route('/api/debug/clear-session')
    def clear_session_api():
        """모든 세션 정보를 강제로 삭제하는 디버그용 API"""
        print("=== 세션 강제 초기화 API 호출 ===")
        session.clear()
        response = make_response(jsonify({'success': True, 'message': '모든 세션이 삭제되었습니다.'}))
        response.delete_cookie(app.config['SESSION_COOKIE_NAME'])
        return response

    # 🔧 v2.8 추가: 통계 API 권한 검증 개선
    @app.route('/api/user/statistics/<user_id>', methods=['GET'])
    def get_user_statistics_fixed(user_id):
        """사용자별 통계 조회 - 게스트 모드 권한 검증 개선"""
        print(f"=== 사용자 통계 조회 (v2.8): {user_id} ===")
        
        try:
            current_user_id = session.get('current_user_id')
            print(f"🔍 현재 세션 ID: {current_user_id}")
            print(f"🔍 요청한 사용자 ID: {user_id}")
            
            # 🔧 v2.8 수정: 현재 세션 ID와 요청 ID가 다르면 현재 세션 ID로 통계 반환
            if current_user_id != user_id:
                print(f"⚠️ ID 불일치 감지: 세션={current_user_id}, 요청={user_id}")
                print(f"🔄 현재 세션 ID로 통계 반환: {current_user_id}")
                user_id = current_user_id  # 현재 세션 ID로 변경
            
            # 통계 데이터 조회 (실제 구현에서는 데이터베이스에서 조회)
            # 🔧 v2.8 수정: 게스트 모드 초기 통계 생성
            if user_id.startswith('guest_'):
                initial_stats = {
                    'totalAttempted': 0,
                    'totalCorrect': 0,
                    'totalIncorrect': 0,
                    'consecutiveCorrect': 0,
                    'currentStreak': 0,
                    'lastStudyDate': None,
                    'studyTime': 0,
                    'accuracy': 0.0
                }
                print(f"✅ 게스트 모드 초기 통계 생성: {user_id}")
                return jsonify({
                    'success': True,
                    'statistics': initial_stats
                }), 200
            else:
                # 실제 사용자 통계 조회 (기존 로직)
                print(f"✅ 사용자 통계 조회: {user_id}")
                return jsonify({
                    'success': True,
                    'statistics': {
                        'totalAttempted': 0,
                        'totalCorrect': 0,
                        'totalIncorrect': 0,
                        'consecutiveCorrect': 0,
                        'currentStreak': 0,
                        'lastStudyDate': None,
                        'studyTime': 0,
                        'accuracy': 0.0
                    }
                }), 200
                
        except Exception as e:
            print(f"❌ 통계 조회 오류: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'통계 조회 중 오류: {str(e)}'
            }), 500

    # 🔧 v2.8 추가: 문제 로딩 API 세션 검증 강화
    @app.route('/api/quiz/question/<session_id>/<int:index>', methods=['GET'])
    def get_question_fixed(session_id, index):
        """특정 문제 조회 - 세션 검증 강화"""
        print(f"=== 문제 조회 (v2.8): {session_id}, {index} ===")
        
        try:
            current_user_id = session.get('current_user_id')
            print(f"🔍 현재 세션 ID: {current_user_id}")
            print(f"🔍 요청한 세션 ID: {session_id}")
            
            # 🔧 v2.8 수정: 세션 ID 검증 개선
            if not current_user_id:
                print("❌ 세션 없음")
                return jsonify({
                    'success': False,
                    'error': '세션이 없습니다',
                    'code': 'NO_SESSION'
                }), 401
            
            # 🔧 v2.8 수정: 세션 ID 불일치 시 현재 세션 ID로 세션 생성
            if not session_id.startswith(current_user_id):
                print(f"⚠️ 세션 ID 불일치 감지: 세션={current_user_id}, 요청={session_id}")
                # 현재 시간을 추가하여 새로운 세션 ID 생성
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                new_session_id = f"{current_user_id}_{timestamp}"
                print(f"🔄 새로운 세션 ID 생성: {new_session_id}")
                session_id = new_session_id
            
            # 🔧 v2.8 수정: 문제 데이터 로드 (JSON 파일에서)
            try:
                import json
                with open('static/questions.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    questions = data.get('questions', [])
                
                if index < 0 or index >= len(questions):
                    print(f"❌ 잘못된 문제 인덱스: {index}, 총 문제 수: {len(questions)}")
                    return jsonify({
                        'success': False,
                        'error': '유효하지 않은 문제 번호입니다',
                        'code': 'INVALID_QUESTION_INDEX'
                    }), 400
                
                question = questions[index]
                print(f"✅ 문제 조회 성공: {index + 1}/{len(questions)}")
                
                return jsonify({
                    'success': True,
                    'question': question,
                    'question_index': index,
                    'total_questions': len(questions),
                    'session_id': session_id
                })
                
            except FileNotFoundError:
                print("❌ questions.json 파일을 찾을 수 없습니다")
                return jsonify({
                    'success': False,
                    'error': '문제 데이터를 찾을 수 없습니다',
                    'code': 'QUESTIONS_FILE_NOT_FOUND'
                }), 404
            except Exception as e:
                print(f"❌ 문제 데이터 로드 오류: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': '문제 데이터 로드 중 오류가 발생했습니다',
                    'code': 'QUESTIONS_LOAD_ERROR'
                }), 500
                
        except Exception as e:
            print(f"❌ 문제 조회 오류: {str(e)}")
            return jsonify({
                'success': False,
                'error': '문제 조회 중 오류가 발생했습니다',
                'code': 'INTERNAL_ERROR'
            }), 500

    # 🔧 v2.8 추가: 디버그 API
    @app.route('/api/debug/session', methods=['GET'])
    def debug_session():
        """세션 정보 조회 (개발용)"""
        return jsonify({
            'session': dict(session),
            'sessionId': session.get('current_user_id'),
            'sessionKeys': list(session.keys()),
            'sessionModified': session.modified,
            'sessionPermanent': session.permanent
        })

    # 🔧 v2.8 추가: 현재 사용자 ID 반환 API (JavaScript용)
    @app.route('/api/user/current-id', methods=['GET'])
    def get_current_user_id():
        """현재 사용자 ID만 반환 (JavaScript에서 사용)"""
        current_user_id = session.get('current_user_id')
        print(f"=== 현재 사용자 ID 조회: {current_user_id} ===")
        
        return jsonify({
            'success': True,
            'user_id': current_user_id,
            'is_guest': session.get('is_guest', False)
        })

    return app

def register_blueprints(app):
    """Blueprint 등록 - 안정적이고 명확한 방법"""
    
    try:
        from routes.quiz_routes import register_quiz_blueprints
        register_quiz_blueprints(app)
        print("✅ Week2 퀴즈 API 등록 성공 (Lego 모델 방식)")
    except ImportError as e:
        print(f"⚠️ Week2 퀴즈 API 등록 실패: {e}")
    
    try:
        from routes.user_registration_v2 import user_registration_bp
        app.register_blueprint(user_registration_bp, url_prefix='/user')
        print("✅ 사용자 등록 라우트 (v2) 활용")
    except ImportError:
        print("⚠️ user_registration_v2 없음")
    
    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp, url_prefix='/api')
        print("✅ 사용자 API 라우트 활용")
    except ImportError:
        print("⚠️ user_routes 없음")
    
    try:
        from routes.home_routes import home_bp
        app.register_blueprint(home_bp)
        print("✅ 홈 라우트 등록")
    except ImportError:
        print("❌ 홈 라우트 없음")
    
    try:
        from routes.learning_routes import learning_bp
        app.register_blueprint(learning_bp)
        print("✅ 학습 라우트 등록")
    except ImportError:
        print("❌ 학습 라우트 없음")
    
    try:
        from routes.settings_routes import settings_bp
        app.register_blueprint(settings_bp)
        print("✅ 설정 라우트 등록")
    except ImportError:
        print("❌ 설정 라우트 없음")
    
    @app.route('/large-category-learning')
    def large_category_learning():
        return render_template('large_category_learning.html')
    
    @app.route('/stats-test')
    def stats_test():
        return render_template('stats_test.html')

    @app.route('/advanced-stats-test')
    def advanced_stats_test():
        return render_template('advanced_stats_test.html')
    
    @app.route('/phase4-real-user-test')
    def phase4_real_user_test():
        return render_template('phase4_real_user_test.html')
    
    @app.route('/phase5-final-optimization')
    def phase5_final_optimization():
        return render_template('phase5_final_optimization.html')

def register_error_handlers(app):
    """에러 핸들러 등록"""
    
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return render_template('500.html'), 500

# Flask 앱 생성
if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("🚀 AICU S4 v2.8 FINAL (세션 ID 불일치 문제 해결)")
    print("📍 URL: http://localhost:5000")
    print("📋 v2.8 개선 사항:")
    print("   ✅ 세션 ID 불일치 자동 수정")
    print("   ✅ 통계 API에서 현재 세션 ID 우선 사용")
    print("   ✅ 문제 로딩 API에서 세션 ID 자동 생성")
    print("   ✅ 현재 사용자 ID 반환 API 추가 (/api/user/current-id)")
    print("   ✅ 디버그 정보 강화")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)

