'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Progress } from '@radix-ui/react-progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { supabase } from '@/utils/supabase'
import type { SurveyResponse } from '@/utils/supabase'

// 폼 스키마 정의
const surveySchema = z.object({
  // 교사 정보
  subject: z.string().min(1, '교과목을 선택해주세요'),
  location: z.string().min(1, '근무지를 입력해주세요'),
  school_name: z.string().min(1, '학교명을 입력해주세요'),
  employment_type: z.string().min(1, '근무형태를 선택해주세요'),
  experience_years: z.string().min(1, '교직경력을 선택해주세요'),
  
  // 교육현장 고민
  main_concern: z.string().min(10, '10자 이상 입력해주세요'),
  problems: z.array(z.string()).min(1, '최소 1개 이상 선택해주세요'),
  
  // AI 도구 사용 현황
  ai_tools_used: z.array(z.string()),
  ai_usage_purpose: z.array(z.string()),
  
  // 관심 AI 분야
  interested_ai_areas: z.array(z.string()).min(1, '최소 1개 이상 선택해주세요'),
  
  // AI 인식
  ai_positive_rating: z.string().min(1, '평점을 선택해주세요'),
  support_needed: z.string().min(10, '10자 이상 입력해주세요'),
})

type SurveyFormData = z.infer<typeof surveySchema>

