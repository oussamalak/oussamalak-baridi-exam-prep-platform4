import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserAttempts } from '@/hooks/useUserAttempts';
import { MobileCard } from '@/components/ui/mobile-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Trophy, Target, Calendar, Clock, Award, BarChart3, PieChart as PieChartIcon, Activity, Star, Zap, Download, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle, Users, Flame, Crown, Rocket, Heart, Gift, Eye, TrendingUp as TrendingRight } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, isAfter } from 'date-fns';
import { ar } from 'date-fns/locale';

export const EnhancedStatsView = () => {
  const { data: userAttempts, isLoading } = useUserAttempts();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'time' | 'completion'>('score');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [activeTab, setActiveTab] = useState('overview');

  const completedAttempts = userAttempts?.filter(attempt => attempt.is_completed) || [];

  // Add null checks and default values
  if (!userAttempts) {
    return <div>Loading...</div>;
  }

  // Filter data by selected period
  const filteredAttempts = useMemo(() => {
    if (selectedPeriod === 'all') return completedAttempts;
    
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = subDays(now, 30);
        break;
      case 'quarter':
        startDate = subDays(now, 90);
        break;
      case 'year':
        startDate = subDays(now, 365);
        break;
      default:
        return completedAttempts;
    }
    
    return completedAttempts.filter(attempt => 
      isAfter(new Date(attempt.completed_at!), startDate)
    );
  }, [completedAttempts, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Add safety checks
    if (!filteredAttempts || filteredAttempts.length === 0) {
      return {
        totalAttempts: 0, averageScore: 0, highestScore: 0, lowestScore: 0,
        totalTime: 0, averageTime: 0, excellentScores: 0, goodScores: 0,
        fairScores: 0, poorScores: 0, successRate: 0, improvementTrend: 0
      };
    }

    const totalAttempts = filteredAttempts.length;
    const averageScore = totalAttempts > 0 
      ? filteredAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts 
      : 0;
    const highestScore = totalAttempts > 0 
      ? Math.max(...filteredAttempts.map(attempt => attempt.score || 0))
      : 0;
    const lowestScore = totalAttempts > 0 
      ? Math.min(...filteredAttempts.map(attempt => attempt.score || 0))
      : 0;
    const totalTime = filteredAttempts.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0);
    const averageTime = totalAttempts > 0 ? Math.floor(totalTime / totalAttempts / 60) : 0;
    
    // Performance categories
    const excellentScores = filteredAttempts.filter(a => (a.score || 0) >= 90).length;
    const goodScores = filteredAttempts.filter(a => (a.score || 0) >= 70 && (a.score || 0) < 90).length;
    const fairScores = filteredAttempts.filter(a => (a.score || 0) >= 60 && (a.score || 0) < 70).length;
    const poorScores = filteredAttempts.filter(a => (a.score || 0) < 60).length;
    
    // Success rate
    const successRate = totalAttempts > 0 ? (filteredAttempts.filter(a => (a.score || 0) >= 70).length / totalAttempts) * 100 : 0;
    
    // Improvement trend
    const recentAttempts = filteredAttempts.slice(0, 5);
    const olderAttempts = filteredAttempts.slice(5, 10);
    const recentAverage = recentAttempts.length > 0 
      ? recentAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / recentAttempts.length 
      : 0;
    const olderAverage = olderAttempts.length > 0 
      ? olderAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / olderAttempts.length 
      : 0;
    const improvementTrend = recentAverage - olderAverage;

    return {
      totalAttempts,
      averageScore,
      highestScore,
      lowestScore,
      totalTime,
      averageTime,
      excellentScores,
      goodScores,
      fairScores,
      poorScores,
      successRate,
      improvementTrend
    };
  }, [filteredAttempts]);

  // Prepare chart data
  const chartData = useMemo(() => {
    // Add null check
    if (!filteredAttempts || filteredAttempts.length === 0) {
      return [];
    }

    return filteredAttempts
      .sort((a, b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime())
      .map((attempt, index) => ({
        index: index + 1,
        date: format(new Date(attempt.completed_at!), 'dd/MM', { locale: ar }),
        score: attempt.score || 0,
        time: Math.floor((attempt.time_taken || 0) / 60),
        examTitle: attempt.exams?.title || 'امتحان',
        correctAnswers: attempt.correct_answers || 0,
        totalQuestions: attempt.total_questions || 0
      }));
  }, [filteredAttempts]);

  // Performance distribution data for pie chart
  const performanceData = [
    { name: 'ممتاز (90%+)', value: stats.excellentScores, color: '#10b981' },
    { name: 'جيد (70-89%)', value: stats.goodScores, color: '#3b82f6' },
    { name: 'مقبول (60-69%)', value: stats.fairScores, color: '#f59e0b' },
    { name: 'ضعيف (<60%)', value: stats.poorScores, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Weekly performance data
  const weeklyData = useMemo(() => {
    // Add safety check
    if (!filteredAttempts || filteredAttempts.length === 0) {
      return [];
    }

    const weeks = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = subWeeks(new Date(), i);
      const weekEnd = subWeeks(new Date(), i - 1);
      const weekAttempts = filteredAttempts.filter(attempt => {
        const attemptDate = new Date(attempt.completed_at!);
        return attemptDate >= weekStart && attemptDate < weekEnd;
      });
      
      const weekAverage = weekAttempts.length > 0 
        ? weekAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / weekAttempts.length 
        : 0;
      
      weeks.push({
        week: format(weekStart, 'dd/MM', { locale: ar }),
        score: Math.round(weekAverage),
        attempts: weekAttempts.length
      });
    }
    return weeks;
  }, [filteredAttempts]);

  // Export functionality
  const exportData = (format: 'csv' | 'json') => {
    const data = (filteredAttempts || []).map(attempt => ({
      تاريخ_الامتحان: format(new Date(attempt.completed_at!), 'yyyy-MM-dd HH:mm', { locale: ar }),
      اسم_الامتحان: attempt.exams?.title || 'امتحان',
      النتيجة: attempt.score,
      الإجابات_الصحيحة: attempt.correct_answers,
      إجمالي_الأسئلة: attempt.total_questions,
      الوقت_المستغرق_بالدقائق: Math.floor((attempt.time_taken || 0) / 60)
    }));

    // Check if data exists
    if (!data || data.length === 0) {
      return;
    }

    if (format === 'csv') {
      const csv = [
        Object.keys(data[0] || {}).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `exam-statistics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } else {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `exam-statistics-${format(new Date(), 'yyyy-MM-dd')}.json`;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Activity className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!completedAttempts || completedAttempts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Activity className="w-12 h-12 text-emerald-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Controls */}
      <MobileCard>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">إعدادات العرض</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('csv')}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('json')}
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">آخر شهر</SelectItem>
                <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                <SelectItem value="year">آخر سنة</SelectItem>
                <SelectItem value="all">جميع الفترات</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
              <SelectTrigger>
                <SelectValue placeholder="المقياس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">النتائج</SelectItem>
                <SelectItem value="time">الوقت</SelectItem>
                <SelectItem value="completion">الإكمال</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الرسم البياني" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">خطي</SelectItem>
                <SelectItem value="area">منطقة</SelectItem>
                <SelectItem value="bar">أعمدة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </MobileCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MobileCard>
            <div className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">المعدل العام</div>
              {stats.improvementTrend !== 0 && (
                <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${
                  stats.improvementTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.improvementTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stats.improvementTrend).toFixed(1)}%
                </div>
              )}
            </div>
          </MobileCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MobileCard>
            <div className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</div>
              <div className="text-sm text-gray-600">امتحان مكتمل</div>
              <div className="text-xs text-gray-500 mt-1">
                في {selectedPeriod === 'all' ? 'جميع الفترات' : `آخر ${selectedPeriod === 'week' ? 'أسبوع' : selectedPeriod === 'month' ? 'شهر' : selectedPeriod === 'quarter' ? '3 أشهر' : 'سنة'}`}
              </div>
            </div>
          </MobileCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MobileCard>
            <div className="p-4 text-center">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.averageTime}</div>
              <div className="text-sm text-gray-600">متوسط الوقت (دقيقة)</div>
              <div className="text-xs text-gray-500 mt-1">
                إجمالي: {Math.floor(stats.totalTime / 3600)}س {Math.floor((stats.totalTime % 3600) / 60)}د
              </div>
            </div>
          </MobileCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MobileCard>
            <div className="p-4 text-center">
              <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">معدل النجاح</div>
              <div className="text-xs text-gray-500 mt-1">
                (70% أو أكثر)
              </div>
            </div>
          </MobileCard>
        </motion.div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="detailed">تفصيلي</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Performance Distribution */}
          <MobileCard>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <PieChartIcon className="w-6 h-6 text-blue-600" />
                توزيع الأداء
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ChartContainer>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={performanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${value} امتحان`, 'العدد']}
                          labelFormatter={(label) => label}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                
                <div className="space-y-3">
                  {performanceData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.value}</div>
                        <div className="text-sm text-gray-600">
                          {((item.value / stats.totalAttempts) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MobileCard>

          {/* Recent Performance */}
          <MobileCard>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6 text-green-600" />
                الأداء الأسبوعي
              </h3>
              
              <div className="h-64">
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          name === 'score' ? `${value}%` : `${value} امتحان`,
                          name === 'score' ? 'المعدل' : 'عدد الامتحانات'
                        ]}
                      />
                      <Bar dataKey="score" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </MobileCard>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <MobileCard>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                اتجاه {selectedMetric === 'score' ? 'النتائج' : selectedMetric === 'time' ? 'الوقت' : 'الإكمال'}
              </h3>
              
              <div className="h-80">
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' && (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [
                            selectedMetric === 'score' ? `${value}%` : 
                            selectedMetric === 'time' ? `${value} دقيقة` : value,
                            selectedMetric === 'score' ? 'النتيجة' : 
                            selectedMetric === 'time' ? 'الوقت' : 'الإكمال'
                          ]}
                          labelFormatter={(label) => `التاريخ: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={selectedMetric} 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    )}
                    
                    {chartType === 'area' && (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [
                            selectedMetric === 'score' ? `${value}%` : 
                            selectedMetric === 'time' ? `${value} دقيقة` : value,
                            selectedMetric === 'score' ? 'النتيجة' : 
                            selectedMetric === 'time' ? 'الوقت' : 'الإكمال'
                          ]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey={selectedMetric} 
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    )}
                    
                    {chartType === 'bar' && (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [
                            selectedMetric === 'score' ? `${value}%` : 
                            selectedMetric === 'time' ? `${value} دقيقة` : value,
                            selectedMetric === 'score' ? 'النتيجة' : 
                            selectedMetric === 'time' ? 'الوقت' : 'الإكمال'
                          ]}
                        />
                        <Bar dataKey={selectedMetric} fill="#10b981" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </MobileCard>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Performance Analysis */}
          <MobileCard>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                تحليل الأداء التفصيلي
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-emerald-600" />
                      <span className="font-bold text-emerald-800">أعلى نتيجة</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">{stats.highestScore}%</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <span className="font-bold text-blue-800">المعدل العام</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.averageScore.toFixed(1)}%</div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                      <span className="font-bold text-orange-800">أقل نتيجة</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-700">{stats.lowestScore}%</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-green-800">معدل النجاح</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{stats.successRate.toFixed(1)}%</div>
                    <Progress value={stats.successRate} className="mt-2" />
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-6 h-6 text-purple-600" />
                      <span className="font-bold text-purple-800">متوسط الوقت</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-700">{stats.averageTime} دقيقة</div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-6 h-6 text-yellow-600" />
                      <span className="font-bold text-yellow-800">نتائج ممتازة</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">{stats.excellentScores}</div>
                  </div>
                </div>
              </div>
            </div>
          </MobileCard>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <MobileCard>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-gray-600" />
                تفاصيل الامتحانات
              </h3>
              
              <div className="space-y-3">
                {filteredAttempts.slice(0, 10).map((attempt, index) => (
                  <motion.div
                    key={attempt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{attempt.exams?.title || 'امتحان'}</div>
                        <div className="text-sm text-gray-600">
                          {format(new Date(attempt.completed_at!), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={(attempt.score || 0) >= 70 ? "secondary" : "destructive"}>
                        {attempt.score}%
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">
                        {attempt.correct_answers}/{attempt.total_questions} صحيح
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((attempt.time_taken || 0) / 60)} دقيقة
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {filteredAttempts.length > 10 && (
                <div className="text-center mt-4">
                  <Button variant="outline">
                    عرض المزيد ({filteredAttempts.length - 10} امتحان إضافي)
                  </Button>
                </div>
              )}
            </div>
          </MobileCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};