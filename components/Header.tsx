import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md transition-all duration-300 dark:border-slate-850/50 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 서비스 로고 영역 */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent sm:text-2xl">
              EduApp ✨
            </span>
          </Link>
        </div>

        {/* 네비게이션 메뉴 (데스크톱) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/game" 
            className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            🎯 수학 슈팅 게임
          </Link>
          <Link 
            href="/chatbot" 
            className="text-sm font-bold text-purple-600 hover:text-purple-500 transition-colors duration-200 dark:text-purple-400 dark:hover:text-purple-300"
          >
            💬 수학 챗봇
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            시작 가이드
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            수업 도구함
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            자료 공유
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            멘토링 문의
          </Link>
        </nav>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200 dark:text-slate-300 dark:hover:text-white"
          >
            로그인
          </Link>
          <Link
            href="#"
            className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 text-xs font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-102 active:scale-98"
          >
            시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
