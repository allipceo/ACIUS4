# services/quiz_session_service.py
# 문제풀이 기능 - 세션 및 진도 관리 서비스 (220줄 목표)
# Day 2: 사용자별 세션 관리, 학습 진도 추적, 이력 저장

import json
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

@dataclass
class QuestionAttempt:
    """문제 시도 기록"""
    question_index: int
    question_id: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    attempt_time: str
    response_time_seconds: float
    category: str

@dataclass 
class StudySession:
    """학습 세션 정보"""
    session_id: str
    user_id: str
    start_time: str
    end_time: Optional[str]
    mode: str  # 'basic' or 'category'
    category: Optional[str]
    total_questions: int
    attempted_questions: int
    correct_answers: int
    session_duration_minutes: float
    attempts: List[QuestionAttempt]

class QuizSessionService:
    """퀴즈 세션 및 진도 관리 서비스"""
    
    def __init__(self):
        self.data_path = "data/user_sessions.json"
        self.progress_path = "data/user_progress.json"
        self.logger = logging.getLogger(__name__)
        self.sessions_data = {}
        self.progress_data = {}
        self._load_existing_data()
    
    def _load_existing_data(self):
        """기존 세션 및 진도 데이터 로드"""
        try:
            # 세션 데이터 로드
            if os.path.exists(self.data_path):
                with open(self.data_path, 'r', encoding='utf-8') as file:
                    self.sessions_data = json.load(file)
                    
            # 진도 데이터 로드
            if os.path.exists(self.progress_path):
                with open(self.progress_path, 'r', encoding='utf-8') as file:
                    self.progress_data = json.load(file)
                    
            self.logger.info("기존 세션 및 진도 데이터 로드 완료")
            
        except Exception as e:
            self.logger.error(f"데이터 로드 오류: {str(e)}")
            self.sessions_data = {}
            self.progress_data = {}
    
    def create_session(self, user_id: str, mode: str, category: str = None) -> str:
        """새로운 학습 세션 생성"""
        try:
            session_id = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            session = StudySession(
                session_id=session_id,
                user_id=user_id,
                start_time=datetime.now().isoformat(),
                end_time=None,
                mode=mode,
                category=category,
                total_questions=0,
                attempted_questions=0,
                correct_answers=0,
                session_duration_minutes=0.0,
                attempts=[]
            )
            
            # 세션 데이터에 저장
            if user_id not in self.sessions_data:
                self.sessions_data[user_id] = []
            
            self.sessions_data[user_id].append(asdict(session))
            self._save_sessions_data()
            
            self.logger.info(f"새 세션 생성: {session_id} (사용자: {user_id}, 모드: {mode})")
            return session_id
            
        except Exception as e:
            self.logger.error(f"세션 생성 오류: {str(e)}")
            return ""
    
    def get_current_session(self, user_id: str) -> Optional[Dict]:
        """사용자의 현재 활성 세션 반환"""
        try:
            if user_id not in self.sessions_data:
                return None
                
            user_sessions = self.sessions_data[user_id]
            
            # 가장 최근 세션 중 종료되지 않은 세션 찾기
            for session in reversed(user_sessions):
                if session.get('end_time') is None:
                    return session
                    
            return None
            
        except Exception as e:
            self.logger.error(f"현재 세션 조회 오류: {str(e)}")
            return None
    
    def record_attempt(self, user_id: str, session_id: str, question_data: Dict, 
                      user_answer: str, response_time: float) -> bool:
        """문제 시도 기록"""
        try:
            # 정답 확인
            correct_answer = question_data.get('answer', '')
            is_correct = (user_answer.upper() == correct_answer.upper())
            
            # 시도 기록 생성
            attempt = QuestionAttempt(
                question_index=question_data.get('index', 0),
                question_id=question_data.get('qcode', ''),
                user_answer=user_answer,
                correct_answer=correct_answer,
                is_correct=is_correct,
                attempt_time=datetime.now().isoformat(),
                response_time_seconds=response_time,
                category=question_data.get('layer1', '')
            )
            
            # 세션에 시도 기록 추가
            session = self._find_session(user_id, session_id)
            if session:
                session['attempts'].append(asdict(attempt))
                session['attempted_questions'] += 1
                if is_correct:
                    session['correct_answers'] += 1
                    
                self._save_sessions_data()
                self._update_user_progress(user_id, attempt)
                
                self.logger.info(f"시도 기록 완료: {session_id} - {question_data.get('qcode', 'Unknown')}")
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"시도 기록 오류: {str(e)}")
            return False
    
    def end_session(self, user_id: str, session_id: str) -> bool:
        """세션 종료"""
        try:
            session = self._find_session(user_id, session_id)
            if session and session.get('end_time') is None:
                session['end_time'] = datetime.now().isoformat()
                
                # 세션 지속 시간 계산
                start_time = datetime.fromisoformat(session['start_time'])
                end_time = datetime.fromisoformat(session['end_time'])
                duration = (end_time - start_time).total_seconds() / 60
                session['session_duration_minutes'] = round(duration, 2)
                
                self._save_sessions_data()
                self.logger.info(f"세션 종료: {session_id} (지속시간: {duration:.1f}분)")
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"세션 종료 오류: {str(e)}")
            return False
    
    def get_user_statistics(self, user_id: str) -> Dict:
        """사용자 통계 정보 반환"""
        try:
            if user_id not in self.sessions_data:
                return self._empty_statistics()
                
            user_sessions = self.sessions_data[user_id]
            total_attempts = 0
            total_correct = 0
            total_time = 0.0
            category_stats = {}
            
            for session in user_sessions:
                attempts = session.get('attempts', [])
                total_attempts += len(attempts)
                
                for attempt in attempts:
                    if attempt.get('is_correct'):
                        total_correct += 1
                    total_time += attempt.get('response_time_seconds', 0)
                    
                    category = attempt.get('category', 'Unknown')
                    if category not in category_stats:
                        category_stats[category] = {'total': 0, 'correct': 0}
                    category_stats[category]['total'] += 1
                    if attempt.get('is_correct'):
                        category_stats[category]['correct'] += 1
            
            # 정답률 계산
            accuracy = (total_correct / total_attempts * 100) if total_attempts > 0 else 0
            avg_response_time = (total_time / total_attempts) if total_attempts > 0 else 0
            
            return {
                'user_id': user_id,
                'total_attempts': total_attempts,
                'correct_answers': total_correct,
                'accuracy_percentage': round(accuracy, 1),
                'average_response_time': round(avg_response_time, 2),
                'total_sessions': len(user_sessions),
                'category_statistics': category_stats,
                'last_study_date': self._get_last_study_date(user_sessions)
            }
            
        except Exception as e:
            self.logger.error(f"사용자 통계 계산 오류: {str(e)}")
            return self._empty_statistics()
    
    def get_session_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """사용자 세션 이력 반환"""
        try:
            if user_id not in self.sessions_data:
                return []
                
            user_sessions = self.sessions_data[user_id]
            
            # 최신 순으로 정렬하여 제한된 수만큼 반환
            sorted_sessions = sorted(
                user_sessions, 
                key=lambda x: x.get('start_time', ''),
                reverse=True
            )
            
            return sorted_sessions[:limit]
            
        except Exception as e:
            self.logger.error(f"세션 이력 조회 오류: {str(e)}")
            return []
    
    def _find_session(self, user_id: str, session_id: str) -> Optional[Dict]:
        """특정 세션 찾기"""
        if user_id not in self.sessions_data:
            return None
            
        for session in self.sessions_data[user_id]:
            if session.get('session_id') == session_id:
                return session
                
        return None
    
    def _save_sessions_data(self):
        """세션 데이터 저장"""
        try:
            os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
            with open(self.data_path, 'w', encoding='utf-8') as file:
                json.dump(self.sessions_data, file, ensure_ascii=False, indent=2)
                
        except Exception as e:
            self.logger.error(f"세션 데이터 저장 오류: {str(e)}")
    
    def _update_user_progress(self, user_id: str, attempt: QuestionAttempt):
        """사용자 전체 진도 업데이트"""
        try:
            if user_id not in self.progress_data:
                self.progress_data[user_id] = {
                    'total_attempts': 0,
                    'correct_answers': 0,
                    'categories_attempted': set(),
                    'last_updated': datetime.now().isoformat()
                }
            
            progress = self.progress_data[user_id]
            progress['total_attempts'] += 1
            if attempt.is_correct:
                progress['correct_answers'] += 1
            progress['categories_attempted'].add(attempt.category)
            progress['last_updated'] = datetime.now().isoformat()
            
            # set을 list로 변환하여 JSON 저장 가능하게 함
            progress['categories_attempted'] = list(progress['categories_attempted'])
            
            self._save_progress_data()
            
        except Exception as e:
            self.logger.error(f"진도 업데이트 오류: {str(e)}")
    
    def _save_progress_data(self):
        """진도 데이터 저장"""
        try:
            os.makedirs(os.path.dirname(self.progress_path), exist_ok=True)
            with open(self.progress_path, 'w', encoding='utf-8') as file:
                json.dump(self.progress_data, file, ensure_ascii=False, indent=2)
                
        except Exception as e:
            self.logger.error(f"진도 데이터 저장 오류: {str(e)}")
    
    def _empty_statistics(self) -> Dict:
        """빈 통계 반환"""
        return {
            'user_id': '',
            'total_attempts': 0,
            'correct_answers': 0,
            'accuracy_percentage': 0.0,
            'average_response_time': 0.0,
            'total_sessions': 0,
            'category_statistics': {},
            'last_study_date': None
        }
    
    def _get_last_study_date(self, sessions: List[Dict]) -> Optional[str]:
        """마지막 학습 날짜 반환"""
        if not sessions:
            return None
            
        latest_session = max(sessions, key=lambda x: x.get('start_time', ''))
        return latest_session.get('start_time', '')[:10]  # YYYY-MM-DD 형태로 반환