const STEPS = [
  { id: 1, title: '교사 정보', description: '기본 정보를 입력해주세요' },
  { id: 2, title: '교육현장 고민', description: '현재 겪고 있는 고민을 알려주세요' },
  { id: 3, title: 'AI 활용 현황', description: 'AI 도구 사용 경험을 알려주세요' },
  { id: 4, title: '관심 분야', description: '배우고 싶은 AI 분야를 선택해주세요' },
  { id: 5, title: 'AI 인식', description: 'AI에 대한 생각을 알려주세요' },
]

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      problems: [],
      ai_tools_used: [],
      ai_usage_purpose: [],
      interested_ai_areas: [],
      ai_positive_rating: 3,
    },
  })

  const watchedValues = watch()

  const nextStep = async () => {
    let fieldsToValidate: (keyof SurveyFormData)[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['subject', 'location', 'school_name', 'employment_type', 'experience_years']
        break
      case 2:
        fieldsToValidate = ['main_concern', 'problems']
        break
      case 3:
        fieldsToValidate = ['ai_tools_used', 'ai_usage_purpose']
        break
      case 4:
        fieldsToValidate = ['interested_ai_areas']
        break
      case 5:
        fieldsToValidate = ['ai_positive_rating', 'support_needed']
        break
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true)
    try {
      const { data: result, error } = await supabase
        .from('survey_responses')
        .insert([data])

      if (error) {
        throw error
      }

      setIsCompleted(true)
    } catch (error) {
      console.error('설문 제출 오류:', error)
      alert('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">설문 완료!</h2>
          <p className="text-gray-600 mb-6">
            소중한 의견을 주셔서 감사합니다.<br />
            교육 현장의 AI 활용 개선에 도움이 될 것입니다.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EDU-AI Insight</h1>
          <p className="text-gray-600">교사 대상 AI 활용 설문조사</p>
        </div>

        {/* 진행률 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {currentStep} / {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>

        {/* 현재 스텝 정보 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-gray-600">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {/* 여기에 각 스텝별 컴포넌트가 들어갑니다 */}
            <div className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* 교과목 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      담당 교과목 *
                    </label>
                    <select 
                      {...register('subject')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">선택해주세요</option>
                      <option value="국어">국어</option>
                      <option value="영어">영어</option>
                      <option value="수학">수학</option>
                      <option value="과학">과학</option>
                      <option value="사회">사회</option>
                      <option value="예체능">예체능</option>
                      <option value="기술가정">기술가정</option>
                      <option value="기타">기타</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>

                  {/* 근무지 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      근무지 (시·도) *
                    </label>
                    <select 
                      {...register('location')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">선택해주세요</option>
                      <option value="서울특별시">서울특별시</option>
                      <option value="부산광역시">부산광역시</option>
                      <option value="대구광역시">대구광역시</option>
                      <option value="인천광역시">인천광역시</option>
                      <option value="광주광역시">광주광역시</option>
                      <option value="대전광역시">대전광역시</option>
                      <option value="울산광역시">울산광역시</option>
                      <option value="세종특별자치시">세종특별자치시</option>
                      <option value="경기도">경기도</option>
                      <option value="강원도">강원도</option>
                      <option value="충청북도">충청북도</option>
                      <option value="충청남도">충청남도</option>
                      <option value="전라북도">전라북도</option>
                      <option value="전라남도">전라남도</option>
                      <option value="경상북도">경상북도</option>
                      <option value="경상남도">경상남도</option>
                      <option value="제주특별자치도">제주특별자치도</option>
                    </select>
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>

                  {/* 학교명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학교명 *
                    </label>
                    <input
                      type="text"
                      {...register('school_name')}
                      placeholder="○○중학교, ○○고등학교 등"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {errors.school_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.school_name.message}</p>
                    )}
                  </div>

                  {/* 근무형태 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      근무형태 *
                    </label>
                    <select 
                      {...register('employment_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">선택해주세요</option>
                      <option value="정교사">정교사</option>
                      <option value="기간제교사">기간제교사</option>
                      <option value="시간강사">시간강사</option>
                      <option value="기타">기타</option>
                    </select>
                    {errors.employment_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.employment_type.message}</p>
                    )}
                  </div>

                  {/* 교직경력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      교직경력 *
                    </label>
                    <select 
                      {...register('experience_years')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">선택해주세요</option>
                      <option value="1~3년">1~3년</option>
                      <option value="4~9년">4~9년</option>
                      <option value="10~19년">10~19년</option>
                      <option value="20년 이상">20년 이상</option>
                    </select>
                    {errors.experience_years && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience_years.message}</p>
                    )}
                  </div>
                </div>
              )}
                              {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* 주요 고민 (주관식) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        현재 수업이나 업무 중 가장 큰 고민은 무엇인가요? *
                      </label>
                      <textarea
                        {...register('main_concern')}
                        rows={4}
                        placeholder="구체적으로 설명해주세요 (최소 10자 이상)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                      {errors.main_concern && (
                        <p className="mt-1 text-sm text-red-600">{errors.main_concern.message}</p>
                      )}
                    </div>

                    {/* 문제점 선택 (중복 선택) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        다음 중 가장 크게 느끼는 문제를 모두 선택해주세요 * (중복 선택 가능)
                      </label>
                      <div className="space-y-3">
                        {[
                          '수업자료 제작 시간 부족',
                          '학생들의 집중력 저하',  
                          '수행평가/서술형 채점의 어려움',
                          '교육격차 확대',
                          'AI 활용에 대한 정보 부족',
                          '행정업무 과다'
                        ].map((problem) => (
                          <label key={problem} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              value={problem}
                              {...register('problems')}
                              className="mt-1 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 leading-5">{problem}</span>
                          </label>
                        ))}
                      </div>
                      {errors.problems && (
                        <p className="mt-2 text-sm text-red-600">{errors.problems.message}</p>
                      )}
                    </div>
                  </div>
                )}
                              {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* 사용한 AI 도구 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        사용한 적 있는 AI 도구를 모두 선택해주세요 (중복 선택 가능)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          'ChatGPT',
                          'Notion AI', 
                          'Grammarly',
                          '뤼튼(Wrtn)',
                          '큐레이션봇',
                          '클래스카드 AI',
                          'Google Bard',
                          'Claude',
                          '없음'
                        ].map((tool) => (
                          <label key={tool} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              value={tool}
                              {...register('ai_tools_used')}
                              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700">{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* AI 사용 목적 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        AI를 주로 어떤 목적에 사용하고 있나요? (중복 선택 가능)
                      </label>
                      <div className="space-y-3">
                        {[
                          '수업자료 제작',
                          '시험문제 생성',
                          '학생 피드백 작성',
                          '행정문서/공문 작성',
                          '교사 연수/학습',
                          '아이디어 브레인스토밍',
                          '번역/문법 검사',
                          '사용하지 않음'
                        ].map((purpose) => (
                          <label key={purpose} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              value={purpose}
                              {...register('ai_usage_purpose')}
                              className="mt-1 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 leading-5">{purpose}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                              {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* 관심 AI 분야 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        관심 있는 AI 분야를 모두 골라주세요 * (중복 선택 가능)
                      </label>
                      <div className="space-y-3">
                        {[
                          'AI로 시험지/평가문항 자동 생성',
                          'AI로 맞춤형 수업자료 설계',
                          '학생 학습 데이터 분석',
                          'AI 이미지/영상/프레젠테이션 제작',
                          'AI 채팅봇 제작',
                          'AI를 활용한 학습 피드백',
                          'AI 음성인식 및 발음 교정',
                          'AI 번역 및 언어학습',
                          'AI 코딩 및 프로그래밍',
                          'AI 윤리 및 디지털 시민의식'
                        ].map((area) => (
                          <label key={area} className="flex items-start space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              value={area}
                              {...register('interested_ai_areas')}
                              className="mt-1 w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 leading-5">{area}</span>
                          </label>
                        ))}
                      </div>
                      {errors.interested_ai_areas && (
                        <p className="mt-2 text-sm text-red-600">{errors.interested_ai_areas.message}</p>
                      )}
                    </div>
                  </div>
                )}
                              {currentStep === 5 && (
                  <div className="space-y-6">
                    {/* AI 긍정적 영향 평가 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        AI가 교육현장에 긍정적 영향을 미친다고 생각하시나요? *
                      </label>
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <span className="text-sm text-gray-600">전혀 그렇지 않다</span>
                        <div className="flex space-x-4">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="flex flex-col items-center cursor-pointer">
                              <input
                                type="radio"
                                value={rating.toString()}
                                {...register('ai_positive_rating', { 
                                  setValueAs: (value) => parseInt(value, 10)
                                })}
                                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                              />
                              <span className="mt-1 text-xs text-gray-600">{rating}</span>
                            </label>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">매우 그렇다</span>
                      </div>
                      {errors.ai_positive_rating && (
                        <p className="mt-1 text-sm text-red-600">{errors.ai_positive_rating.message}</p>
                      )}
                    </div>

                    {/* 필요한 지원 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI 기술을 효과적으로 활용하기 위해 어떤 지원이 필요하다고 생각하시나요? *
                      </label>
                      <textarea
                        {...register('support_needed')}
                        rows={5}
                        placeholder="구체적인 의견을 자유롭게 작성해주세요 (최소 10자 이상)
                        
예시:
- 체계적인 AI 연수 프로그램
- 실무에 바로 적용 가능한 가이드라인
- AI 도구 사용법 실습 기회
- 동료 교사들과의 경험 공유
- 학교 차원의 AI 도구 지원
- 등등..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                      {errors.support_needed && (
                        <p className="mt-1 text-sm text-red-600">{errors.support_needed.message}</p>
                      )}
                    </div>

                    {/* 마지막 안내 */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <p className="text-sm text-indigo-800">
                        <strong>🎉 마지막 단계입니다!</strong><br />
                        모든 항목을 작성하신 후 "제출하기" 버튼을 눌러주세요.
                        소중한 의견이 교육 현장의 AI 활용 개선에 큰 도움이 될 것입니다.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              이전
            </button>

            {currentStep === 5 ? (
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  console.log('제출 버튼 클릭됨!')
                  console.log('현재 폼 에러:', errors)
                  console.log('현재 폼 값:', watchedValues)
                }}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? '제출 중...' : '제출하기'}
                <Check className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                다음
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 