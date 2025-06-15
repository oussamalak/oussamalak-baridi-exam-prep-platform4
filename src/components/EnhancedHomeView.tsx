import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientCard } from '@/components/ui/gradient-card';
import { MobileCard } from '@/components/ui/mobile-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { StatsOverview } from '@/components/StatsOverview';
import { ExamCard } from '@/components/ExamCard';
import { StudyTips } from '@/components/StudyTips';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Trophy,
  Target,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  Award,
  Zap,
  Calendar,
  CheckCircle,
  BarChart3,
  Users,
  Flame,
  Crown,
  Rocket,
  Heart,
  Gift,
  Bell,
  Download,
  Settings,
  Sparkles,
  ArrowRight,
  Play,
  Eye,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface EnhancedHomeViewProps {
  exams: any[];
  examStatuses: Map<string, any>;
  onStartExam: (examId: string) => void;
  completedAttempts: any[];
  averageScore: number;
  totalQuestions: number;
}

export const EnhancedHomeView = ({
  exams,
  examStatuses,
  onStartExam,
  completedAttempts,
  averageScore,
  totalQuestions
}: EnhancedHomeViewProps) => {
  const [showAllExams, setShowAllExams] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);

  // Calculate user level and progress
  const getUserLevel = (score: number) => {
    if (score >= 95) return { 
      level: "أسطورة", 
      color: "text-purple-600", 
      bgColor: "bg-purple-100", 
      progress: 100,
      icon: Crown,
      gradient: "from-purple-500 to-pink-600",
      nextLevel: null
    };
    if (score >= 90) return { 
      level: "خبير", 
      color: "text-emerald-600", 
      bgColor: "bg-emerald-100", 
      progress: 90,
      icon: Award,
      gradient: "from-emerald-500 to-teal-600",
      nextLevel: "أسطورة (95%)"
    };
    if (score >= 80) return { 
      level: "متقدم", 
      color: "text-blue-600", 
      bgColor: "bg-blue-100", 
      progress: 80,
      icon: Trophy,
      gradient: "from-blue-500 to-cyan-600",
      nextLevel: "خبير (90%)"
    };
    if (score >= 70) return { 
      level: "متوسط", 
      color: "text-green-600", 
      bgColor: "bg-green-100", 
      progress: 60,
      icon: Target,
      gradient: "from-green-500 to-emerald-600",
      nextLevel: "متقدم (80%)"
    };
    if (score >= 60) return { 
      level: "مبتدئ", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100", 
      progress: 40,
      icon: Star,
      gradient: "from-yellow-500 to-orange-600",
      nextLevel: "متوسط (70%)"
    };
    return { 
      level: "جديد", 
      color: "text-gray-600", 
      bgColor: "bg-gray-100", 
      progress: 20,
      icon: BookOpen,
      gradient: "from-gray-500 to-slate-600",
      nextLevel: "مبتدئ (60%)"
    };
  };

  const currentLevel = getUserLevel(averageScore);
  const CurrentLevelIcon = currentLevel.icon;

  // Quick actions
  const quickActions = [
    {
      id: 'start-exam',
      title: 'بدء امتحان سريع',
      description: 'ابدأ امتحاناً عشوائياً الآن',
      icon: Play,
      color: 'emerald',
      action: () => {
        if (exams && exams.length > 0) {
          const randomExam = exams[Math.floor(Math.random() * exams.length)];
          onStartExam(randomExam.id);
        }
      }
    },
    {
      id: 'continue-exam',
      title: 'متابعة التدريب',
      description: 'أكمل من حيث توقفت',
      icon: BookOpen,
      color: 'blue',
      action: () => {
        // Find incomplete exam or start new one
        if (exams && exams.length > 0) {
          onStartExam(exams[0].id);
        }
      }
    },
    {
      id: 'review-results',
      title: 'مراجعة النتائج',
      description: 'اطلع على أداءك السابق',
      icon: BarChart3,
      color: 'purple',
      action: () => {
        // Navigate to results page
        window.location.href = '/results';
      }
    }
  ];

  // Recent achievements
  const recentAchievements = [
    {
      title: 'النجم المتألق',
      description: 'حصلت على نتيجة ممتازة',
      icon: Star,
      color: 'emerald',
      unlocked: averageScore >= 90
    },
    {
      title: 'المثابر',
      description: 'أكملت عدة امتحانات',
      icon: Flame,
      color: 'orange',
      unlocked: completedAttempts.length >= 3
    },
    {
      title: 'السريع',
      description: 'أنجزت امتحاناً بسرعة',
      icon: Zap,
      color: 'yellow',
      unlocked: true
    }
  ];

  // Study streak calculation
  const studyStreak = Math.min(completedAttempts.length, 7);

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <MobileCard className="mx-4 md:mx-0">
          <GradientCard className="p-6 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent" />
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <motion.div 
                className="flex items-center justify-center gap-4 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${currentLevel.gradient} rounded-full flex items-center justify-center shadow-xl`}>
                  <CurrentLevelIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">مرحباً بك!</h2>
                  <p className="text-lg opacity-90">
                    مستواك الحالي: <span className="font-bold">{currentLevel.level}</span>
                  </p>
                </div>
              </motion.div>
              
              <div className="max-w-xl mx-auto space-y-4">
                <p className="text-base opacity-90 leading-relaxed">
                  استمر في التدريب والتحضير لامتحان مكلف بالزبائن في بريد الجزائر
                </p>
                
                {/* Level Progress */}
                {currentLevel.nextLevel && (
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">التقدم للمستوى التالي</span>
                      <span className="text-sm">{currentLevel.nextLevel}</span>
                    </div>
                    <Progress value={currentLevel.progress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </GradientCard>
        </MobileCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-4 md:px-0"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-green-600 border-emerald-200 bg-emerald-50',
              blue: 'from-blue-500 to-cyan-600 border-blue-200 bg-blue-50',
              purple: 'from-purple-500 to-pink-600 border-purple-200 bg-purple-50'
            };

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MobileCard 
                  onClick={action.action}
                  className={`cursor-pointer transition-all duration-300 ${colorClasses[action.color as keyof typeof colorClasses]} border-2`}
                >
                  <div className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[action.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[action.color as keyof typeof colorClasses].split(' ')[1]} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </MobileCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Enhanced Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-4 md:px-0"
      >
        <StatsOverview
          totalExams={exams?.length || 0}
          completedExams={completedAttempts.length}
          averageScore={averageScore}
          totalQuestions={totalQuestions}
        />
      </motion.div>

      {/* Study Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-4 md:px-0"
      >
        <MobileCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                سلسلة التدريب
              </h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {studyStreak} أيام
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i < studyStreak 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            
            <p className="text-gray-600 text-sm">
              {studyStreak >= 7 
                ? "🔥 رائع! حافظت على سلسلة تدريب مثالية!" 
                : `استمر في التدريب لتصل إلى ${7 - studyStreak} أيام أخرى`
              }
            </p>
          </div>
        </MobileCard>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-4 md:px-0"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">الإنجازات الأخيرة</h3>
          <Button variant="ghost" size="sm" className="text-emerald-600">
            عرض الكل
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentAchievements.map((achievement, index) => {
            const Icon = achievement.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-green-600 bg-emerald-50 border-emerald-200',
              orange: 'from-orange-500 to-red-600 bg-orange-50 border-orange-200',
              yellow: 'from-yellow-500 to-orange-600 bg-yellow-50 border-yellow-200'
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <MobileCard className={`${achievement.unlocked ? colorClasses[achievement.color as keyof typeof colorClasses] : 'bg-gray-50 border-gray-200'} border-2 relative overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.unlocked 
                          ? `bg-gradient-to-br ${colorClasses[achievement.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[achievement.color as keyof typeof colorClasses].split(' ')[1]} shadow-lg`
                          : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-5 h-5 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-xs ${achievement.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    
                    {achievement.unlocked && (
                      <motion.div
                        className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                      >
                        <CheckCircle className="w-4 h-4 text-yellow-800" />
                      </motion.div>
                    )}
                  </div>
                </MobileCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Available Exams */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="px-4 md:px-0"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">الامتحانات المتاحة</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAllExams(!showAllExams)}
            className="text-emerald-600"
          >
            {showAllExams ? 'عرض أقل' : 'عرض الكل'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {(showAllExams ? exams : exams?.slice(0, 3))?.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ExamCard
                exam={exam}
                examStatus={examStatuses?.get(exam.id)}
                onStartExam={onStartExam}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Study Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-4 md:px-0"
      >
        <StudyTips />
      </motion.div>

      {/* Daily Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="px-4 md:px-0"
      >
        <MobileCard>
          <div className="p-6 text-center bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">💪 تحفيز اليوم</h3>
            <p className="text-gray-700 leading-relaxed">
              "النجاح ليس نهاية المطاف، والفشل ليس قاتلاً، بل الشجاعة للمتابعة هي التي تهم."
            </p>
            <p className="text-sm text-gray-600 mt-2">- ونستون تشرشل</p>
          </div>
        </MobileCard>
      </motion.div>
    </div>
  );
};