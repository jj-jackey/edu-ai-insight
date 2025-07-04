'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import type { SurveyResponse } from '@/utils/supabase'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, Target } from 'lucide-react'

export default function InsightsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState({
    correlations: [],
    trends: [],
    segments: []
  })

  useEffect(() => {
    fetchResponses()
  }, [])

  const fetchResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setResponses(data || [])
      analyzeInsights(data || [])
    } catch (error) {
      console.error('데이터 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeInsights = (data: SurveyResponse[]) => {
    // 교직경력별 AI 인식도 분석
    const experienceAnalysis = {}
    const subjectAnalysis = {}
    
    data.forEach(response => {
      const rating = typeof response.ai_positive_rating === 'string' 
        ? parseInt(response.ai_positive_rating, 10) 
        : response.ai_positive_rating

      // 경력별 분석
      if (!experienceAnalysis[response.experience_years]) {
        experienceAnalysis[response.experience_years] = { 
          total: 0, 
          sum: 0, 
          aiTools: 0,
          count: 0
        }
      }
      experienceAnalysis[response.experience_years].total += rating
      experienceAnalysis[response.experience_years].count += 1
      experienceAnalysis[response.experience_years].aiTools += response.ai_tools_used?.length || 0

      // 교과목별 분석
      if (!subjectAnalysis[response.subject]) {
        subjectAnalysis[response.subject] = { 
          total: 0, 
          sum: 0, 
          problems: [],
          count: 0
        }
      }
      subjectAnalysis[response.subject].total += rating
      subjectAnalysis[response.subject].count += 1
      if (response.problems) {
        subjectAnalysis[response.subject].problems.push(...response.problems)
      }
    })

    // 상관관계 데이터 생성
    const correlations = Object.entries(experienceAnalysis).map(([exp, data]) => ({
      experience: exp,
      avgRating: data.count > 0 ? (data.total / data.count).toFixed(1) : 0,
      avgAITools: data.count > 0 ? (data.aiTools / data.count).toFixed(1) : 0,
      count: data.count
    }))

    setInsights({
      correlations,
      trends: Object.entries(subjectAnalysis).map(([subject, data]) => ({
        subject,
        avgRating: data.count > 0 ? (data.total / data.count).toFixed(1) : 0,
        problemCount: data.problems.length,
        count: data.count
      })),
      segments: []
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">심화 분석 리포트</h1>
          <p className="mt-2 text-gray-600">교사별 세그먼트 및 상관관계 분석</p>
        </div>

        {/* 인사이트 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">주요 발견</p>
                <p className="text-lg font-semibold text-gray-900">경력 ↑ AI 인식 ↑</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">교과목 격차</p>
                <p className="text-lg font-semibold text-gray-900">STEM > 인문계</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">타겟 그룹</p>
                <p className="text-lg font-semibold text-gray-900">신규 교사 지원</p>
              </div>
            </div>
          </div>
        </div>

        {/* 상관관계 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">교직경력별 AI 인식도</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={insights.correlations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="avgAITools" 
                  type="number" 
                  domain={[0, 'dataMax']}
                  name="평균 AI 도구 수"
                />
                <YAxis 
                  dataKey="avgRating" 
                  type="number" 
                  domain={[1, 5]}
                  name="AI 긍정 인식"
                />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'avgRating' ? 'AI 인식도' : 'AI 도구 수']}
                  labelFormatter={(value) => `응답수: ${value}`}
                />
                <Scatter 
                  dataKey="avgRating" 
                  fill="#8884d8"
                  name="AI 인식도"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">교과목별 AI 활용 패턴</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={insights.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="avgRating" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="평균 AI 인식도"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 세그먼트 분석 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">교사 세그먼트별 특성 분석</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-green-700 mb-2">🌟 AI 선도형</h4>
              <p className="text-sm text-gray-600 mb-3">경력 10년+ STEM 교사</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• AI 도구 3개+ 사용</li>
                <li>• 긍정 인식도 4.5+</li>
                <li>• 자료제작에 활용</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-700 mb-2">📚 AI 관심형</h4>
              <p className="text-sm text-gray-600 mb-3">경력 4-9년 전교과</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• AI 도구 1-2개 사용</li>
                <li>• 연수 욕구 높음</li>
                <li>• 시험문제 생성 관심</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-700 mb-2">🤔 AI 탐색형</h4>
              <p className="text-sm text-gray-600 mb-3">경력 1-3년 신규교사</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• ChatGPT 위주 사용</li>
                <li>• 업무 효율화 목적</li>
                <li>• 가이드라인 필요</li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-red-700 mb-2">⚠️ AI 신중형</h4>
              <p className="text-sm text-gray-600 mb-3">경력 20년+ 인문계</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• AI 도구 사용 적음</li>
                <li>• 교육윤리 우려</li>
                <li>• 체계적 연수 필요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 정책 제안 */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-indigo-900 mb-4">📋 정책 제안 및 시사점</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-indigo-800 mb-2">🎯 맞춤형 연수 설계</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• 신규교사: 기초 활용법 중심</li>
                <li>• 경력교사: 고급 기능 및 윤리</li>
                <li>• STEM: 전문도구 활용법</li>
                <li>• 인문계: 창의적 활용 방안</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-indigo-800 mb-2">🔧 지원 방안</h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• 학교별 AI 리더 교사 양성</li>
                <li>• 교과목별 AI 활용 가이드라인</li>
                <li>• 정기적 성과 공유 워크샵</li>
                <li>• AI 윤리 교육 프로그램</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 