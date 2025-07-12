import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserAttempts } from '@/hooks/useUserAttempts';
import { MobileCard } from '@/components/ui/mobile-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer } from '@/components/ui/chart';
import { DatePicker } from '@/components/ui/date-picker';
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
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, TrendingDown, Trophy, Target, Calendar, Clock, Award, BarChart3, PieChart as PieChartIcon, Activity, Star, Zap, Download, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle, Users, Flame, Crown, Rocket, Heart, Gift, Eye, TrendingUp as TrendingRight, Search, SortAsc, SortDesc, Calendar as CalendarIcon, FileText, Image, Settings, Maximize2, Minimize2, Grid, List, ChevronLeft, ChevronRight, MoreVertical, Loader2 } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, isAfter, parseISO, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ErrorBoundary } from 'react-error-boundary';

// Types for better type safety
interface AttemptData {
  id: string;
  score: number | null;
  time_taken: number | null;
  completed_at: string | null;
  correct_answers: number | null;
  total_questions: number;
  is_completed: boolean;
  exams?: {
    title: string;
  };
}

interface ChartDataPoint {
  index: number;
  date: string;
  score: number;
  time: number;
  examTitle: string;
  correctAnswers: number;
  totalQuestions: number;
}

interface StatsSummary {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalTime: number;
  averageTime: number;
  excellentScores: number;
  goodScores: number;
  fairScores: number;
  poorScores: number;
  successRate: number;
  improvementTrend: number;
}

interface FilterOptions {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  scoreRange: {
    min: number;
    max: number;
  };
  examTitle: string;
  sortBy: 'date' | 'score' | 'time' | 'title';
  sortOrder: 'asc' | 'desc';
}

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-4">حدث خطأ في تحميل الإحصائيات</h3>
    <p className="text-gray-600 text-center mb-6 max-w-md">
      {error.message || 'حدث خطأ غير متوقع أثناء معالجة البيانات'}
    </p>
    <div className="flex gap-3">
      <Button onClick={resetErrorBoundary} className="bg-red-600 hover:bg-red-700">
        <RefreshCw className="w-4 h-4 mr-2" />
        إعادة المحاولة
      </Button>
      <Button variant="outline" onClick={() => window.location.reload()}>
        إعادة تحميل الصفحة
      </Button>
    </div>
  </div>
);

// Loading Component
const LoadingComponent = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Activity className="w-8 h-8 text-white" />
      </div>
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">جاري تحميل الإحصائيات المتقدمة...</p>
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-4 mx-auto">
        <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-pulse rounded-full" />
      </div>
    </div>
  </div>
);

// Custom hook for data validation
const useValidatedData = (data: AttemptData[] | undefined) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.filter((attempt): attempt is AttemptData => {
      return (
        attempt &&
        typeof attempt === 'object' &&
        typeof attempt.id === 'string' &&
        typeof attempt.is_completed === 'boolean' &&
        attempt.is_completed === true &&
        typeof attempt.total_questions === 'number' &&
        attempt.total_questions > 0 &&
        (attempt.score === null || (typeof attempt.score === 'number' && attempt.score >= 0 && attempt.score <= 100)) &&
        (attempt.time_taken === null || (typeof attempt.time_taken === 'number' && attempt.time_taken >= 0)) &&
        (attempt.completed_at === null || typeof attempt.completed_at === 'string') &&
        (attempt.correct_answers === null || (typeof attempt.correct_answers === 'number' && attempt.correct_answers >= 0))
      );
    });
  }, [data]);
};

