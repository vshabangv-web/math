-- 수학 슈팅 게임: 실수 vs 허수 결과 저장용 테이블 생성 쿼리
-- Supabase SQL Editor에 복사하여 실행해주세요.

-- 1. 기존 테이블이 있다면 삭제 (필요한 경우만)
-- DROP TABLE IF EXISTS public.game_scores;

-- 2. 테이블 생성
CREATE TABLE public.game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    correct_hits INTEGER DEFAULT 0 NOT NULL,
    incorrect_hits INTEGER DEFAULT 0 NOT NULL,
    accuracy NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    survival_time INTEGER DEFAULT 0 NOT NULL
);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- 4. 누구나 점수를 기록할 수 있도록 허용하는 정책 (Insert)
CREATE POLICY "Allow public insert" 
ON public.game_scores 
FOR INSERT 
WITH CHECK (true);

-- 5. 누구나 명예의 전당(리더보드)을 조회할 수 있도록 허용하는 정책 (Select)
CREATE POLICY "Allow public select" 
ON public.game_scores 
FOR SELECT 
USING (true);

-- 6. 성능 향상을 위한 인덱스 추가 (점수 내림차순 정렬 조회 최적화)
CREATE INDEX idx_game_scores_score_desc ON public.game_scores (score DESC);
