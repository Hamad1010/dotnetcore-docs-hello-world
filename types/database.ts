// Hand-written to match supabase/schema.sql. Once a real Supabase project
// exists, this can be regenerated exactly with the Supabase CLI:
//   npx supabase gen types typescript --project-id <your-project-ref> > types/database.ts

export type QuestionType = 'multiple_choice' | 'fill_blank' | 'match_pairs';
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';
export type SubscriptionStatus = 'inactive' | 'trial' | 'active' | 'expired';

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['courses']['Row']> & { title: string };
        Update: Partial<Database['public']['Tables']['courses']['Row']>;
        Relationships: [];
      };
      units: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          sort_order: number;
        };
        Insert: Partial<Database['public']['Tables']['units']['Row']> & {
          course_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['units']['Row']>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          title: string;
          sort_order: number;
        };
        Insert: Partial<Database['public']['Tables']['lessons']['Row']> & {
          unit_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Row']>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          lesson_id: string;
          type: QuestionType;
          prompt: string;
          options: unknown | null;
          correct_answer: unknown;
          explanation_correct: string | null;
          explanation_incorrect: string | null;
          difficulty: string | null;
          sort_order: number;
        };
        Insert: Partial<Database['public']['Tables']['questions']['Row']> & {
          lesson_id: string;
          type: QuestionType;
          prompt: string;
          correct_answer: unknown;
        };
        Update: Partial<Database['public']['Tables']['questions']['Row']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          current_streak: number;
          longest_streak: number;
          total_xp: number;
          streak_freezes_available: number;
          is_premium: boolean;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: LessonStatus;
          score: number | null;
          last_attempted_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['user_progress']['Row']> & {
          user_id: string;
          lesson_id: string;
        };
        Update: Partial<Database['public']['Tables']['user_progress']['Row']>;
        Relationships: [];
      };
      user_answer_log: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          was_correct: boolean;
          answered_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_answer_log']['Row']> & {
          user_id: string;
          question_id: string;
          was_correct: boolean;
        };
        Update: Partial<Database['public']['Tables']['user_answer_log']['Row']>;
        Relationships: [];
      };
      streak_records: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          completed: boolean;
          freeze_used: boolean;
        };
        Insert: Partial<Database['public']['Tables']['streak_records']['Row']> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database['public']['Tables']['streak_records']['Row']>;
        Relationships: [];
      };
      review_queue_items: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          next_review_at: string;
          times_reviewed: number;
        };
        Insert: Partial<Database['public']['Tables']['review_queue_items']['Row']> & {
          user_id: string;
          question_id: string;
        };
        Update: Partial<Database['public']['Tables']['review_queue_items']['Row']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: string;
          status: SubscriptionStatus;
          revenuecat_customer_id: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
        Relationships: [];
      };
      reminder_settings: {
        Row: {
          id: string;
          user_id: string;
          reminder_times: string[];
          enabled: boolean;
          timezone: string;
        };
        Insert: Partial<Database['public']['Tables']['reminder_settings']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['reminder_settings']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      award_xp: {
        Args: { xp_amount: number };
        Returns: void;
      };
    };
  };
}

// Friendly aliases for use throughout the app.
export type Course = Database['public']['Tables']['courses']['Row'];
export type Unit = Database['public']['Tables']['units']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserProgress = Database['public']['Tables']['user_progress']['Row'];
export type UserAnswerLog = Database['public']['Tables']['user_answer_log']['Row'];
export type StreakRecord = Database['public']['Tables']['streak_records']['Row'];
export type ReviewQueueItem = Database['public']['Tables']['review_queue_items']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type ReminderSettings = Database['public']['Tables']['reminder_settings']['Row'];
