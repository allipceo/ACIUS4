# app_v3.6.py - AICU S4 새로운 사용자 등록 시스템 (조대표님 시나리오 기반)

from flask import Flask, render_template, redirect, url_for, jsonify, request
from datetime import datetime
import os
import json

def create_app():
    """AICU S4 v3.6 - 새로운 사용자 등록 시스템"""
    app = Flask(__name__)
    
    # 앱 설정 (세션 제거, 단순화)
    app.config['SECRET_KEY'] = 'aicu_season4_v3_6_simple_registration'
    
    # 메인 라우트 - 등록 상태 확인 후 적절한 페이지로 리다이렉트
    @app.route('/')
    def index():
        """앱 시작점 - 등록 상태 확인"""
        print("=== 앱 시작점 접속 ===")
        return render_template('registration_check.html')
    
    # 등록 상태 확인 API
    @app.route('/api/check-registration', methods=['GET'])
    def check_registration():
        """사용자 등록 상태 확인"""
        print("=== 등록 상태 확인 API 호출 ===")
        
        # LocalStorage에서 등록 정보 확인 (클라이언트 측에서 처리)
        # 서버는 단순히 등록 페이지로 안내
        return jsonify({
            'success': True,
            'needs_registration': True,
            'message': '등록 상태를 확인하세요'
        })
    
    # 사용자 등록 페이지
    @app.route('/register')
    def register():
        """사용자 등록 페이지"""
        print("=== 사용자 등록 페이지 접속 ===")
        return render_template('user_registration.html')
    
    # 게스트 등록 API
    @app.route('/api/register/guest', methods=['POST'])
    def register_guest():
        """게스트 등록"""
        print("=== 게스트 등록 API 호출 ===")
        
        try:
            data = request.get_json()
            guest_name = data.get('name', '게스트')
            exam_date = data.get('exam_date', '2025-09-13')
            registration_date = datetime.now().strftime('%Y-%m-%d')
            
            guest_data = {
                'user_type': 'guest',
                'name': guest_name,
                'exam_subject': 'ACIU',
                'exam_date': exam_date,
                'registration_date': registration_date,
                'created_at': datetime.now().isoformat()
            }
            
            print(f"✅ 게스트 등록 완료: {guest_name}")
            return jsonify({
                'success': True,
                'message': '게스트 등록이 완료되었습니다.',
                'user_data': guest_data
            })
            
        except Exception as e:
            print(f"❌ 게스트 등록 실패: {e}")
            return jsonify({
                'success': False,
                'message': '게스트 등록에 실패했습니다.'
            }), 400
    
    # 실제 사용자 등록 API
    @app.route('/api/register/user', methods=['POST'])
    def register_user():
        """실제 사용자 등록"""
        print("=== 실제 사용자 등록 API 호출 ===")
        
        try:
            data = request.get_json()
            user_name = data.get('name', '')
            user_phone = data.get('phone', '')
            exam_date = data.get('exam_date', '')
            registration_date = datetime.now().strftime('%Y-%m-%d')
            
            # 입력값 검증
            if not user_name or len(user_name) < 2:
                return jsonify({
                    'success': False,
                    'message': '이름을 2글자 이상 입력해주세요.'
                }), 400
            
            if not user_phone:
                return jsonify({
                    'success': False,
                    'message': '전화번호를 입력해주세요.'
                }), 400
            
            if not exam_date:
                return jsonify({
                    'success': False,
                    'message': '시험일자를 입력해주세요.'
                }), 400
            
            user_data = {
                'user_type': 'registered',
                'name': user_name,
                'phone': user_phone,
                'exam_subject': 'ACIU',
                'exam_date': exam_date,
                'registration_date': registration_date,
                'created_at': datetime.now().isoformat()
            }
            
            print(f"✅ 실제 사용자 등록 완료: {user_name}")
            return jsonify({
                'success': True,
                'message': '사용자 등록이 완료되었습니다.',
                'user_data': user_data
            })
            
        except Exception as e:
            print(f"❌ 실제 사용자 등록 실패: {e}")
            return jsonify({
                'success': False,
                'message': '사용자 등록에 실패했습니다.'
            }), 400
    
    # 대문 페이지 (등록 완료 후)
    @app.route('/home')
    def home():
        """대문 페이지 - 등록 완료 후 접근"""
        print("=== 대문 페이지 접속 ===")
        return render_template('home.html')
    
    # 기본 학습 페이지
    @app.route('/basic-learning')
    def basic_learning():
        """기본 학습 페이지"""
        print("=== 기본 학습 페이지 접속 ===")
        return render_template('basic_learning.html')
    
    # 대분류 학습 페이지
    @app.route('/large-category-learning')
    def large_category_learning():
        """대분류 학습 페이지"""
        print("=== 대분류 학습 페이지 접속 ===")
        return render_template('large_category_learning.html')
    
    # 통계 페이지
    @app.route('/statistics')
    def statistics():
        """통계 페이지"""
        print("=== 통계 페이지 접속 ===")
        return render_template('statistics.html')
    
    # 설정 페이지
    @app.route('/settings')
    def settings():
        """설정 페이지"""
        print("=== 설정 페이지 접속 ===")
        return render_template('settings.html')
    
    # 사용자 정보 초기화 API
    @app.route('/api/reset-user', methods=['POST'])
    def reset_user():
        """사용자 정보 초기화"""
        print("=== 사용자 정보 초기화 API 호출 ===")
        
        try:
            # 클라이언트 측에서 LocalStorage 초기화
            return jsonify({
                'success': True,
                'message': '사용자 정보가 초기화되었습니다. 다시 등록해주세요.'
            })
            
        except Exception as e:
            print(f"❌ 사용자 정보 초기화 실패: {e}")
            return jsonify({
                'success': False,
                'message': '초기화에 실패했습니다.'
            }), 400
    
    # 퀴즈 관련 API (기본)
    @app.route('/api/quiz/questions')
    def get_quiz_questions():
        """퀴즈 문제 조회"""
        try:
            # 문제 파일 경로
            questions_file = os.path.join(app.static_folder, 'questions.json')
            
            if os.path.exists(questions_file):
                with open(questions_file, 'r', encoding='utf-8') as f:
                    questions_data = json.load(f)
                return jsonify(questions_data)
            else:
                return jsonify({
                    'error': '문제 파일을 찾을 수 없습니다.',
                    'questions': []
                }), 404
                
        except Exception as e:
            print(f"❌ 퀴즈 문제 조회 실패: {e}")
            return jsonify({
                'error': '퀴즈 문제를 불러오는데 실패했습니다.',
                'questions': []
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print("============================================================")
    print("🚀 AICU S4 v3.9 - 대분류 학습 시스템 구현")
    print("📍 URL: http://localhost:5000")
    print("📋 v3.9 개선 사항:")
    print("   ✅ 대분류 학습 4개 카테고리 메뉴 복원")
    print("   ✅ 카테고리별 문제 필터링 시스템")
    print("   ✅ 카테고리별 통계 추적 및 표시")
    print("   ✅ 카테고리별 이어풀기 기능")
    print("   ✅ 기본학습 페이지 카테고리 모드 지원")
    print("   ✅ 카테고리별 진행상황 저장/복원")
    print("   ✅ 이어풀기-통계 데이터 동기화")
    print("   ✅ 기존 통계 데이터 자동 복원")
    print("   ✅ 등록 시점 기반 누적 통계 시스템")
    print("   ✅ LocalStorage 기반 데이터 보존")
    print("============================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
