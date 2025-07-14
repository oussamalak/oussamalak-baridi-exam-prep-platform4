import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

/**
 * Hook to fetch the latest completed attempt for a specific exam.
 * Returns exam status including score, correct_answers, and attempt_id.
 * FIXED: Properly returns attempt_id for review functionality
 */
export const useExamStatus = (examId: string) => {
  return useQuery({
    queryKey: ['exam-status', examId],
    queryFn: useCallback(async () => {
      console.log('🔍 FIXED: Fetching exam status for exam:', examId);
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('⚠️ No authenticated user found');
        throw new Error('Unauthorized user');
      }

      const { data, error } = await supabase
        .from('user_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ FIXED: Error fetching exam status:', error);
        throw error;
      }

      console.log('🔍 FIXED: Raw data from Supabase:', data);

      // CRITICAL FIX: Properly structure the return object with attempt_id
      const result = {
        attempt_id: data?.id ?? null,  // 👈 CRITICAL: Map data.id to attempt_id
        exam_id: data?.exam_id ?? null,
        score: data?.score ?? null,
        correct_answers: data?.correct_answers ?? null,
        completed_at: data?.completed_at ?? null,
        is_completed: data?.is_completed ?? false,
        total_questions: data?.total_questions ?? null
      };

      console.log('✅ FIXED: Structured result with attempt_id:', result);
      console.log('🎯 FIXED: attempt_id value:', result.attempt_id);

      return result;
    }, [examId]),
    enabled: !!examId,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Unauthorized')) return false;
      return failureCount < 2;
    },
  });
};

/**
 * Hook to fetch all latest completed exam attempts for the user.
 * Returns a Map<examId, examStatus> including attempt_id.
 * FIXED: Ensures attempt_id is properly included in all exam statuses
 */
export const useAllExamStatuses = () => {
  return useQuery({
    queryKey: ['all-exam-statuses-fixed'], // New cache key to avoid conflicts
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ FIXED: No authenticated user found');
        return new Map();
      }

      console.log('👤 FIXED: Fetching exam statuses for user:', user.id);

      // Fetch all completed attempts
      const { data: userAttempts, error } = await supabase
        .from('user_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('❌ FIXED: Error fetching user attempts:', error);
        throw error;
      }

      console.log('📊 FIXED: All completed attempts:', userAttempts);

      // Store only the latest attempt per exam with proper attempt_id
      const examStatusMap = new Map();
      
      userAttempts?.forEach(attempt => {
        if (!examStatusMap.has(attempt.exam_id)) {
          // CRITICAL FIX: Properly structure each exam status with attempt_id
          const examStatus = {
            attempt_id: attempt.id,  // 👈 CRITICAL: Map attempt.id to attempt_id
            exam_id: attempt.exam_id,
            score: attempt.score,
            correct_answers: attempt.correct_answers,
            completed_at: attempt.completed_at,
            is_completed: attempt.is_completed,
            total_questions: attempt.total_questions
          };
          
          console.log(`📝 FIXED: Setting status for exam ${attempt.exam_id}:`, examStatus);
          console.log(`🎯 FIXED: attempt_id for exam ${attempt.exam_id}:`, examStatus.attempt_id);
          
          examStatusMap.set(attempt.exam_id, examStatus);
        }
      });

      console.log('📊 FIXED: Final exam status map:', examStatusMap);
      
      // Log each exam's attempt_id for verification
      examStatusMap.forEach((status, examId) => {
        console.log(`🔍 FIXED: Exam ${examId} has attempt_id:`, status.attempt_id);
      });
      
      return examStatusMap;
    },
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
    refetchOnMount: true,
  });
};