// Custom hook for pagination
const usePagination = <T,>(data: T[], itemsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  return {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

export const EnhancedStatsView = () => {
  const { data: userAttempts, isLoading, error, refetch } = useUserAttempts();
  const validatedData = useValidatedData(userAttempts);
  
  // State management with proper initialization
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom' | 'all'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'time' | 'completion'>('score');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'scatter' | 'radar'>('line');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  
  // Filter state with proper initialization
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: null,
      end: null
    },
    scoreRange: {
      min: 0,
      max: 100
    },
    examTitle: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Refs for auto-refresh
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, refreshInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refetch]);
  
  // FIXED: Proper memoization with correct dependencies
  const filteredAttempts = useMemo(() => {
    if (!validatedData || validatedData.length === 0) {
      return [];
    }
    
    let filtered = [...validatedData];
    
    // Date range filter
    if (selectedPeriod !== 'all' && selectedPeriod !== 'custom') {
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
          startDate = subDays(now, 30);
      }
      
      filtered = filtered.filter(attempt => {
        if (!attempt.completed_at) return false;
        const attemptDate = parseISO(attempt.completed_at);
        return isValid(attemptDate) && isAfter(attemptDate, startDate);
      });
    }
    
    // Custom date range filter
    if (selectedPeriod === 'custom' && filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(attempt => {
        if (!attempt.completed_at) return false;
        const attemptDate = parseISO(attempt.completed_at);
        return isValid(attemptDate) && 
               isAfter(attemptDate, filters.dateRange.start!) && 
               isAfter(filters.dateRange.end!, attemptDate);
      });
    }
    
    // Score range filter
    filtered = filtered.filter(attempt => {
      const score = attempt.score ?? 0;
      return score >= filters.scoreRange.min && score <= filters.scoreRange.max;
    });
    
    // Exam title filter
    if (filters.examTitle.trim()) {
      const searchTerm = filters.examTitle.toLowerCase().trim();
      filtered = filtered.filter(attempt => 
        attempt.exams?.title?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(attempt => 
        attempt.exams?.title?.toLowerCase().includes(query)
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          const dateA = a.completed_at ? parseISO(a.completed_at) : new Date(0);
          const dateB = b.completed_at ? parseISO(b.completed_at) : new Date(0);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'score':
          comparison = (a.score ?? 0) - (b.score ?? 0);
          break;
        case 'time':
          comparison = (a.time_taken ?? 0) - (b.time_taken ?? 0);
          break;
        case 'title':
          comparison = (a.exams?.title ?? '').localeCompare(b.exams?.title ?? '', 'ar');
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [validatedData, selectedPeriod, filters, searchQuery]); // FIXED: Proper dependency array
  
  // FIXED: Statistics calculation with proper error handling
  const stats = useMemo((): StatsSummary => {
    if (!filteredAttempts || filteredAttempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalTime: 0,
        averageTime: 0,
        excellentScores: 0,
        goodScores: 0,
        fairScores: 0,
        poorScores: 0,
        successRate: 0,
        improvementTrend: 0
      };
    }
    
    try {
      const totalAttempts = filteredAttempts.length;
      const scores = filteredAttempts.map(attempt => attempt.score ?? 0);
      const times = filteredAttempts.map(attempt => attempt.time_taken ?? 0);
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
      const highestScore = Math.max(...scores);
      const lowestScore = Math.min(...scores);
      const totalTime = times.reduce((sum, time) => sum + time, 0);
      const averageTime = totalTime / totalAttempts / 60; // Convert to minutes
      
      // Performance categories
      const excellentScores = scores.filter(score => score >= 90).length;
      const goodScores = scores.filter(score => score >= 70 && score < 90).length;
      const fairScores = scores.filter(score => score >= 60 && score < 70).length;
      const poorScores = scores.filter(score => score < 60).length;
      
      // Success rate
      const successRate = (scores.filter(score => score >= 70).length / totalAttempts) * 100;
      
      // Improvement trend calculation
      const recentAttempts = filteredAttempts.slice(0, Math.min(5, totalAttempts));
      const olderAttempts = filteredAttempts.slice(5, Math.min(10, totalAttempts));
      
      const recentAverage = recentAttempts.length > 0 
        ? recentAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / recentAttempts.length 
        : 0;
      const olderAverage = olderAttempts.length > 0 
        ? olderAttempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) / olderAttempts.length 
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
    } catch (error) {
      console.error('Error calculating statistics:', error);
      throw new Error('فشل في حساب الإحصائيات');
    }
  }, [filteredAttempts]); // FIXED: Correct dependency
  
  // FIXED: Chart data preparation with error handling
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!filteredAttempts || filteredAttempts.length === 0) {
      return [];
    }
    
    try {
      return filteredAttempts
        .filter(attempt => attempt.completed_at) // Ensure completed_at exists
        .sort((a, b) => {
          const dateA = parseISO(a.completed_at!);
          const dateB = parseISO(b.completed_at!);
          return dateA.getTime() - dateB.getTime();
        })
        .map((attempt, index): ChartDataPoint => ({
          index: index + 1,
          date: attempt.completed_at ? format(parseISO(attempt.completed_at), 'dd/MM', { locale: ar }) : '',
          score: attempt.score ?? 0,
          time: Math.floor((attempt.time_taken ?? 0) / 60),
          examTitle: attempt.exams?.title ?? 'امتحان',
          correctAnswers: attempt.correct_answers ?? 0,
          totalQuestions: attempt.total_questions
        }));
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return [];
    }
  }, [filteredAttempts]); // FIXED: Correct dependency
  
  // Performance distribution data for pie chart
  const performanceData = useMemo(() => {
    return [
      { name: 'ممتاز (90%+)', value: stats.excellentScores, color: '#10b981' },
      { name: 'جيد (70-89%)', value: stats.goodScores, color: '#3b82f6' },
      { name: 'مقبول (60-69%)', value: stats.fairScores, color: '#f59e0b' },
      { name: 'ضعيف (<60%)', value: stats.poorScores, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [stats]);
  
  // Pagination
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev
  } = usePagination(filteredAttempts, itemsPerPage);
  
  // Export functionality
  const exportData = useCallback((format: 'csv' | 'json' | 'pdf') => {
    try {
      const exportableData = filteredAttempts.map(attempt => ({
        تاريخ_الامتحان: attempt.completed_at ? format(parseISO(attempt.completed_at), 'yyyy-MM-dd HH:mm', { locale: ar }) : '',
        اسم_الامتحان: attempt.exams?.title || 'امتحان',
        النتيجة: attempt.score,
        الإجابات_الصحيحة: attempt.correct_answers,
        إجمالي_الأسئلة: attempt.total_questions,
        الوقت_المستغرق_بالدقائق: Math.floor((attempt.time_taken || 0) / 60)
      }));

      if (exportableData.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm');

      if (format === 'csv') {
        const headers = Object.keys(exportableData[0]);
        const csvContent = [
          headers.join(','),
          ...exportableData.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `exam-statistics-${timestamp}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      } else if (format === 'json') {
        const jsonContent = JSON.stringify({
          metadata: {
            exportDate: new Date().toISOString(),
            totalRecords: exportableData.length,
            filters: filters,
            period: selectedPeriod
          },
          statistics: stats,
          data: exportableData
        }, null, 2);
        
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `exam-statistics-${timestamp}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Export failed:', error);
      // You could show a toast notification here
    }
  }, [filteredAttempts, filters, selectedPeriod, stats]);
  
  // Filter handlers
  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: { start: null, end: null },
      scoreRange: { min: 0, max: 100 },
      examTitle: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setSelectedPeriod('month');
  }, []);
  
  // Error handling
  if (error) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <ErrorFallback error={error as Error} resetErrorBoundary={() => window.location.reload()} />
      </ErrorBoundary>
    );
  }
  
  // Loading state
  if (isLoading) {
    return <LoadingComponent />;
  }
  
  // No data state
  if (!validatedData || validatedData.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">لا توجد بيانات إحصائية</h3>
          <p className="text-gray-600 mb-6">
            أكمل بعض الامتحانات لرؤية الإحصائيات والتحليلات المفصلة
          </p>
          <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700">
            <BookOpen className="w-4 h-4 mr-2" />
            ابدأ امتحاناً جديداً
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={resetFilters}>
      <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`} dir="rtl">
        {/* Enhanced Controls */}
        <MobileCard>
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">إعدادات العرض المتقدمة</h3>
                <Badge variant="outline" className="text-xs">
                  {filteredAttempts.length} نتيجة
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={autoRefresh ? 'bg-emerald-50 text-emerald-700' : ''}
                >
                  <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                </Button>
                
                <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">
                      <Grid className="w-4 h-4 mr-2" />
                      شبكة
                    </SelectItem>
                    <SelectItem value="list">
                      <List className="w-4 h-4 mr-2" />
                      قائمة
                    </SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                  <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
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
                  <SelectItem value="scatter">نقطي</SelectItem>
                  <SelectItem value="radar">رادار</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(value: any) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">التاريخ</SelectItem>
                  <SelectItem value="score">النتيجة</SelectItem>
                  <SelectItem value="time">الوقت</SelectItem>
                  <SelectItem value="title">العنوان</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                  <DatePicker
                    selected={filters.dateRange.start}
                    onChange={(date) => handleFilterChange('dateRange', { ...filters.dateRange, start: date })}
                    placeholderText="اختر التاريخ"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                  <DatePicker
                    selected={filters.dateRange.end}
                    onChange={(date) => handleFilterChange('dateRange', { ...filters.dateRange, end: date })}
                    placeholderText="اختر التاريخ"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Export and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => exportData('csv')}>
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportData('json')}>
                  <FileText className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  إعادة تعيين
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>عرض</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>عنصر</span>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              icon: Trophy, 
              label: 'المعدل العام', 
              value: `${stats.averageScore.toFixed(1)}%`, 
              color: 'emerald',
              trend: stats.improvementTrend,
              description: 'متوسط جميع النتائج'
            },
            { 
              icon: Target, 
              label: 'امتحان مكتمل', 
              value: stats.totalAttempts.toString(), 
              color: 'blue',
              description: `في ${selectedPeriod === 'all' ? 'جميع الفترات' : 'الفترة المحددة'}`
            },
            { 
              icon: Clock, 
              label: 'متوسط الوقت', 
              value: `${Math.round(stats.averageTime)} د`, 
              color: 'purple',
              description: 'الوقت المستغرق للامتحان'
            },
            { 
              icon: Award, 
              label: 'معدل النجاح', 
              value: `${stats.successRate.toFixed(1)}%`, 
              color: 'green',
              description: '70% أو أكثر'
            }
          ].map((metric, index) => {
            const Icon = metric.icon;
            const colorClasses = {
              emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 text-emerald-600',
              blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600',
              purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-600',
              green: 'from-green-500 to-green-600 bg-green-50 text-green-600'
            };

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <MobileCard className="h-full">
                  <div className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[metric.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[metric.color as keyof typeof colorClasses].split(' ')[1]} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                    {metric.trend !== undefined && metric.trend !== 0 && (
                      <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${
                        metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(metric.trend).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </MobileCard>
              </motion.div>
            );
          })}
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white shadow-md rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              الاتجاهات
            </TabsTrigger>
            <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Trophy className="w-4 h-4 mr-2" />
              الأداء
            </TabsTrigger>
            <TabsTrigger value="detailed" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Eye className="w-4 h-4 mr-2" />
              تفصيلي
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
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
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </MobileCard>
              </motion.div>
            </AnimatePresence>
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
                      
                      {chartType === 'scatter' && (
                        <ScatterChart data={chartData}>
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
                          <Scatter dataKey={selectedMetric} fill="#10b981" />
                        </ScatterChart>
                      )}
                      
                      {chartType === 'radar' && (
                        <RadarChart data={chartData.slice(0, 6)}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="examTitle" />
                          <PolarRadiusAxis />
                          <Radar
                            name={selectedMetric === 'score' ? 'النتيجة' : selectedMetric === 'time' ? 'الوقت' : 'الإكمال'}
                            dataKey={selectedMetric}
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.3}
                          />
                          <Tooltip />
                        </RadarChart>
                      )}
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </MobileCard>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <MobileCard>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  تحليل الأداء التفصيلي
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <motion.div 
                      className="p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-emerald-600" />
                        <span className="font-bold text-emerald-800">أعلى نتيجة</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">{stats.highestScore}%</div>
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <span className="font-bold text-blue-800">المعدل العام</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{stats.averageScore.toFixed(1)}%</div>
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                        <span className="font-bold text-orange-800">أقل نتيجة</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-700">{stats.lowestScore}%</div>
                    </motion.div>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div 
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <span className="font-bold text-green-800">معدل النجاح</span>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{stats.successRate.toFixed(1)}%</div>
                      <Progress value={stats.successRate} className="mt-2" />
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-6 h-6 text-purple-600" />
                        <span className="font-bold text-purple-800">متوسط الوقت</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-700">{Math.round(stats.averageTime)} دقيقة</div>
                    </motion.div>
                    
                    <motion.div 
                      className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-6 h-6 text-yellow-600" />
                        <span className="font-bold text-yellow-800">نتائج ممتازة</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-700">{stats.excellentScores}</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </MobileCard>
          </TabsContent>

          {/* Detailed Tab with Pagination */}
          <TabsContent value="detailed" className="space-y-6">
            <MobileCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Eye className="w-6 h-6 text-gray-600" />
                    تفاصيل الامتحانات
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>صفحة {currentPage} من {totalPages}</span>
                  </div>
                </div>
                
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                  {paginatedData.map((attempt, index) => (
                    <motion.div
                      key={attempt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                        viewMode === 'list' ? 'flex-row' : 'flex-col'
                      }`}
                    >
                      <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : 'w-full mb-3'}`}>
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{attempt.exams?.title || 'امتحان'}</div>
                          <div className="text-sm text-gray-600">
                            {attempt.completed_at && format(parseISO(attempt.completed_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right ${viewMode === 'list' ? '' : 'w-full'}`}>
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
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevPage}
                      disabled={!hasPrev}
                    >
                      <ChevronRight className="w-4 h-4 mr-1" />
                      السابق
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-500">...</span>
                          <Button
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(totalPages)}
                            className="w-8 h-8 p-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextPage}
                      disabled={!hasNext}
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </MobileCard>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};