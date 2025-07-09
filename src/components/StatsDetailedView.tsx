import { useState } from 'react';
import { useUserAttempts } from '@/hooks/useUserAttempts';
import { MobileCard } from '@/components/ui/mobile-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target, 
  Calendar,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Zap,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const StatsDetailedView = () => {
  const { data: userAttempts, isLoading } = useUserAttempts();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');

  // Add null check early
  if (!userAttempts) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Activity className="w-8 h-8 animate-pulse text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">جاري تحميل الإحصائيات المفصلة...</p>
      </div>
    );
  }

  const completedAttempts = userAttempts?.filter(attempt => attempt.is_completed) || [];
  
  
  if (completedAttempts.length === 0) {
    return (
      <MobileCard>
        <div className="p-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد بيانات كافية</h3>
          <p className="text-gray-600 mb-4">أكمل بعض الامتحانات لرؤية الإحصائيات المفصلة</p>
        </div>
      </MobileCard>
    );
  }

  // Calculate detailed statistics
  if (!completedAttempts || completedAttempts.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No data available</p>
      </div>
    );
  }

  const totalAttempts = completedAttempts.length;
  const averageScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts;
  const highestScore = Math.max(...completedAttempts.map(attempt => attempt.score || 0));
  const lowestScore = Math.min(...completedAttempts.map(attempt => attempt.score || 0));
  
  // Performance categories
  const excellentScores = completedAttempts.filter(a => (a.score || 0) >= 90).length;
  const goodScores = completedAttempts.filter(a => (a.score || 0) >= 70 && (a.score || 0) < 90).length;
  const fairScores = completedAttempts.filter(a => (a.score || 0) >= 60 && (a.score || 0) < 70).length;
  const poorScores = completedAttempts.filter(a => (a.score || 0) < 60).length;
  
  // Time statistics
  const totalTime = completedAttempts.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0);
  const averageTime = Math.floor(totalTime / totalAttempts / 60); // in minutes
  const fastestTime = Math.min(...completedAttempts.map(attempt => attempt.time_taken || 3600));
  const slowestTime = Math.max(...completedAttempts.map(attempt => attempt.time_taken || 0));
  
  // Recent performance trend (last 5 attempts)
  const recentAttempts = completedAttempts.slice(0, 5);
  const recentAverage = recentAttempts.length > 0 
    ? recentAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / recentAttempts.length 
    : 0;
  const improvementTrend = recentAverage > averageScore;

  // Performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: "ممتاز", color: "text-emerald-600", bgColor: "bg-emerald-100", icon: Award };
    if (score >= 80) return { label: "جيد جداً", color: "text-blue-600", bgColor: "bg-blue-100", icon: Trophy };
    if (score >= 70) return { label: "جيد", color: "text-green-600", bgColor: "bg-green-100", icon: Target };
    if (score >= 60) return { label: "مقبول", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Star };
    return { label: "يحتاج تحسين", color: "text-red-600", bgColor: "bg-red-100", icon: TrendingDown };
  };

  const currentLevel = getPerformanceLevel(averageScore);
  const CurrentLevelIcon = currentLevel.icon;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Performance Overview */}
      <MobileCard>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            نظرة عامة على الأداء
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{totalAttempts}</div>
              <div className="text-sm text-gray-600">امتحان مكتمل</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{averageScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">المعدل العام</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{highestScore}%</div>
              <div className="text-sm text-gray-600">أعلى نتيجة</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{averageTime}</div>
              <div className="text-sm text-gray-600">متوسط الوقت (د)</div>
            </div>
          </div>

          {/* Current Performance Level */}
          <div className={`p-4 rounded-lg ${currentLevel.bgColor} border-2 border-opacity-50`}>
            <div className="flex items-center gap-3">
              <CurrentLevelIcon className={`w-8 h-8 ${currentLevel.color}`} />
              <div>
                <div className={`font-bold text-lg ${currentLevel.color}`}>
                  مستوى الأداء الحالي: {currentLevel.label}
                </div>
                <div className="text-sm text-gray-600">
                  {improvementTrend 
                    ? "📈 تحسن ملحوظ في الأداء المؤخر" 
                    : "📊 حافظ على مستوى الأداء الجيد"
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Performance Distribution */}
      <MobileCard>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-blue-600" />
            توزيع النتائج
          </h3>
          
          <div className="space-y-4">
            {excellentScores > 0 && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">ممتاز (90%+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">{excellentScores}</span>
                  <div className="w-16 bg-emerald-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${(excellentScores / totalAttempts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {goodScores > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">جيد جداً (70-89%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">{goodScores}</span>
                  <div className="w-16 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(goodScores / totalAttempts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {fairScores > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold">مقبول (60-69%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600 font-bold">{fairScores}</span>
                  <div className="w-16 bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${(fairScores / totalAttempts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {poorScores > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="font-semibold">يحتاج تحسين (أقل من 60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">{poorScores}</span>
                  <div className="w-16 bg-red-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(poorScores / totalAttempts) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileCard>

      {/* Time Analysis */}
      <MobileCard>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            تحليل الوقت
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">
                {Math.floor(fastestTime / 60)} دقيقة
              </div>
              <div className="text-sm text-gray-600">أسرع امتحان</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">{averageTime} دقيقة</div>
              <div className="text-sm text-gray-600">المتوسط</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-600">
                {Math.floor(slowestTime / 60)} دقيقة
              </div>
              <div className="text-sm text-gray-600">أطول امتحان</div>
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Recent Performance Trend */}
      <MobileCard>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            الأداء المؤخر
          </h3>
          
          <div className="space-y-3">
            {(recentAttempts || []).slice(0, 5).map((attempt, index) => (
              <div 
                key={attempt.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{attempt?.exams?.title || 'امتحان'}</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(attempt.completed_at!), 'dd MMM yyyy', { locale: ar })}
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={(attempt.score || 0) >= 70 ? "secondary" : "destructive"}
                  className="text-sm px-2 py-1"
                >
                  {attempt.score}%
                </Badge>
              </div>
            ))}
          </div>
          
          {improvementTrend && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">تحسن في الأداء!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                أداؤك في الامتحانات الأخيرة أفضل من معدلك العام بـ {(recentAverage - averageScore).toFixed(1)} نقطة
              </p>
            </div>
          )}
        </div>
      </MobileCard>

      {/* Recommendations */}
      <MobileCard>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600" />
            توصيات للتحسين
          </h3>
          
          <div className="space-y-3">
            {averageScore < 70 && (
              <div className="p-3 bg-orange-50 rounded-lg border-r-4 border-orange-400">
                <div className="font-semibold text-orange-800">ركز على المراجعة</div>
                <p className="text-sm text-orange-700">
                  معدلك الحالي أقل من 70%. راجع المواضيع الأساسية وأعد الامتحانات
                </p>
              </div>
            )}
            
            {averageTime > 45 && (
              <div className="p-3 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                <div className="font-semibold text-blue-800">تحسين إدارة الوقت</div>
                <p className="text-sm text-blue-700">
                  تستغرق وقتاً أطول من المتوسط. تدرب على حل الأسئلة بسرعة أكبر
                </p>
              </div>
            )}
            
            {excellentScores >= totalAttempts * 0.7 && (
              <div className="p-3 bg-emerald-50 rounded-lg border-r-4 border-emerald-400">
                <div className="font-semibold text-emerald-800">أداء ممتاز!</div>
                <p className="text-sm text-emerald-700">
                  تحافظ على مستوى عالٍ من الأداء. استمر في هذا التميز
                </p>
              </div>
            )}
          </div>
        </div>
      </MobileCard>
    </div>
  );
};