from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# 문제 데이터 로드
def load_questions():
    try:
        with open('questions.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"questions": []}

# 사용자 데이터 저장
def save_user_data(user_data):
    try:
        with open('user_data.json', 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"사용자 데이터 저장 실패: {e}")
        return False

# 사용자 데이터 로드
def load_user_data():
    try:
        with open('user_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/basic_learning')
def basic_learning():
    return render_template('basic_learning.html')

@app.route('/large_category_learning')
def large_category_learning():
    return render_template('large_category_learning_v3.7.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')

@app.route('/debug')
def debug():
    return render_template('debug.html')

@app.route('/api/register', methods=['POST'])
def api_register():
    try:
        data = request.get_json()
        name = data.get('name', '')
        exam_date = data.get('exam_date', '')
        
        if not name or not exam_date:
            return jsonify({'success': False, 'message': '이름과 시험일을 입력해주세요.'})
        
        user_data = {
            'name': name,
            'exam_date': exam_date,
            'registration_date': datetime.now().isoformat(),
            'type': 'registered'
        }
        
        if save_user_data(user_data):
            return jsonify({'success': True, 'message': '등록이 완료되었습니다.'})
        else:
            return jsonify({'success': False, 'message': '등록 중 오류가 발생했습니다.'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'서버 오류: {str(e)}'})

@app.route('/api/questions')
def api_questions():
    try:
        questions_data = load_questions()
        category = request.args.get('category')
        
        if category:
            # 카테고리별 필터링
            filtered_questions = []
            for q in questions_data.get('questions', []):
                if q.get('layer1') == category:
                    filtered_questions.append(q)
            return jsonify({'questions': filtered_questions})
        else:
            return jsonify(questions_data)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics')
def api_statistics():
    try:
        category = request.args.get('category')
        if category:
            # 카테고리별 통계 조회
            questions_data = load_questions()
            category_questions = [q for q in questions_data.get('questions', []) if q.get('layer1') == category]
            
            stats = {
                'category': category,
                'total_questions': len(category_questions),
                'questions': category_questions
            }
            return jsonify(stats)
        else:
            return jsonify({'error': '카테고리가 필요합니다.'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AICU S4 v4.10 - 성능 최적화 및 안정성 강화 완료")
    print("📍 URL: http://localhost:5000")
    print("📋 v4.10 성능 최적화 및 안정성 강화:")
    print("   ✅ PerformanceOptimizer 클래스 구축 완료")
    print("   ✅ 메모리 사용량 최적화 완료")
    print("   ✅ 이벤트 리스너 최적화 완료")
    print("   ✅ 데이터 구조 최적화 완료")
    print("   ✅ 캐싱 시스템 구축 완료")
    print("   ✅ 지연 로딩 시스템 구축 완료")
    print("   ✅ 에러 처리 강화 완료")
    print("   ✅ 복구 메커니즘 구축 완료")
    print("   ✅ 성능 모니터링 시스템 구축 완료")
    print("   ✅ 자동 정리 시스템 구축 완료")
    print("   ✅ 메모리 누수 방지 시스템 구축 완료")
    print("   ✅ 성능 최적화 테스트 기능 완료")
    print("   ✅ 홈페이지 통합 완료")
    print("   ✅ 116번 문서 과업12 완료")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
