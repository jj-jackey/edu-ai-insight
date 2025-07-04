'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/utils/supabase'
import type { SurveyResponse } from '@/utils/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Users, BookOpen, Brain } from 'lucide-react'

export default function AdminPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    bySubject: {},
    byLocation: {},
    byAITools: {},
    avgRating: 0
  })

  const fetchResponses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setResponses(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('데이터 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])

  const calculateStats = (data: SurveyResponse[]) => {
    const bySubject: { [key: string]: number } = {}
    const byLocation: { [key: string]: number } = {}
    const byAITools: { [key: string]: number } = {}
    let totalRating = 0

    data.forEach(response => {
      // 교과목별 통계
      bySubject[response.subject] = (bySubject[response.subject] || 0) + 1
      
      // 지역별 통계
      byLocation[response.location] = (byLocation[response.location] || 0) + 1
      
      // AI 도구별 통계
      if (response.ai_tools_used) {
        response.ai_tools_used.forEach(tool => {
          byAITools[tool] = (byAITools[tool] || 0) + 1
        })
      }
      
      // 평균 평점
      if (typeof response.ai_positive_rating === 'string') {
        totalRating += parseInt(response.ai_positive_rating, 10)
      } else {
        totalRating += response.ai_positive_rating
      }
    })

    setStats({
      total: data.length,
      bySubject,
      byLocation,
      byAITools,
      avgRating: data.length > 0 ? totalRating / data.length : 0
    })
  }

  const downloadCSV = () => {
    const headers = [
      '제출일시', '교과목', '근무지', '학교명', '근무형태', '교직경력',
      '주요고민', '교육문제', 'AI도구', 'AI용도', '관심분야', 'AI평점', '필요지원'
    ]
    
    const csvData = responses.map(response => [
      response.created_at,
      response.subject,
      response.location,
      response.school_name,
      response.employment_type,
      response.experience_years,
      response.main_concern,
      response.problems?.join('; ') || '',
      response.ai_tools_used?.join('; ') || '',
      response.ai_usage_purpose?.join('; ') || '',
      response.interested_ai_areas?.join('; ') || '',
      response.ai_positive_rating,
      response.support_needed
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `edu-ai-survey-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EDU-AI Insight 관리자 대시보드</h1>
          <p className="mt-2 text-gray-600">교사 대상 AI 활용 설문조사 결과</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 응답수</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">교과목 수</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.bySubject).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI 평점 평균</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={downloadCSV}
              className="flex items-center w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV 다운로드
            </button>
          </div>
        </div>

        {/* 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 교과목별 통계 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">교과목별 응답 현황</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.bySubject).map(([subject, count]) => ({ subject, count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 지역별 통계 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">지역별 응답 현황</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(stats.byLocation).map(([location, count]) => ({ location, count }))}
                  dataKey="count"
                  nameKey="location"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {Object.entries(stats.byLocation).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI 도구 사용 현황 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI 도구 사용 현황</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={Object.entries(stats.byAITools)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([tool, count]) => ({ tool, count }))}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="tool" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 최근 응답 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">최근 응답 목록</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제출일시</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">교과목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">근무지</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">교직경력</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI 평점</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.slice(0, 10).map((response) => (
                  <tr key={response.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.created_at ? new Date(response.created_at).toLocaleString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.experience_years}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{response.ai_positive_rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 