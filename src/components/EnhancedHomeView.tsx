import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus,
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  XCircle,
  AlertCircle,
  RefreshCw
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'duration' | 'completion'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
        window.location.href = '/results';
      }
    }
  ];

  // Filter and sort exams
  const filteredAndSortedExams = useMemo(() => {
    if (!exams) return [];
    
    return exams
      .filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            exam.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all';
        const matchesDifficulty = selectedDifficulty === 'all';
        
        return matchesSearch && matchesCategory && matchesDifficulty;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.title.localeCompare(b.title, 'ar');
            break;
          case 'duration':
            comparison = a.duration_minutes - b.duration_minutes;
            break;
          case 'completion':
            const aCompleted = examStatuses?.get(a.id)?.is_completed ? 1 : 0;
            const bCompleted = examStatuses?.get(b.id)?.is_completed ? 1 : 0;
            comparison = bCompleted - aCompleted;
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [exams, searchQuery, selectedCategory, selectedDifficulty, sortBy, sortOrder, examStatuses]);

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

  // Recent activity
  const recentActivity = completedAttempts.slice(0, 5);

  // Display exams (show limited or all based on state)
  const displayedExams = showAllExams ? filteredAndSortedExams : filteredAndSortedExams.slice(0, 6);

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
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${colorClasses[action.color as keyof typeof colorClasses]}`}
                  onClick={action.action}
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

      {/* Statistics Overview */}
      <div className="px-4 md:px-0">
        <StatsOverview
          totalExams={exams?.length || 0}
          completedExams={completedAttempts.length}
          averageScore={averageScore}
          totalQuestions={totalQuestions}
        />
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-4 md:px-0"
      >
        <MobileCard>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">البحث والتصفية</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث في الامتحانات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="specialized">متخصص</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="المستوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="easy">سهل</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="hard">صعب</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">الاسم</SelectItem>
                  <SelectItem value="duration">المدة</SelectItem>
                  <SelectItem value="completion">الإكمال</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <Button
                variant={sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('asc')}
              >
                <SortAsc className="w-4 h-4 mr-1" />
                تصاعدي
              </Button>
              <Button
                variant={sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortOrder('desc')}
              >
                <SortDesc className="w-4 h-4 mr-1" />
                تنازلي
              </Button>
            </div>
          </div>
        </MobileCard>
      </motion.div>

      {/* Exams Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="px-4 md:px-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h3 className="text-xl font-bold text-gray-900">
            الامتحانات المتاحة ({filteredAndSortedExams.length})
          </h3>
          {filteredAndSortedExams.length > 6 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAllExams(!showAllExams)}
            >
              {showAllExams ? 'عرض أقل' : 'عرض المزيد'}
            </Button>
          )}
        </div>

        {displayedExams.length === 0 ? (
          <MobileCard>
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد امتحانات</h3>
              <p className="text-gray-600 mb-4">لم يتم العثور على امتحانات تطابق معايير البحث</p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </MobileCard>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6" 
            : "space-y-4"
          }>
            <AnimatePresence>
              {displayedExams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ExamCard
                    exam={exam}
                    examStatus={examStatuses?.get(exam.id)}
                    onStartExam={onStartExam}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-4 md:px-0"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">النشاط الأخير</h3>
          <MobileCard>
            <div className="p-4 space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{activity.exams?.title || 'امتحان'}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(activity.completed_at!), 'dd MMMM yyyy', { locale: ar })}
                      </div>
                    </div>
                  </div>
                  <Badge variant={(activity.score || 0) >= 70 ? "secondary" : "destructive"}>
                    {activity.score}%
                  </Badge>
                </motion.div>
              ))}
            </div>
          </MobileCard>
        </motion.div>
      )}

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="px-4 md:px-0"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">الإنجازات الأخيرة</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recentAchievements.map((achievement, index) => {
            const Icon = achievement.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-green-600 border-emerald-200 bg-emerald-50',
              orange: 'from-orange-500 to-red-600 border-orange-200 bg-orange-50',
              yellow: 'from-yellow-500 to-orange-600 border-yellow-200 bg-yellow-50'
            };

            return (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <MobileCard className={`${achievement.unlocked ? colorClasses[achievement.color as keyof typeof colorClasses] : 'bg-gray-50 opacity-60'}`}>
                  <div className="p-4 text-center">
                    <div className={`w-12 h-12 ${achievement.unlocked ? `bg-gradient-to-br ${colorClasses[achievement.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[achievement.color as keyof typeof colorClasses].split(' ')[1]}` : 'bg-gray-200'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <h4 className={`font-bold mb-1 ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        مُحقق
                      </Badge>
                    )}
                  </div>
                </MobileCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Study Tips */}
      <div className="px-4 md:px-0">
        <StudyTips />
      </div>
    </div>
  );
};