# 전역 인스턴스 (싱글톤 패턴)
quiz_session_service = QuizSessionService()

def get_quiz_session_service() -> QuizSessionService:
    """QuizSessionService 인스턴스 반환"""
    return quiz_session_service

# 테스트 함수 (개발용)
def test_quiz_session_service():
    """세션 서비스 동작 테스트"""
    service = get_quiz_session_service()
    
    print("=== QuizSessionService 테스트 시작 ===")
    
    # 1. 세션 생성 테스트
    user_id = "조대표"
    session_id = service.create_session(user_id, "basic")
    print(f"✅ 세션 생성: {session_id}")
    
    # 2. 현재 세션 조회 테스트
    current_session = service.get_current_session(user_id)
    print(f"✅ 현재 세션: {current_session['session_id'] if current_session else 'None'}")
    
    # 3. 문제 시도 기록 테스트
    sample_question = {
        'index': 1,
        'qcode': 'TEST-001',
        'question': '테스트 문제입니다',
        'answer': 'O',
        'layer1': '06재산보험'
    }
    
    success = service.record_attempt(user_id, session_id, sample_question, 'O', 2.5)
    print(f"✅ 시도 기록: {'성공' if success else '실패'}")
    
    # 4. 사용자 통계 테스트
    stats = service.get_user_statistics(user_id)
    print(f"✅ 사용자 통계: {stats['total_attempts']}회 시도, {stats['accuracy_percentage']}% 정답률")
    
    # 5. 세션 종료 테스트
    end_success = service.end_session(user_id, session_id)
    print(f"✅ 세션 종료: {'성공' if end_success else '실패'}")
    
    # 6. 세션 이력 테스트
    history = service.get_session_history(user_id, 5)
    print(f"✅ 세션 이력: {len(history)}개 세션")
    
    print("=== 테스트 완료 ===")
    return True

if __name__ == "__main__":
    test_quiz_session_service()