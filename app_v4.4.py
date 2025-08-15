# app_v4.4.py - AICU S4 고급통계 Week3 구현 (오답 분석 + 개인 맞춤 인사이트) + 워크플로우 수정

from flask import Flask, render_template, redirect, url_for, jsonify, request
from datetime import datetime
import os
import json

def create_app():
    """AICU S4 v4.4 - 고급통계 Week3 구현 (오답 분석 + 개인 맞춤 인사이트) + 워크플로우 수정"""
    app = Flask(__name__)
    
    # 앱 설정 (세션 제거, 단순화)
    app.config['SECRET_KEY'] = 'aicu_season4_v4_4_workflow_fix'
    
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
        return render_template('large_category_learning_v3.7.html')
    
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

    # 대분류 통계 API (98번 문서 기반)
    @app.route('/api/category/statistics', methods=['GET'])
    def get_category_statistics():
        """대분류 통계 조회"""
        print("=== 대분류 통계 조회 API 호출 ===")
        
        try:
            # 98번 문서 기반 대분류 통계 구조
            category_statistics = {
                "categories": {
                    "06재산보험": {
                        "total_questions": 169,
                        "solved": 0,
                        "correct": 0,
                        "accuracy": 0,
                        "current_question_index": 0,
                        "daily_progress": {}
                    },
                    "07특종보험": {
                        "total_questions": 182,
                        "solved": 0,
                        "correct": 0,
                        "accuracy": 0,
                        "current_question_index": 0,
                        "daily_progress": {}
                    },
                    "08배상책임보험": {
                        "total_questions": 268,
                        "solved": 0,
                        "correct": 0,
                        "accuracy": 0,
                        "current_question_index": 0,
                        "daily_progress": {}
                    },
                    "09해상보험": {
                        "total_questions": 170,
                        "solved": 0,
                        "correct": 0,
                        "accuracy": 0,
                        "current_question_index": 0,
                        "daily_progress": {}
                    }
                },
                "last_updated": datetime.now().isoformat()
            }
            
            print("✅ 대분류 통계 조회 성공")
            return jsonify({
                'success': True,
                'data': category_statistics
            })
            
        except Exception as e:
            print(f"❌ 대분류 통계 조회 실패: {e}")
            return jsonify({
                'success': False,
                'message': '대분류 통계 조회에 실패했습니다.'
            }), 500

    # 대분류 문제 필터링 API
    @app.route('/api/category/questions/<category>', methods=['GET'])
    def get_category_questions(category):
        """카테고리별 문제 조회"""
        print(f"=== 카테고리별 문제 조회: {category} ===")
        
        try:
            # 문제 파일 경로
            questions_file = os.path.join(app.static_folder, 'questions.json')
            
            if os.path.exists(questions_file):
                with open(questions_file, 'r', encoding='utf-8') as f:
                    questions_data = json.load(f)
                
                # 카테고리별 문제 필터링
                filtered_questions = []
                for question in questions_data.get('questions', []):
                    if question.get('layer1') == category:
                        filtered_questions.append(question)
                
                print(f"✅ {category} 카테고리 문제 조회 성공: {len(filtered_questions)}개")
                return jsonify({
                    'success': True,
                    'category': category,
                    'total_questions': len(filtered_questions),
                    'questions': filtered_questions
                })
            else:
                return jsonify({
                    'success': False,
                    'error': '문제 파일을 찾을 수 없습니다.'
                }), 404
                
        except Exception as e:
            print(f"❌ 카테고리별 문제 조회 실패: {e}")
            return jsonify({
                'success': False,
                'message': '카테고리별 문제 조회에 실패했습니다.'
            }), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print("============================================================")
    print("🚀 AICU S4 v4.4 - 고급통계 Week3 구현 (오답 분석 + 개인 맞춤 인사이트) + 워크플로우 수정")
    print("📍 URL: http://localhost:5000")
    print("📋 v4.4 워크플로우 수정 사항:")
    print("   ✅ 기본학습 우측상단 버튼 변경: '대분류메뉴로' → '홈으로'")
    print("   ✅ 기본학습에서 홈으로 이동하는 워크플로우 구현")
    print("   ✅ 대분류학습 워크플로우는 그대로 유지")
    print("   ✅ 98번 문서 기반 대분류 통계 시스템 구현")
    print("   ✅ 올바른 4대 분류 기준 적용 (06재산보험, 07특종보험, 08배상책임보험, 09해상보험)")
    print("   ✅ 카테고리별 문제 필터링 API 구현")
    print("   ✅ 대분류 통계 조회 API 구현")
    print("   ✅ JSON 파일의 실제 layer1 필드 기반 분류")
    print("   ✅ 등록시점기반 통계 시스템 확장")
    print("   ✅ LocalStorage 기반 데이터 보존")
    print("   ✅ 게스트 모드 자동 설정 (GuestModeManager)")
    print("   ✅ D-day 카운터 구현 (DDayCounter)")
    print("   ✅ 성능 모니터링 시스템 (PerformanceMonitor)")
    print("   ✅ 롤백 시스템 (RollbackManager)")
    print("   ✅ 101번 요구사항 Week1 완료")
    print("   ✅ 과목별 예상 점수 계산 (PredictedScoresManager)")
    print("   ✅ 합격 확률 예측 (PassProbabilityCalculator)")
    print("   ✅ 4대 분류 기준 예상점수 (재산보험, 특종보험, 배상책임보험, 해상보험)")
    print("   ✅ 합격 기준 적용 (과목당 40점 이상, 전체 평균 60점 이상)")
    print("   ✅ 위험도 레벨 판정 (높음/보통/낮음/매우낮음)")
    print("   ✅ 101번 요구사항 Week2 완료")
    print("   ✅ 오답 횟수별 분석 (1-5번 틀린 문제별 상세 분석)")
    print("   ✅ 개인 맞춤 인사이트 (학습 패턴 기반 개선 방향)")
    print("   ✅ 위험도별 문제 분류 (매우위험/높은위험/보통위험/낮은위험)")
    print("   ✅ 과목별 약점 분석 (과목별 오답 패턴)")
    print("   ✅ 학습 권장사항 생성 (우선순위별 복습 가이드)")
    print("   ✅ 101번 요구사항 Week3 완료")
    print("============================================================")
    app.run(host='0.0.0.0', port=port, debug=True)
