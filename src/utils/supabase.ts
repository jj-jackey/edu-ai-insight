import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 프로덕션에서는 로그 제거됨

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 설문 응답 타입 정의
export interface SurveyResponse {
  id?: string
  created_at?: string
  
  // 교사 정보
  subject: string
  location: string
  school_name: string
  employment_type: string
  experience_years: string
  
  // 교육현장 고민
  main_concern: string
  problems: string[]
  
  // AI 도구 사용 현황
  ai_tools_used: string[]
  ai_usage_purpose: string[]
  
  // 관심 AI 분야
  interested_ai_areas: string[]
  
  // AI 인식
  ai_positive_rating: number
  support_needed: string
} 