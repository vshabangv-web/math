import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200/50 bg-slate-50 dark:border-slate-800/50 dark:bg-slate-950/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-center sm:text-left">
          
          {/* 저작권 및 멘트 */}
          <div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              © {currentYear} <span className="font-semibold text-slate-700 dark:text-slate-350">EduApp</span>. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              선생님들의 새로운 도전을 응원하는 코딩 멘토링 템플릿 ✨
            </p>
          </div>

          {/* 푸터 보조 링크 공간 */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              개인정보처리방침
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              이용약관
            </Link>
            <Link
              href="#"
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors duration-200 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              고객지원
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
