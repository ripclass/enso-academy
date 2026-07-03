export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_grader_evaluations: {
        Row: {
          ai_feedback: string | null
          ai_markdown_breakdown: Json | null
          ai_score: number
          cost_cents: number | null
          course_id: string
          created_at: string
          grader_model: string
          id: string
          max_score: number
          metadata: Json
          mock_attempt_id: string | null
          needs_review: boolean
          question_id: string | null
          rubric_id: string | null
          student_answer_text: string
          student_id: string
          tokens_used: number | null
        }
        Insert: {
          ai_feedback?: string | null
          ai_markdown_breakdown?: Json | null
          ai_score: number
          cost_cents?: number | null
          course_id: string
          created_at?: string
          grader_model: string
          id?: string
          max_score: number
          metadata?: Json
          mock_attempt_id?: string | null
          needs_review?: boolean
          question_id?: string | null
          rubric_id?: string | null
          student_answer_text: string
          student_id: string
          tokens_used?: number | null
        }
        Update: {
          ai_feedback?: string | null
          ai_markdown_breakdown?: Json | null
          ai_score?: number
          cost_cents?: number | null
          course_id?: string
          created_at?: string
          grader_model?: string
          id?: string
          max_score?: number
          metadata?: Json
          mock_attempt_id?: string | null
          needs_review?: boolean
          question_id?: string | null
          rubric_id?: string | null
          student_answer_text?: string
          student_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_grader_evaluations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_grader_evaluations_mock_attempt_id_fkey"
            columns: ["mock_attempt_id"]
            isOneToOne: false
            referencedRelation: "mock_exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_grader_evaluations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_grader_evaluations_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "grading_rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          id: string
          ip_address: string | null
          occurred_at: string
          payload: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          id?: string
          ip_address?: string | null
          occurred_at?: string
          payload?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          id?: string
          ip_address?: string | null
          occurred_at?: string
          payload?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      cached_qa: {
        Row: {
          answer_text: string
          answered_by_model: string | null
          concept_tags: string[]
          confidence: number | null
          course_id: string
          created_at: string
          embedding: string
          hit_count: number
          id: string
          last_hit_at: string | null
          lesson_id: string | null
          metadata: Json
          origin: Database["public"]["Enums"]["qa_origin"]
          primary_source_ids: string[] | null
          quality_score: number | null
          question_text: string
          updated_at: string
        }
        Insert: {
          answer_text: string
          answered_by_model?: string | null
          concept_tags?: string[]
          confidence?: number | null
          course_id: string
          created_at?: string
          embedding: string
          hit_count?: number
          id?: string
          last_hit_at?: string | null
          lesson_id?: string | null
          metadata?: Json
          origin: Database["public"]["Enums"]["qa_origin"]
          primary_source_ids?: string[] | null
          quality_score?: number | null
          question_text: string
          updated_at?: string
        }
        Update: {
          answer_text?: string
          answered_by_model?: string | null
          concept_tags?: string[]
          confidence?: number | null
          course_id?: string
          created_at?: string
          embedding?: string
          hit_count?: number
          id?: string
          last_hit_at?: string | null
          lesson_id?: string | null
          metadata?: Json
          origin?: Database["public"]["Enums"]["qa_origin"]
          primary_source_ids?: string[] | null
          quality_score?: number | null
          question_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cached_qa_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cached_qa_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          concept_tags: string[]
          course_id: string
          created_at: string
          discussion_questions: Json | null
          embedding: string | null
          full_text: string
          id: string
          institution_involved: string | null
          jurisdiction: string | null
          metadata: Json
          penalty_amount_usd: number | null
          primary_source_id: string | null
          summary: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          concept_tags?: string[]
          course_id: string
          created_at?: string
          discussion_questions?: Json | null
          embedding?: string | null
          full_text: string
          id?: string
          institution_involved?: string | null
          jurisdiction?: string | null
          metadata?: Json
          penalty_amount_usd?: number | null
          primary_source_id?: string | null
          summary: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          concept_tags?: string[]
          course_id?: string
          created_at?: string
          discussion_questions?: Json | null
          embedding?: string | null
          full_text?: string
          id?: string
          institution_involved?: string | null
          jurisdiction?: string | null
          metadata?: Json
          penalty_amount_usd?: number | null
          primary_source_id?: string | null
          summary?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_primary_source_id_fkey"
            columns: ["primary_source_id"]
            isOneToOne: false
            referencedRelation: "primary_source_citations"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_scenarios: {
        Row: {
          concept_tags: string[]
          course_id: string
          created_at: string
          id: string
          mechanic: string
          sort_order: number
          spec: Json
          title: string
          updated_at: string
        }
        Insert: {
          concept_tags?: string[]
          course_id: string
          created_at?: string
          id: string
          mechanic: string
          sort_order?: number
          spec: Json
          title: string
          updated_at?: string
        }
        Update: {
          concept_tags?: string[]
          course_id?: string
          created_at?: string
          id?: string
          mechanic?: string
          sort_order?: number
          spec?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_scenarios_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      classmate_interventions: {
        Row: {
          cached_qa_id: string | null
          classmate_id: string | null
          course_id: string
          gap_evidence: Json
          id: string
          lecturer_response: string | null
          lesson_id: string | null
          metadata: Json
          occurred_at: string
          question_asked: string
          session_id: string | null
          student_id: string
          suppressed: boolean
          suppression_reason: string | null
          triggering_concept: string
        }
        Insert: {
          cached_qa_id?: string | null
          classmate_id?: string | null
          course_id: string
          gap_evidence: Json
          id?: string
          lecturer_response?: string | null
          lesson_id?: string | null
          metadata?: Json
          occurred_at?: string
          question_asked: string
          session_id?: string | null
          student_id: string
          suppressed?: boolean
          suppression_reason?: string | null
          triggering_concept: string
        }
        Update: {
          cached_qa_id?: string | null
          classmate_id?: string | null
          course_id?: string
          gap_evidence?: Json
          id?: string
          lecturer_response?: string | null
          lesson_id?: string | null
          metadata?: Json
          occurred_at?: string
          question_asked?: string
          session_id?: string | null
          student_id?: string
          suppressed?: boolean
          suppression_reason?: string | null
          triggering_concept?: string
        }
        Relationships: [
          {
            foreignKeyName: "classmate_interventions_cached_qa_id_fkey"
            columns: ["cached_qa_id"]
            isOneToOne: false
            referencedRelation: "cached_qa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classmate_interventions_classmate_id_fkey"
            columns: ["classmate_id"]
            isOneToOne: false
            referencedRelation: "classmates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classmate_interventions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classmate_interventions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classmate_interventions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      classmates: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_active: boolean
          metadata: Json
          name: string
          persona_description: string | null
          updated_at: string
          voice_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          persona_description?: string | null
          updated_at?: string
          voice_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          persona_description?: string | null
          updated_at?: string
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classmates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library_elements: {
        Row: {
          audio_duration_seconds: number | null
          audio_generated_at: string | null
          audio_url: string | null
          body: string
          body_format: string
          concept_tags: string[]
          course_id: string
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          element_type: Database["public"]["Enums"]["content_element_type"]
          embedding: string | null
          estimated_seconds: number | null
          id: string
          lesson_id: string | null
          metadata: Json
          module_id: string | null
          prerequisite_concepts: string[]
          scene_data: Json
          scene_type: Database["public"]["Enums"]["scene_type"]
          teaches_concepts: string[]
          title: string | null
          updated_at: string
        }
        Insert: {
          audio_duration_seconds?: number | null
          audio_generated_at?: string | null
          audio_url?: string | null
          body: string
          body_format?: string
          concept_tags?: string[]
          course_id: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          element_type: Database["public"]["Enums"]["content_element_type"]
          embedding?: string | null
          estimated_seconds?: number | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          module_id?: string | null
          prerequisite_concepts?: string[]
          scene_data?: Json
          scene_type?: Database["public"]["Enums"]["scene_type"]
          teaches_concepts?: string[]
          title?: string | null
          updated_at?: string
        }
        Update: {
          audio_duration_seconds?: number | null
          audio_generated_at?: string | null
          audio_url?: string | null
          body?: string
          body_format?: string
          concept_tags?: string[]
          course_id?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          element_type?: Database["public"]["Enums"]["content_element_type"]
          embedding?: string | null
          estimated_seconds?: number | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          module_id?: string | null
          prerequisite_concepts?: string[]
          scene_data?: Json
          scene_type?: Database["public"]["Enums"]["scene_type"]
          teaches_concepts?: string[]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_library_elements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_elements_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_library_elements_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          element_id: string | null
          id: string
          issues_found: Json | null
          question_id: string | null
          review_minutes: number | null
          review_notes: string | null
          reviewer_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["review_status"]
          suggested_changes: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          element_id?: string | null
          id?: string
          issues_found?: Json | null
          question_id?: string | null
          review_minutes?: number | null
          review_notes?: string | null
          reviewer_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          suggested_changes?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          element_id?: string | null
          id?: string
          issues_found?: Json | null
          question_id?: string | null
          review_minutes?: number | null
          review_notes?: string | null
          reviewer_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          suggested_changes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_element_id_fkey"
            columns: ["element_id"]
            isOneToOne: false
            referencedRelation: "content_library_elements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "sme_reviewers"
            referencedColumns: ["id"]
          },
        ]
      }
      course_purchases: {
        Row: {
          amount_cents: number
          course_id: string
          created_at: string
          currency: string
          discount_amount_cents: number | null
          discount_code: string | null
          enrollment_id: string | null
          id: string
          metadata: Json
          purchased_at: string
          refund_reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          course_id: string
          created_at?: string
          currency?: string
          discount_amount_cents?: number | null
          discount_code?: string | null
          enrollment_id?: string | null
          id?: string
          metadata?: Json
          purchased_at?: string
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          course_id?: string
          created_at?: string
          currency?: string
          discount_amount_cents?: number | null
          discount_code?: string | null
          enrollment_id?: string | null
          id?: string
          metadata?: Json
          purchased_at?: string
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_purchases_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_versions: {
        Row: {
          course_id: string
          created_at: string
          generated_by: string | null
          generation_batch_id: string | null
          generation_prompt_version: string | null
          id: string
          notes: string | null
          version_number: number
        }
        Insert: {
          course_id: string
          created_at?: string
          generated_by?: string | null
          generation_batch_id?: string | null
          generation_prompt_version?: string | null
          id?: string
          notes?: string | null
          version_number: number
        }
        Update: {
          course_id?: string
          created_at?: string
          generated_by?: string | null
          generation_batch_id?: string | null
          generation_prompt_version?: string | null
          id?: string
          notes?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_versions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certifying_body: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          estimated_study_hours: number | null
          id: string
          metadata: Json
          name: string
          price_bdt: number | null
          price_usd_cents: number | null
          primary_source_count: number | null
          published_at: string | null
          real_exam_format: Json
          short_name: string
          signoff_threshold: Json
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          tier: Database["public"]["Enums"]["course_tier"]
          updated_at: string
        }
        Insert: {
          certifying_body?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_study_hours?: number | null
          id?: string
          metadata?: Json
          name: string
          price_bdt?: number | null
          price_usd_cents?: number | null
          primary_source_count?: number | null
          published_at?: string | null
          real_exam_format?: Json
          short_name: string
          signoff_threshold?: Json
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          tier: Database["public"]["Enums"]["course_tier"]
          updated_at?: string
        }
        Update: {
          certifying_body?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          estimated_study_hours?: number | null
          id?: string
          metadata?: Json
          name?: string
          price_bdt?: number | null
          price_usd_cents?: number | null
          primary_source_count?: number | null
          published_at?: string | null
          real_exam_format?: Json
          short_name?: string
          signoff_threshold?: Json
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          tier?: Database["public"]["Enums"]["course_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      daily_case_results: {
        Row: {
          correct: number
          course_id: string
          created_at: string
          day: string
          display_name: string | null
          id: string
          score: number
          student_id: string
          total: number
        }
        Insert: {
          correct?: number
          course_id: string
          created_at?: string
          day: string
          display_name?: string | null
          id?: string
          score: number
          student_id: string
          total?: number
        }
        Update: {
          correct?: number
          course_id?: string
          created_at?: string
          day?: string
          display_name?: string | null
          id?: string
          score?: number
          student_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_case_results_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          enrolled_at: string
          expires_at: string | null
          id: string
          last_activity_at: string | null
          metadata: Json
          progress_percent: number | null
          purchase_id: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json
          progress_percent?: number | null
          purchase_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json
          progress_percent?: number | null
          purchase_id?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          cached_qa_id: string | null
          cost_cents: number | null
          course_id: string
          created_at: string
          escalated_from_model: string | null
          final_answer: string | null
          id: string
          latency_ms: number | null
          lesson_id: string | null
          metadata: Json
          question_text: string
          reason: Database["public"]["Enums"]["escalation_reason"]
          resolved_at: string | null
          resolved_by_model: string | null
          session_id: string | null
          student_id: string
          tokens_used: number | null
        }
        Insert: {
          cached_qa_id?: string | null
          cost_cents?: number | null
          course_id: string
          created_at?: string
          escalated_from_model?: string | null
          final_answer?: string | null
          id?: string
          latency_ms?: number | null
          lesson_id?: string | null
          metadata?: Json
          question_text: string
          reason: Database["public"]["Enums"]["escalation_reason"]
          resolved_at?: string | null
          resolved_by_model?: string | null
          session_id?: string | null
          student_id: string
          tokens_used?: number | null
        }
        Update: {
          cached_qa_id?: string | null
          cost_cents?: number | null
          course_id?: string
          created_at?: string
          escalated_from_model?: string | null
          final_answer?: string | null
          id?: string
          latency_ms?: number | null
          lesson_id?: string | null
          metadata?: Json
          question_text?: string
          reason?: Database["public"]["Enums"]["escalation_reason"]
          resolved_at?: string | null
          resolved_by_model?: string | null
          session_id?: string | null
          student_id?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "escalations_cached_qa_id_fkey"
            columns: ["cached_qa_id"]
            isOneToOne: false
            referencedRelation: "cached_qa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      examiner_graded_papers: {
        Row: {
          acquisition_date: string | null
          acquisition_source: string | null
          course_id: string | null
          created_at: string
          exam_name: string
          exam_session: string | null
          exam_year: number | null
          examiner_comments: string | null
          examiner_id: string | null
          examiner_marks_breakdown: Json | null
          examiner_score: number
          id: string
          is_used_for_training: boolean
          max_score: number
          metadata: Json
          question_text: string
          student_answer_image_url: string | null
          student_answer_text: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          acquisition_date?: string | null
          acquisition_source?: string | null
          course_id?: string | null
          created_at?: string
          exam_name: string
          exam_session?: string | null
          exam_year?: number | null
          examiner_comments?: string | null
          examiner_id?: string | null
          examiner_marks_breakdown?: Json | null
          examiner_score: number
          id?: string
          is_used_for_training?: boolean
          max_score: number
          metadata?: Json
          question_text: string
          student_answer_image_url?: string | null
          student_answer_text: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_date?: string | null
          acquisition_source?: string | null
          course_id?: string | null
          created_at?: string
          exam_name?: string
          exam_session?: string | null
          exam_year?: number | null
          examiner_comments?: string | null
          examiner_id?: string | null
          examiner_marks_breakdown?: Json | null
          examiner_score?: number
          id?: string
          is_used_for_training?: boolean
          max_score?: number
          metadata?: Json
          question_text?: string
          student_answer_image_url?: string | null
          student_answer_text?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examiner_graded_papers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_graded_papers_examiner_id_fkey"
            columns: ["examiner_id"]
            isOneToOne: false
            referencedRelation: "examiners"
            referencedColumns: ["id"]
          },
        ]
      }
      examiner_review_passes: {
        Row: {
          ai_evaluation_id: string
          comments: string | null
          examiner_id: string
          examiner_score: number | null
          id: string
          metadata: Json
          reviewed_at: string
          suggested_rubric_changes: string | null
          verdict: Database["public"]["Enums"]["grader_review_verdict"]
        }
        Insert: {
          ai_evaluation_id: string
          comments?: string | null
          examiner_id: string
          examiner_score?: number | null
          id?: string
          metadata?: Json
          reviewed_at?: string
          suggested_rubric_changes?: string | null
          verdict: Database["public"]["Enums"]["grader_review_verdict"]
        }
        Update: {
          ai_evaluation_id?: string
          comments?: string | null
          examiner_id?: string
          examiner_score?: number | null
          id?: string
          metadata?: Json
          reviewed_at?: string
          suggested_rubric_changes?: string | null
          verdict?: Database["public"]["Enums"]["grader_review_verdict"]
        }
        Relationships: [
          {
            foreignKeyName: "examiner_review_passes_ai_evaluation_id_fkey"
            columns: ["ai_evaluation_id"]
            isOneToOne: false
            referencedRelation: "ai_grader_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_review_passes_examiner_id_fkey"
            columns: ["examiner_id"]
            isOneToOne: false
            referencedRelation: "examiners"
            referencedColumns: ["id"]
          },
        ]
      }
      examiners: {
        Row: {
          consent_signed: boolean
          consent_signed_at: string | null
          created_at: string
          email: string | null
          expertise_areas: string[] | null
          fee_per_paper_bdt: number | null
          fee_per_review_hour_bdt: number | null
          full_name: string
          id: string
          institution: string | null
          is_named_on_marketing: boolean
          metadata: Json
          notes: string | null
          phone: string | null
          role: string | null
          status: Database["public"]["Enums"]["examiner_status"]
          updated_at: string
        }
        Insert: {
          consent_signed?: boolean
          consent_signed_at?: string | null
          created_at?: string
          email?: string | null
          expertise_areas?: string[] | null
          fee_per_paper_bdt?: number | null
          fee_per_review_hour_bdt?: number | null
          full_name: string
          id?: string
          institution?: string | null
          is_named_on_marketing?: boolean
          metadata?: Json
          notes?: string | null
          phone?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["examiner_status"]
          updated_at?: string
        }
        Update: {
          consent_signed?: boolean
          consent_signed_at?: string | null
          created_at?: string
          email?: string | null
          expertise_areas?: string[] | null
          fee_per_paper_bdt?: number | null
          fee_per_review_hour_bdt?: number | null
          full_name?: string
          id?: string
          institution?: string | null
          is_named_on_marketing?: boolean
          metadata?: Json
          notes?: string | null
          phone?: string | null
          role?: string | null
          status?: Database["public"]["Enums"]["examiner_status"]
          updated_at?: string
        }
        Relationships: []
      }
      flashcard_reviews: {
        Row: {
          box: number
          course_id: string
          created_at: string
          due_at: string
          glossary_id: string
          id: string
          lapses: number
          last_reviewed_at: string | null
          reps: number
          student_id: string
          updated_at: string
        }
        Insert: {
          box?: number
          course_id: string
          created_at?: string
          due_at?: string
          glossary_id: string
          id?: string
          lapses?: number
          last_reviewed_at?: string | null
          reps?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          box?: number
          course_id?: string
          created_at?: string
          due_at?: string
          glossary_id?: string
          id?: string
          lapses?: number
          last_reviewed_at?: string | null
          reps?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_reviews_glossary_id_fkey"
            columns: ["glossary_id"]
            isOneToOne: false
            referencedRelation: "glossary"
            referencedColumns: ["id"]
          },
        ]
      }
      glossary: {
        Row: {
          aliases: string[] | null
          course_id: string
          created_at: string
          definition: string
          embedding: string | null
          id: string
          metadata: Json
          primary_source_id: string | null
          related_terms: string[] | null
          short_definition: string | null
          term: string
          updated_at: string
        }
        Insert: {
          aliases?: string[] | null
          course_id: string
          created_at?: string
          definition: string
          embedding?: string | null
          id?: string
          metadata?: Json
          primary_source_id?: string | null
          related_terms?: string[] | null
          short_definition?: string | null
          term: string
          updated_at?: string
        }
        Update: {
          aliases?: string[] | null
          course_id?: string
          created_at?: string
          definition?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          primary_source_id?: string | null
          related_terms?: string[] | null
          short_definition?: string | null
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "glossary_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glossary_primary_source_id_fkey"
            columns: ["primary_source_id"]
            isOneToOne: false
            referencedRelation: "primary_source_citations"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_rubrics: {
        Row: {
          conservative_bias_factor: number
          course_id: string
          created_at: string
          derived_from_examiner_ids: string[] | null
          derived_from_paper_ids: string[] | null
          id: string
          is_active: boolean
          metadata: Json
          question_pattern: string | null
          rubric_text: string
          structured_criteria: Json
          subject: string | null
          updated_at: string
          version: number
        }
        Insert: {
          conservative_bias_factor?: number
          course_id: string
          created_at?: string
          derived_from_examiner_ids?: string[] | null
          derived_from_paper_ids?: string[] | null
          id?: string
          is_active?: boolean
          metadata?: Json
          question_pattern?: string | null
          rubric_text: string
          structured_criteria?: Json
          subject?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          conservative_bias_factor?: number
          course_id?: string
          created_at?: string
          derived_from_examiner_ids?: string[] | null
          derived_from_paper_ids?: string[] | null
          id?: string
          is_active?: boolean
          metadata?: Json
          question_pattern?: string | null
          rubric_text?: string
          structured_criteria?: Json
          subject?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "grading_rubrics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_review_events: {
        Row: {
          artifact_hash: string
          course_slug: string
          created_at: string
          decision: string
          event_id: string
          from_status: string | null
          lesson_slug: string
          methodology_version: string
          notes: string
          outline_hash: string
          reviewer: string
          reviewer_role: string
          to_status: string
        }
        Insert: {
          artifact_hash: string
          course_slug: string
          created_at?: string
          decision: string
          event_id: string
          from_status?: string | null
          lesson_slug: string
          methodology_version: string
          notes?: string
          outline_hash: string
          reviewer: string
          reviewer_role: string
          to_status: string
        }
        Update: {
          artifact_hash?: string
          course_slug?: string
          created_at?: string
          decision?: string
          event_id?: string
          from_status?: string | null
          lesson_slug?: string
          methodology_version?: string
          notes?: string
          outline_hash?: string
          reviewer?: string
          reviewer_role?: string
          to_status?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          concept_tags: string[]
          created_at: string
          description: string | null
          estimated_minutes: number | null
          id: string
          learning_objectives: Json
          metadata: Json
          module_id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          concept_tags?: string[]
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_objectives?: Json
          metadata?: Json
          module_id: string
          name: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          concept_tags?: string[]
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_objectives?: Json
          metadata?: Json
          module_id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_entitlements: {
        Row: {
          course_id: string
          created_at: string
          id: string
          included_total: number
          metadata: Json
          purchased_total: number
          student_id: string
          updated_at: string
          used: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          included_total?: number
          metadata?: Json
          purchased_total?: number
          student_id: string
          updated_at?: string
          used?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          included_total?: number
          metadata?: Json
          purchased_total?: number
          student_id?: string
          updated_at?: string
          used?: number
        }
        Relationships: [
          {
            foreignKeyName: "mock_entitlements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exam_attempts: {
        Row: {
          answers: Json
          by_domain_scores: Json | null
          correct_count: number | null
          course_id: string
          created_at: string
          duration_seconds: number | null
          flags: Json | null
          focus_blur_events: number | null
          id: string
          incorrect_count: number | null
          invalidation_reason: string | null
          metadata: Json
          navigation_events: Json | null
          questions_snapshot: Json
          score_percent: number | null
          skipped_count: number | null
          started_at: string
          status: Database["public"]["Enums"]["mock_attempt_status"]
          student_id: string
          submitted_at: string | null
          template_id: string | null
          total_questions: number
          updated_at: string
        }
        Insert: {
          answers?: Json
          by_domain_scores?: Json | null
          correct_count?: number | null
          course_id: string
          created_at?: string
          duration_seconds?: number | null
          flags?: Json | null
          focus_blur_events?: number | null
          id?: string
          incorrect_count?: number | null
          invalidation_reason?: string | null
          metadata?: Json
          navigation_events?: Json | null
          questions_snapshot: Json
          score_percent?: number | null
          skipped_count?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["mock_attempt_status"]
          student_id: string
          submitted_at?: string | null
          template_id?: string | null
          total_questions: number
          updated_at?: string
        }
        Update: {
          answers?: Json
          by_domain_scores?: Json | null
          correct_count?: number | null
          course_id?: string
          created_at?: string
          duration_seconds?: number | null
          flags?: Json | null
          focus_blur_events?: number | null
          id?: string
          incorrect_count?: number | null
          invalidation_reason?: string | null
          metadata?: Json
          navigation_events?: Json | null
          questions_snapshot?: Json
          score_percent?: number | null
          skipped_count?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["mock_attempt_status"]
          student_id?: string
          submitted_at?: string | null
          template_id?: string | null
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_exam_attempts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mock_exam_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_exam_templates: {
        Row: {
          course_id: string
          created_at: string
          id: string
          is_published: boolean
          metadata: Json
          name: string
          pass_score_percent: number | null
          question_count: number
          selection_criteria: Json
          sort_order: number
          time_limit_minutes: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          is_published?: boolean
          metadata?: Json
          name: string
          pass_score_percent?: number | null
          question_count: number
          selection_criteria?: Json
          sort_order: number
          time_limit_minutes: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          is_published?: boolean
          metadata?: Json
          name?: string
          pass_score_percent?: number | null
          question_count?: number
          selection_criteria?: Json
          sort_order?: number
          time_limit_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_exam_templates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_purchases: {
        Row: {
          amount_cents: number
          course_id: string
          created_at: string
          credits_granted: number
          currency: string
          id: string
          metadata: Json
          purchased_at: string
          status: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          course_id: string
          created_at?: string
          credits_granted?: number
          currency?: string
          id?: string
          metadata?: Json
          purchased_at?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          course_id?: string
          created_at?: string
          credits_granted?: number
          currency?: string
          id?: string
          metadata?: Json
          purchased_at?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      modality_state: {
        Row: {
          context: Json | null
          course_id: string
          created_at: string
          current_modality: Database["public"]["Enums"]["modality"]
          id: string
          last_switched_at: string
          student_id: string
          updated_at: string
        }
        Insert: {
          context?: Json | null
          course_id: string
          created_at?: string
          current_modality?: Database["public"]["Enums"]["modality"]
          id?: string
          last_switched_at?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          context?: Json | null
          course_id?: string
          created_at?: string
          current_modality?: Database["public"]["Enums"]["modality"]
          id?: string
          last_switched_at?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modality_state_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          estimated_minutes: number | null
          id: string
          learning_objectives: Json
          metadata: Json
          name: string
          prerequisite_module_ids: string[] | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_objectives?: Json
          metadata?: Json
          name: string
          prerequisite_module_ids?: string[] | null
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          learning_objectives?: Json
          metadata?: Json
          name?: string
          prerequisite_module_ids?: string[] | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_extractions: {
        Row: {
          confidence: number | null
          created_at: string
          extracted_text: string
          extraction_engine: string | null
          id: string
          matched_question_id: string | null
          metadata: Json
          needs_human_review: boolean
          page_number: number | null
          real_exam_paper_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          extracted_text: string
          extraction_engine?: string | null
          id?: string
          matched_question_id?: string | null
          metadata?: Json
          needs_human_review?: boolean
          page_number?: number | null
          real_exam_paper_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          extracted_text?: string
          extraction_engine?: string | null
          id?: string
          matched_question_id?: string | null
          metadata?: Json
          needs_human_review?: boolean
          page_number?: number | null
          real_exam_paper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_extractions_matched_question_id_fkey"
            columns: ["matched_question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_extractions_real_exam_paper_id_fkey"
            columns: ["real_exam_paper_id"]
            isOneToOne: false
            referencedRelation: "real_exam_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_artifacts: {
        Row: {
          artifact_type: string
          content: string
          course_id: string
          created_at: string
          id: string
          is_shareable: boolean
          metadata: Json
          prompt_used: string | null
          quality_score: number | null
          share_url: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_type: string
          content: string
          course_id: string
          created_at?: string
          id?: string
          is_shareable?: boolean
          metadata?: Json
          prompt_used?: string | null
          quality_score?: number | null
          share_url?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_type?: string
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          is_shareable?: boolean
          metadata?: Json
          prompt_used?: string | null
          quality_score?: number | null
          share_url?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_artifacts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      primary_source_citations: {
        Row: {
          citation_text: string | null
          course_id: string | null
          created_at: string
          element_id: string | null
          id: string
          is_primary: boolean
          metadata: Json
          page_or_section: string | null
          source_name: string
          source_organization: string | null
          source_url: string | null
          source_year: number | null
        }
        Insert: {
          citation_text?: string | null
          course_id?: string | null
          created_at?: string
          element_id?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          page_or_section?: string | null
          source_name: string
          source_organization?: string | null
          source_url?: string | null
          source_year?: number | null
        }
        Update: {
          citation_text?: string | null
          course_id?: string | null
          created_at?: string
          element_id?: string | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          page_or_section?: string | null
          source_name?: string
          source_organization?: string | null
          source_url?: string | null
          source_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "primary_source_citations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "primary_source_citations_element_id_fkey"
            columns: ["element_id"]
            isOneToOne: false
            referencedRelation: "content_library_elements"
            referencedColumns: ["id"]
          },
        ]
      }
      question_bank: {
        Row: {
          concept_tags: string[]
          correct_answer: Json
          correct_response_rate: number | null
          course_id: string
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain: string | null
          eligible_for_mock: boolean
          eligible_for_quiz: boolean
          estimated_seconds: number | null
          explanation: string | null
          id: string
          lesson_id: string | null
          metadata: Json
          module_id: string | null
          options: Json | null
          primary_source_id: string | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          times_used_count: number
          updated_at: string
          wrong_answer_rationales: Json | null
        }
        Insert: {
          concept_tags?: string[]
          correct_answer: Json
          correct_response_rate?: number | null
          course_id: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain?: string | null
          eligible_for_mock?: boolean
          eligible_for_quiz?: boolean
          estimated_seconds?: number | null
          explanation?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          module_id?: string | null
          options?: Json | null
          primary_source_id?: string | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          times_used_count?: number
          updated_at?: string
          wrong_answer_rationales?: Json | null
        }
        Update: {
          concept_tags?: string[]
          correct_answer?: Json
          correct_response_rate?: number | null
          course_id?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain?: string | null
          eligible_for_mock?: boolean
          eligible_for_quiz?: boolean
          estimated_seconds?: number | null
          explanation?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          module_id?: string | null
          options?: Json | null
          primary_source_id?: string | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          times_used_count?: number
          updated_at?: string
          wrong_answer_rationales?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_primary_source_id_fkey"
            columns: ["primary_source_id"]
            isOneToOne: false
            referencedRelation: "primary_source_citations"
            referencedColumns: ["id"]
          },
        ]
      }
      real_exam_outcomes: {
        Row: {
          course_id: string
          created_at: string
          days_between_signoff_and_exam: number | null
          exam_date: string | null
          id: string
          metadata: Json
          reported_score: number | null
          result: Database["public"]["Enums"]["real_exam_result"]
          signoff_event_id: string | null
          student_id: string
          student_notes: string | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          days_between_signoff_and_exam?: number | null
          exam_date?: string | null
          id?: string
          metadata?: Json
          reported_score?: number | null
          result: Database["public"]["Enums"]["real_exam_result"]
          signoff_event_id?: string | null
          student_id: string
          student_notes?: string | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          days_between_signoff_and_exam?: number | null
          exam_date?: string | null
          id?: string
          metadata?: Json
          reported_score?: number | null
          result?: Database["public"]["Enums"]["real_exam_result"]
          signoff_event_id?: string | null
          student_id?: string
          student_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_exam_outcomes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_exam_outcomes_signoff_event_id_fkey"
            columns: ["signoff_event_id"]
            isOneToOne: false
            referencedRelation: "signoff_events"
            referencedColumns: ["id"]
          },
        ]
      }
      real_exam_papers: {
        Row: {
          course_id: string | null
          exam_name: string
          exam_session: string | null
          exam_year: number
          id: string
          image_urls: string[]
          metadata: Json
          ocr_status: string
          student_id: string | null
          subject: string | null
          uploaded_at: string
        }
        Insert: {
          course_id?: string | null
          exam_name: string
          exam_session?: string | null
          exam_year: number
          id?: string
          image_urls?: string[]
          metadata?: Json
          ocr_status?: string
          student_id?: string | null
          subject?: string | null
          uploaded_at?: string
        }
        Update: {
          course_id?: string | null
          exam_name?: string
          exam_session?: string | null
          exam_year?: number
          id?: string
          image_urls?: string[]
          metadata?: Json
          ocr_status?: string
          student_id?: string | null
          subject?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_exam_papers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      session_events: {
        Row: {
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          session_id: string
          student_id: string
        }
        Insert: {
          event_type: string
          id?: string
          occurred_at?: string
          payload?: Json
          session_id: string
          student_id: string
        }
        Update: {
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          course_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          enrollment_id: string | null
          id: string
          lesson_id: string | null
          metadata: Json
          mock_attempt_id: string | null
          modality: Database["public"]["Enums"]["modality"]
          session_type: Database["public"]["Enums"]["session_type"]
          started_at: string
          student_id: string
          summary: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          enrollment_id?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          mock_attempt_id?: string | null
          modality?: Database["public"]["Enums"]["modality"]
          session_type: Database["public"]["Enums"]["session_type"]
          started_at?: string
          student_id: string
          summary?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          enrollment_id?: string | null
          id?: string
          lesson_id?: string | null
          metadata?: Json
          mock_attempt_id?: string | null
          modality?: Database["public"]["Enums"]["modality"]
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string
          student_id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      signoff_events: {
        Row: {
          course_id: string
          criteria_snapshot: Json
          from_status: Database["public"]["Enums"]["signoff_status"] | null
          id: string
          occurred_at: string
          student_id: string
          to_status: Database["public"]["Enums"]["signoff_status"]
          triggered_by_attempt_id: string | null
        }
        Insert: {
          course_id: string
          criteria_snapshot: Json
          from_status?: Database["public"]["Enums"]["signoff_status"] | null
          id?: string
          occurred_at?: string
          student_id: string
          to_status: Database["public"]["Enums"]["signoff_status"]
          triggered_by_attempt_id?: string | null
        }
        Update: {
          course_id?: string
          criteria_snapshot?: Json
          from_status?: Database["public"]["Enums"]["signoff_status"] | null
          id?: string
          occurred_at?: string
          student_id?: string
          to_status?: Database["public"]["Enums"]["signoff_status"]
          triggered_by_attempt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signoff_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signoff_events_triggered_by_attempt_id_fkey"
            columns: ["triggered_by_attempt_id"]
            isOneToOne: false
            referencedRelation: "mock_exam_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      sme_reviewers: {
        Row: {
          created_at: string
          email: string
          expertise_areas: string[] | null
          full_name: string
          hourly_rate_usd_cents: number | null
          id: string
          is_active: boolean
          metadata: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expertise_areas?: string[] | null
          full_name: string
          hourly_rate_usd_cents?: number | null
          id?: string
          is_active?: boolean
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expertise_areas?: string[] | null
          full_name?: string
          hourly_rate_usd_cents?: number | null
          id?: string
          is_active?: boolean
          metadata?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          created_at: string
          email: string | null
          metadata: Json
          stripe_customer_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          metadata?: Json
          stripe_customer_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          metadata?: Json
          stripe_customer_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_knowledge_state: {
        Row: {
          concept_tag: string
          confidence: number
          correct_count: number
          course_id: string
          created_at: string
          id: string
          incorrect_count: number
          last_explanation_at: string | null
          last_observed_at: string
          last_quiz_at: string | null
          mastery_probability: number
          metadata: Json
          observation_count: number
          student_id: string
          updated_at: string
        }
        Insert: {
          concept_tag: string
          confidence?: number
          correct_count?: number
          course_id: string
          created_at?: string
          id?: string
          incorrect_count?: number
          last_explanation_at?: string | null
          last_observed_at?: string
          last_quiz_at?: string | null
          mastery_probability?: number
          metadata?: Json
          observation_count?: number
          student_id: string
          updated_at?: string
        }
        Update: {
          concept_tag?: string
          confidence?: number
          correct_count?: number
          course_id?: string
          created_at?: string
          id?: string
          incorrect_count?: number
          last_explanation_at?: string | null
          last_observed_at?: string
          last_quiz_at?: string | null
          mastery_probability?: number
          metadata?: Json
          observation_count?: number
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_knowledge_state_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_memory: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          embedding: string | null
          expires_at: string | null
          id: string
          importance: number
          last_referenced_at: string | null
          memory_type: string
          metadata: Json
          reference_count: number
          student_id: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          embedding?: string | null
          expires_at?: string | null
          id?: string
          importance?: number
          last_referenced_at?: string | null
          memory_type: string
          metadata?: Json
          reference_count?: number
          student_id: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          embedding?: string | null
          expires_at?: string | null
          id?: string
          importance?: number
          last_referenced_at?: string | null
          memory_type?: string
          metadata?: Json
          reference_count?: number
          student_id?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_memory_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      student_preferences: {
        Row: {
          avatar_choice: string | null
          bangla_code_switch: boolean | null
          contextual_modality: Json | null
          created_at: string
          daily_study_goal_minutes: number | null
          notification_preferences: Json | null
          preferred_modality: Database["public"]["Enums"]["modality"]
          student_id: string
          updated_at: string
          voice_gender: string | null
          voice_speed: number | null
        }
        Insert: {
          avatar_choice?: string | null
          bangla_code_switch?: boolean | null
          contextual_modality?: Json | null
          created_at?: string
          daily_study_goal_minutes?: number | null
          notification_preferences?: Json | null
          preferred_modality?: Database["public"]["Enums"]["modality"]
          student_id: string
          updated_at?: string
          voice_gender?: string | null
          voice_speed?: number | null
        }
        Update: {
          avatar_choice?: string | null
          bangla_code_switch?: boolean | null
          contextual_modality?: Json | null
          created_at?: string
          daily_study_goal_minutes?: number | null
          notification_preferences?: Json | null
          preferred_modality?: Database["public"]["Enums"]["modality"]
          student_id?: string
          updated_at?: string
          voice_gender?: string | null
          voice_speed?: number | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          employer: string | null
          full_name: string | null
          goals: Json | null
          id: string
          metadata: Json
          professional_role: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          employer?: string | null
          full_name?: string | null
          goals?: Json | null
          id: string
          metadata?: Json
          professional_role?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          employer?: string | null
          full_name?: string | null
          goals?: Json | null
          id?: string
          metadata?: Json
          professional_role?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_readiness: {
        Row: {
          average_score: number | null
          course_id: string
          created_at: string
          criteria_met: Json
          id: string
          last_evaluated_at: string
          metadata: Json
          minimum_score: number | null
          mock_count: number
          status: Database["public"]["Enums"]["signoff_status"]
          student_id: string
          updated_at: string
          weakest_domain: string | null
          weakest_domain_score: number | null
        }
        Insert: {
          average_score?: number | null
          course_id: string
          created_at?: string
          criteria_met?: Json
          id?: string
          last_evaluated_at?: string
          metadata?: Json
          minimum_score?: number | null
          mock_count?: number
          status?: Database["public"]["Enums"]["signoff_status"]
          student_id: string
          updated_at?: string
          weakest_domain?: string | null
          weakest_domain_score?: number | null
        }
        Update: {
          average_score?: number | null
          course_id?: string
          created_at?: string
          criteria_met?: Json
          id?: string
          last_evaluated_at?: string
          metadata?: Json
          minimum_score?: number | null
          mock_count?: number
          status?: Database["public"]["Enums"]["signoff_status"]
          student_id?: string
          updated_at?: string
          weakest_domain?: string | null
          weakest_domain_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_readiness_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string
          stripe_subscription_id: string
          student_id: string
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          metadata?: Json
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id: string
          stripe_subscription_id: string
          student_id: string
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_price_id?: string
          stripe_subscription_id?: string
          student_id?: string
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      zz_arrow_bak_cle: {
        Row: {
          audio_url: string | null
          body: string | null
          id: string | null
          scene_data: Json | null
        }
        Insert: {
          audio_url?: string | null
          body?: string | null
          id?: string | null
          scene_data?: Json | null
        }
        Update: {
          audio_url?: string | null
          body?: string | null
          id?: string | null
          scene_data?: Json | null
        }
        Relationships: []
      }
      zz_emdash_bak_cle: {
        Row: {
          body: string | null
          id: string | null
          scene_data: Json | null
          title: string | null
        }
        Insert: {
          body?: string | null
          id?: string | null
          scene_data?: Json | null
          title?: string | null
        }
        Update: {
          body?: string | null
          id?: string | null
          scene_data?: Json | null
          title?: string | null
        }
        Relationships: []
      }
      zz_emdash_bak_glossary: {
        Row: {
          definition: string | null
          id: string | null
          short_definition: string | null
          term: string | null
        }
        Insert: {
          definition?: string | null
          id?: string | null
          short_definition?: string | null
          term?: string | null
        }
        Update: {
          definition?: string | null
          id?: string | null
          short_definition?: string | null
          term?: string | null
        }
        Relationships: []
      }
      zz_emdash_bak_lessons: {
        Row: {
          description: string | null
          id: string | null
          learning_objectives: Json | null
          name: string | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          learning_objectives?: Json | null
          name?: string | null
        }
        Update: {
          description?: string | null
          id?: string | null
          learning_objectives?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      zz_emdash_bak_modules: {
        Row: {
          description: string | null
          id: string | null
          learning_objectives: Json | null
          name: string | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          learning_objectives?: Json | null
          name?: string | null
        }
        Update: {
          description?: string | null
          id?: string | null
          learning_objectives?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      zz_emdash_bak_qbank: {
        Row: {
          explanation: string | null
          id: string | null
          options: Json | null
          question_text: string | null
          wrong_answer_rationales: Json | null
        }
        Insert: {
          explanation?: string | null
          id?: string | null
          options?: Json | null
          question_text?: string | null
          wrong_answer_rationales?: Json | null
        }
        Update: {
          explanation?: string | null
          id?: string | null
          options?: Json | null
          question_text?: string | null
          wrong_answer_rationales?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_mock_attempt: {
        Args: { p_course: string; p_student: string }
        Returns: boolean
      }
      match_cached_qa: {
        Args: {
          p_course_id: string
          p_match_count?: number
          p_match_threshold?: number
          p_query_embedding: string
        }
        Returns: {
          answer_text: string
          hit_count: number
          id: string
          origin: Database["public"]["Enums"]["qa_origin"]
          question_text: string
          similarity: number
        }[]
      }
    }
    Enums: {
      content_element_type:
        | "explanation"
        | "case_study"
        | "analogy"
        | "definition"
        | "example"
        | "counter_example"
        | "diagram_spec"
        | "quiz_question"
        | "reflection_prompt"
      course_status: "draft" | "in_review" | "published" | "archived"
      course_tier: "global" | "bangladesh"
      difficulty_level: "foundational" | "standard" | "advanced" | "expert"
      enrollment_status:
        | "active"
        | "completed"
        | "expired"
        | "refunded"
        | "paused"
      escalation_reason:
        | "novel_question"
        | "low_confidence"
        | "sensitive_topic"
        | "cache_miss"
        | "student_explicit_request"
      examiner_status: "prospect" | "active" | "inactive" | "departed"
      grader_review_verdict:
        | "agrees"
        | "too_lenient"
        | "too_strict"
        | "incorrect"
      mock_attempt_status:
        | "in_progress"
        | "submitted"
        | "invalidated"
        | "abandoned"
      modality: "standard" | "audio" | "dialogue" | "drill"
      purchase_status:
        | "pending"
        | "completed"
        | "refunded"
        | "failed"
        | "disputed"
      qa_origin:
        | "preauthored"
        | "student_asked"
        | "classmate_asked"
        | "lecturer_proactive"
      question_type:
        | "single_choice"
        | "multiple_choice"
        | "true_false"
        | "short_answer"
        | "written_answer"
        | "scenario_mcq"
        | "drag_and_drop"
        | "matching"
      real_exam_result: "pass" | "fail" | "pending" | "not_taken"
      review_status: "pending" | "approved" | "changes_requested" | "rejected"
      scene_type: "reading" | "slide" | "quiz" | "interactive" | "pbl"
      session_type: "lesson" | "mock_exam" | "quiz" | "review" | "free_chat"
      signoff_status: "not_ready" | "approaching" | "ready" | "stale"
      subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "paused"
        | "trialing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_element_type: [
        "explanation",
        "case_study",
        "analogy",
        "definition",
        "example",
        "counter_example",
        "diagram_spec",
        "quiz_question",
        "reflection_prompt",
      ],
      course_status: ["draft", "in_review", "published", "archived"],
      course_tier: ["global", "bangladesh"],
      difficulty_level: ["foundational", "standard", "advanced", "expert"],
      enrollment_status: [
        "active",
        "completed",
        "expired",
        "refunded",
        "paused",
      ],
      escalation_reason: [
        "novel_question",
        "low_confidence",
        "sensitive_topic",
        "cache_miss",
        "student_explicit_request",
      ],
      examiner_status: ["prospect", "active", "inactive", "departed"],
      grader_review_verdict: [
        "agrees",
        "too_lenient",
        "too_strict",
        "incorrect",
      ],
      mock_attempt_status: [
        "in_progress",
        "submitted",
        "invalidated",
        "abandoned",
      ],
      modality: ["standard", "audio", "dialogue", "drill"],
      purchase_status: [
        "pending",
        "completed",
        "refunded",
        "failed",
        "disputed",
      ],
      qa_origin: [
        "preauthored",
        "student_asked",
        "classmate_asked",
        "lecturer_proactive",
      ],
      question_type: [
        "single_choice",
        "multiple_choice",
        "true_false",
        "short_answer",
        "written_answer",
        "scenario_mcq",
        "drag_and_drop",
        "matching",
      ],
      real_exam_result: ["pass", "fail", "pending", "not_taken"],
      review_status: ["pending", "approved", "changes_requested", "rejected"],
      scene_type: ["reading", "slide", "quiz", "interactive", "pbl"],
      session_type: ["lesson", "mock_exam", "quiz", "review", "free_chat"],
      signoff_status: ["not_ready", "approaching", "ready", "stale"],
      subscription_status: [
        "active",
        "past_due",
        "canceled",
        "paused",
        "trialing",
      ],
    },
  },
} as const
