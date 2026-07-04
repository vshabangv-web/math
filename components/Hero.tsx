"use client";

import React, { useState } from "react";

export default function Hero() {
  const [clickCount, setClickCount] = useState(0);

  // 선생님들이 공부할 수 있도록 주석으로 친절히 안내합니다.
  const handlePlaceholderClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    
    if (nextCount === 1) {
      alert("🎉 첫 번째 클릭을 환영합니다! 이제 이 코드가 작동하기 시작했어요.");
    } else if (nextCount === 5) {
      alert("🔥 5번이나 클릭하셨네요! 이 버튼 클릭 횟수(state)는 화면 우측 상단에서도 연동되어 표시됩니다.");
    }
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* 백그라운드 디자인 데코레이션 (추상적인 블러 원형 그라데이션) */}
      <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"></div>
      <div className="absolute bottom-10 right-1/4 -z-10 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-500/10"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          
          {/* 배지 라벨 */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20">
            멘토와 함께하는 교육 플랫폼 템플릿
          </span>

          {/* 메인 타이틀 */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
            나만의{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              교육용 웹앱
            </span>{" "}
            만들기
          </h1>

          {/* 설명글 */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-400">
            코딩이 처음이신 선생님들도 걱정하지 마세요. 이 템플릿의 소스 코드를 바탕으로
            원하는 학습 도구, 퀴즈 앱, 인터랙티브 교재를 마음껏 조립하고 배포할 수 있습니다.
          </p>

          {/* 인터랙티브 영역 (클릭 카운터 피드백 포함) */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            
            {/* 수학 슈팅 게임 시작 버튼 */}
            <a
              href="/game"
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-8 font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/35 focus:outline-none focus:ring-2 focus:ring-purple-500/35 active:scale-95"
            >
              <span className="relative flex items-center gap-2">
                🎮 실수 vs 허수 슈팅 게임 시작하기
              </span>
            </a>

            {/* 1. 요구사항: 가짜(Placeholder) 버튼 */}
            <button
              onClick={handlePlaceholderClick}
              className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-indigo-50 px-6 font-medium text-indigo-650 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-300 hover:scale-102 active:scale-95 dark:bg-indigo-950/30 dark:text-indigo-300 dark:ring-indigo-800"
            >
              <span className="relative flex items-center gap-2">
                기능 추가하기 (클릭해보세요!)
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 transition-all">
                  {clickCount}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* 선생님들을 위한 초보 가이드 카드 그리드 */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* 가이드 카드 1 */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-md">
              📂
            </div>
            <h3 className="mt-6 text-base font-bold text-slate-900 dark:text-white">1단계: 폴더 분리 및 이해</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              `components` 폴더에서 `Header`, `Footer`, `Hero` 컴포넌트의 소스 코드를 확인하고 원하는 대로 변경해 보세요.
            </p>
          </div>

          {/* 가이드 카드 2 */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white shadow-md">
              💡
            </div>
            <h3 className="mt-6 text-base font-bold text-slate-900 dark:text-white">2단계: 상태(State) 제어</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              React의 `useState`를 이용해 화면의 글자나 카운트 같은 데이터가 실시간으로 변하는 인터랙션을 추가해 보세요.
            </p>
          </div>

          {/* 가이드 카드 3 */}
          <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500 text-white shadow-md">
              ⚡
            </div>
            <h3 className="mt-6 text-base font-bold text-slate-900 dark:text-white">3단계: Vercel 자동 배포</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              이 템플릿은 깃허브에 올리고 Vercel에 연동하면 클릭 몇 번으로 전 세계에 자랑할 수 있는 온라인 주소가 생깁니다.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
