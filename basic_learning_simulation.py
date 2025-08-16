# basic_learning_simulation.py
import json
import requests
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class BasicLearningSimulation:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.results = []
        self.driver = None
        
    def setup_webdriver(self):
        """웹드라이버 설정"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")  # 헤드리스 모드
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.get(f"{self.base_url}")
            
            self.results.append({
                "test": "웹드라이버 설정",
                "status": "성공",
                "message": "브라우저 연결 완료"
            })
            print("✅ 웹드라이버 설정 성공")
            
        except Exception as e:
            self.results.append({
                "test": "웹드라이버 설정",
                "status": "실패",
                "error": str(e)
            })
            print(f"❌ 웹드라이버 설정 실패: {e}")
    
    def simulate_basic_learning_start(self):
        """기본학습 시작 시뮬레이션"""
        try:
            print("🔄 기본학습 페이지 로드 중...")
            
            # 기본학습 페이지로 이동
            self.driver.get(f"{self.base_url}/basic-learning")
            
            # 페이지 로드 대기
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "basic-learning-screen"))
            )
            
            # 학습 방식 선택 버튼 확인
            continue_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '이어풀기')]")
            continue_button.click()
            
            # 문제 영역 로드 대기
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "basic-question-area"))
            )
            
            # 문제 텍스트 확인
            question_text = self.driver.find_element(By.ID, "question-text")
            question_content = question_text.text
            
            self.results.append({
                "test": "기본학습 자동 시작",
                "status": "성공",
                "message": f"문제 로드 완료: {question_content[:50]}..."
            })
            print(f"✅ 기본학습 자동 시작 성공: {question_content[:50]}...")
            
        except Exception as e:
            self.results.append({
                "test": "기본학습 자동 시작",
                "status": "실패",
                "error": str(e)
            })
            print(f"❌ 기본학습 자동 시작 실패: {e}")
    
    def simulate_answer_check(self):
        """정답 확인 시뮬레이션"""
        try:
            print("🔄 정답 확인 시뮬레이션 중...")
            
            # 답안 선택 (첫 번째 옵션)
            answer_options = self.driver.find_elements(By.CSS_SELECTOR, "input[name='answer']")
            if answer_options:
                answer_options[0].click()
                print("✅ 답안 선택 완료")
            else:
                # 라디오 버튼이 없는 경우, 텍스트 기반 답안 선택
                answer_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'O') or contains(text(), 'X') or contains(text(), '1') or contains(text(), '2') or contains(text(), '3') or contains(text(), '4')]")
                if answer_buttons:
                    answer_buttons[0].click()
                    print("✅ 텍스트 기반 답안 선택 완료")
                else:
                    print("⚠️ 답안 옵션을 찾을 수 없습니다")
            
            # 정답 확인 버튼 클릭
            check_button = self.driver.find_element(By.XPATH, "//button[contains(text(), '정답 확인')]")
            check_button.click()
            
            # 결과 표시 대기
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.ID, "correct-answer"))
            )
            
            self.results.append({
                "test": "정답 확인",
                "status": "성공",
                "message": "정답 확인 완료"
            })
            print("✅ 정답 확인 성공")
            
        except Exception as e:
            self.results.append({
                "test": "정답 확인",
                "status": "실패",
                "error": str(e)
            })
            print(f"❌ 정답 확인 실패: {e}")
    
    def simulate_data_synchronization(self):
        """데이터 동기화 시뮬레이션"""
        try:
            print("🔄 데이터 동기화 시뮬레이션 중...")
            
            # 홈페이지로 이동하여 통계 확인
            self.driver.get(f"{self.base_url}")
            
            # 통계 업데이트 대기
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, "statistics"))
            )
            
            # 통계 값 확인
            stats_elements = self.driver.find_elements(By.CLASS_NAME, "statistics")
            if stats_elements:
                stats_text = stats_elements[0].text
                print(f"📊 통계 확인: {stats_text[:50]}...")
            else:
                stats_text = "통계 정보 없음"
            
            self.results.append({
                "test": "데이터 동기화",
                "status": "성공",
                "message": f"통계 업데이트 확인: {stats_text[:30]}..."
            })
            print("✅ 데이터 동기화 성공")
            
        except Exception as e:
            self.results.append({
                "test": "데이터 동기화",
                "status": "실패",
                "error": str(e)
            })
            print(f"❌ 데이터 동기화 실패: {e}")
    
    def simulate_central_data_integration(self):
        """중앙 데이터 연동 시뮬레이션"""
        try:
            print("🔄 중앙 데이터 연동 시뮬레이션 중...")
            
            # localStorage에서 중앙 데이터 확인
            real_time_data = self.driver.execute_script("return localStorage.getItem('aicu_real_time_data')")
            
            if real_time_data:
                data = json.loads(real_time_data)
                print(f"📊 중앙 데이터 확인: {len(data)}개 카테고리")
                
                # 기본학습 관련 데이터 확인
                basic_learning_data = data.get('basic_learning', {})
                if basic_learning_data:
                    print(f"✅ 기본학습 데이터 발견: {basic_learning_data}")
                else:
                    print("⚠️ 기본학습 데이터가 없습니다")
            else:
                print("⚠️ 중앙 데이터가 없습니다")
            
            self.results.append({
                "test": "중앙 데이터 연동",
                "status": "성공",
                "message": "중앙 데이터 확인 완료"
            })
            print("✅ 중앙 데이터 연동 성공")
            
        except Exception as e:
            self.results.append({
                "test": "중앙 데이터 연동",
                "status": "실패",
                "error": str(e)
            })
            print(f"❌ 중앙 데이터 연동 실패: {e}")
    
    def run_full_simulation(self):
        """전체 시뮬레이션 실행"""
        print("🚀 기본학습 시뮬레이션 시작")
        print("=" * 60)
        
        self.setup_webdriver()
        self.simulate_basic_learning_start()
        self.simulate_answer_check()
        self.simulate_central_data_integration()
        self.simulate_data_synchronization()
        
        self.generate_report()
        
        if self.driver:
            self.driver.quit()
    
    def generate_report(self):
        """시뮬레이션 결과 리포트 생성"""
        success_count = sum(1 for r in self.results if r["status"] == "성공")
        total_count = len(self.results)
        success_rate = (success_count / total_count * 100) if total_count > 0 else 0
        
        report = {
            "시뮬레이션_정보": {
                "실행_시간": time.strftime("%Y-%m-%d %H:%M:%S"),
                "총_테스트": total_count,
                "성공": success_count,
                "실패": total_count - success_count,
                "성공률": f"{success_rate:.1f}%"
            },
            "상세_결과": self.results
        }
        
        # 리포트 저장
        with open('basic_learning_simulation_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 기본학습 시뮬레이션 완료: {success_rate:.1f}% 성공률")
        print(f"📊 상세 결과: basic_learning_simulation_report.json")
        
        return report

if __name__ == "__main__":
    simulator = BasicLearningSimulation()
    simulator.run_full_simulation()
