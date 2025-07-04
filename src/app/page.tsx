'use client'

import Link from 'next/link'
import { BookOpen, Users, Brain, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* 헤더 */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              EDU-AI Insight
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              교사 대상 AI 활용 인식 및 수요 설문 플랫폼
            </p>
            <div className="w-24 h-1 bg-indigo-500 mx-auto rounded"></div>
          </div>

          {/* 설문 목적 카드들 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">교육현장 고민</h3>
              <p className="text-sm text-gray-600">현재 교육 현장에서의 고민과 해결과제 파악</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">AI 활용 현황</h3>
              <p className="text-sm text-gray-600">현재 사용 중인 AI 서비스 및 활용 목적 분석</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">학습 희망 영역</h3>
              <p className="text-sm text-gray-600">관심 있는 AI 기술 분야 및 학습 희망 영역 도출</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">연수 기획</h3>
              <p className="text-sm text-gray-600">AI 연수 및 교육솔루션 개발을 위한 기초 데이터 확보</p>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="mb-8">
            <Link 
              href="/survey" 
              className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 text-lg"
            >
              설문 시작하기
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 안내 문구 */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>⏱️ 예상 소요시간: 5-7분</p>
            <p>🔒 개인정보는 익명으로 처리됩니다</p>
            <p>📊 결과는 교육 연구 목적으로만 사용됩니다</p>
          </div>

          {/* 관리자 링크 */}
          <div className="mt-8">
            <Link 
              href="/admin" 
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              관리자 대시보드
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
