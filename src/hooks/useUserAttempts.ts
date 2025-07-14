
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export const useUserAttempts = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['user-attempts'],
    queryFn: useCallback(async () => {
      console.log('📊 Fetching user attempts...');
      
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ No authenticated user for attempts');
        throw new Error('المستخدم غير مصرح له');
      }

      console.log('👤 Fetching attempts for user:', user.id);

      const { data, error } = await supabase
        .from('user_attempts')
        .select(`
          *,
          exams (title, description)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user attempts:', error);
        throw error;
      }

      console.log('✅ User attempts fetched successfully:', {
        count: data?.length || 0,
        completed: data?.filter(a => a.is_completed).length || 0
      });

      return data || [];
    } catch (error) {
      console.error('💥 Critical error in user attempts:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
    }, []),
    retry: 1,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    onError: (error) => {
      console.error('🚨 Query error in useUserAttempts:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل محاولاتك السابقة",
        variant: "destructive",
      });
    }
  });
};

export const useStartExamAttempt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ examId, totalQuestions }: { examId: string; totalQuestions: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('المستخدم غير مصرح له');
      }

      const { data, error } = await supabase
        .from('user_attempts')
        .insert({
          user_id: user.id,
          exam_id: examId,
          total_questions: totalQuestions,
          is_completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting exam attempt:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attempts'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في بدء الامتحان",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSubmitExamAttempt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      timeTaken 
    }: { 
      attemptId: string; 
      answers: { questionId: string; selectedOptionId: string; isCorrect: boolean }[];
      timeTaken: number;
    }) => {
      // Calculate score
      const correctAnswers = answers.filter(answer => answer.isCorrect).length;
      const score = Math.round((correctAnswers / answers.length) * 100);

      // Update attempt
      const { error: attemptError } = await supabase
        .from('user_attempts')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          score,
          correct_answers: correctAnswers,
          time_taken: timeTaken
        })
        .eq('id', attemptId);

      if (attemptError) {
        console.error('Error updating attempt:', attemptError);
        throw attemptError;
      }

      // Insert user answers
      const userAnswers = answers.map(answer => ({
        attempt_id: attemptId,
        question_id: answer.questionId,
        selected_option_id: answer.selectedOptionId,
        is_correct: answer.isCorrect
      }));

      const { error: answersError } = await supabase
        .from('user_answers')
        .insert(userAnswers);

      if (answersError) {
        console.error('Error inserting answers:', answersError);
        throw answersError;
      }

      return { score, correctAnswers };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attempts'] });
      toast({
        title: "تم تسليم الامتحان بنجاح",
        description: "يمكنك الآن مراجعة النتائج",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسليم الامتحان",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
