import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserAttempts } from '@/hooks/useUserAttempts';
import { MobileCard } from '@/components/ui/mobile-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  User, 
  Trophy, 
  Calendar, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  Edit3,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Star,
  TrendingUp,
  CheckCircle,
  Zap,
  Settings,
  Shield,
  Bell,
  BookOpen,
  Download,
  Trash2,
  Camera,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Crown,
  Flame,
  Rocket,
  Heart,
  Gift,
  Sparkles,
  Medal,
  Gem
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ProfileView = () => {
  const { data: userAttempts, isLoading } = useUserAttempts();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: 'اكرم محرز',
    email: 'akram21@gmail.com',
    phone: '+213 555 123 456',
    location: 'الجزائر العاصمة',
    bio: 'مترشح متحمس لمنصب مكلف بالزبائن في بريد الجزائر',
    joinDate: '2024-06-15'
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    examReminders: true,
    weeklyReports: false,
    darkMode: false,
    language: 'ar'
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <User className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
        </motion.div>
        <p className="text-gray-600">جاري تحميل الملف الشخصي...</p>
      </div>
    );
  }

  const completedAttempts = userAttempts?.filter(attempt => attempt.is_completed) || [];
  const totalAttempts = userAttempts?.length || 0;
  const averageScore = completedAttempts.length > 0 
    ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length 
    : 0;
  const highestScore = completedAttempts.length > 0 
    ? Math.max(...completedAttempts.map(attempt => attempt.score || 0))
    : 0;
  const totalTime = completedAttempts.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0);
  
  // Calculate achievements
  const excellentScores = completedAttempts.filter(a => (a.score || 0) >= 90).length;
  const consecutiveScores = completedAttempts.slice(0, 3).every(a => (a.score || 0) >= 70);
  const fastCompletions = completedAttempts.filter(a => (a.time_taken || 3600) < 2400).length;
  const perfectScores = completedAttempts.filter(a => (a.score || 0) === 100).length;
  
  // Performance level calculation
  const getPerformanceLevel = (score: number) => {
    if (score >= 95) return { 
      label: "أسطورة", 
      color: "text-purple-600", 
      bgColor: "bg-purple-100", 
      progress: 100,
      icon: Crown,
      gradient: "from-purple-500 to-pink-600"
    };
    if (score >= 90) return { 
      label: "خبير", 
      color: "text-emerald-600", 
      bgColor: "bg-emerald-100", 
      progress: 90,
      icon: Award,
      gradient: "from-emerald-500 to-teal-600"
    };
    if (score >= 80) return { 
      label: "متقدم", 
      color: "text-blue-600", 
      bgColor: "bg-blue-100", 
      progress: 80,
      icon: Trophy,
      gradient: "from-blue-500 to-cyan-600"
    };
    if (score >= 70) return { 
      label: "متوسط", 
      color: "text-green-600", 
      bgColor: "bg-green-100", 
      progress: 60,
      icon: Target,
      gradient: "from-green-500 to-emerald-600"
    };
    if (score >= 60) return { 
      label: "مبتدئ", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100", 
      progress: 40,
      icon: Star,
      gradient: "from-yellow-500 to-orange-600"
    };
    return { 
      label: "جديد", 
      color: "text-gray-600", 
      bgColor: "bg-gray-100", 
      progress: 20,
      icon: BookOpen,
      gradient: "from-gray-500 to-slate-600"
    };
  };

  const currentLevel = getPerformanceLevel(averageScore);
  const CurrentLevelIcon = currentLevel.icon;

  // Calculate rank
  const calculateRank = () => {
    if (averageScore >= 95) return { rank: "الأول", emoji: "👑" };
    if (averageScore >= 90) return { rank: "الثاني", emoji: "🥈" };
    if (averageScore >= 85) return { rank: "الثالث", emoji: "🥉" };
    if (averageScore >= 80) return { rank: "المتميز", emoji: "⭐" };
    if (averageScore >= 70) return { rank: "المجتهد", emoji: "📚" };
    return { rank: "المبتدئ", emoji: "🌱" };
  };

  const currentRank = calculateRank();

  // Achievements data
  const achievements = [
    {
      id: 'excellent',
      title: 'النجم المتألق',
      description: `حصلت على ${excellentScores} نتيجة ممتازة (90%+)`,
      icon: Star,
      color: 'emerald',
      unlocked: excellentScores >= 1,
      progress: Math.min((excellentScores / 5) * 100, 100),
      requirement: 'احصل على 5 نتائج ممتازة'
    },
    {
      id: 'persistent',
      title: 'المثابر',
      description: `أكملت ${completedAttempts.length} امتحان`,
      icon: Flame,
      color: 'orange',
      unlocked: completedAttempts.length >= 5,
      progress: Math.min((completedAttempts.length / 10) * 100, 100),
      requirement: 'أكمل 10 امتحانات'
    },
    {
      id: 'consistent',
      title: 'الثابت',
      description: 'حافظت على نتائج جيدة متتالية',
      icon: TrendingUp,
      color: 'blue',
      unlocked: consecutiveScores,
      progress: consecutiveScores ? 100 : 0,
      requirement: 'احصل على 3 نتائج جيدة متتالية (70%+)'
    },
    {
      id: 'speedy',
      title: 'السريع',
      description: `أنهيت ${fastCompletions} امتحانات بسرعة`,
      icon: Zap,
      color: 'yellow',
      unlocked: fastCompletions >= 3,
      progress: Math.min((fastCompletions / 5) * 100, 100),
      requirement: 'أنه 5 امتحانات في أقل من 40 دقيقة'
    },
    {
      id: 'perfect',
      title: 'الكمال',
      description: `حصلت على ${perfectScores} درجة كاملة`,
      icon: Crown,
      color: 'purple',
      unlocked: perfectScores >= 1,
      progress: Math.min((perfectScores / 3) * 100, 100),
      requirement: 'احصل على 3 درجات كاملة (100%)'
    },
    {
      id: 'dedicated',
      title: 'المتفاني',
      description: 'قضيت أكثر من 10 ساعات في التدريب',
      icon: Heart,
      color: 'pink',
      unlocked: totalTime >= 36000, // 10 hours in seconds
      progress: Math.min((totalTime / 72000) * 100, 100), // 20 hours target
      requirement: 'اقض 20 ساعة في التدريب'
    }
  ];

  // Handle profile update
  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء حفظ التغييرات",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح",
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordDialog(false);
    } catch (error) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle data export
  const handleDataExport = () => {
    const exportData = {
      profile: profileData,
      attempts: completedAttempts,
      achievements: achievements.filter(a => a.unlocked),
      statistics: {
        totalAttempts: completedAttempts.length,
        averageScore,
        highestScore,
        totalTime: Math.floor(totalTime / 60) // in minutes
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "تم تصدير البيانات",
      description: "تم تحميل ملف البيانات بنجاح",
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-6 space-y-6" dir="rtl">
      {/* Enhanced Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <MobileCard>
          <div className="p-6 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600" />
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <motion.div 
                className="relative mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${currentLevel.gradient} rounded-full flex items-center justify-center mx-auto shadow-xl`}>
                  <User className="w-12 h-12 text-white" />
                </div>
                
                {/* Level Badge */}
                <motion.div 
                  className={`absolute -bottom-2 -right-2 w-10 h-10 ${currentLevel.bgColor} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                >
                  <CurrentLevelIcon className={`w-5 h-5 ${currentLevel.color}`} />
                </motion.div>

                {/* Camera Button */}
                <motion.button
                  className="absolute -bottom-1 -left-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-4 h-4" />
                </motion.button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData.fullName}</h2>
                <p className="text-gray-600 mb-3">{profileData.bio}</p>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <Badge 
                    className={`${currentLevel.bgColor} ${currentLevel.color} text-lg px-4 py-2 mb-4 shadow-md`}
                  >
                    <CurrentLevelIcon className="w-4 h-4 mr-2" />
                    {currentLevel.label}
                  </Badge>
                </motion.div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>انضم في {format(new Date(profileData.joinDate), 'MMMM yyyy', { locale: ar })}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </MobileCard>
      </motion.div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-white shadow-md rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <User className="w-4 h-4 mr-2" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-purple-500 data-[state=active]:text-white">
            <Trophy className="w-4 h-4 mr-2" />
            الإنجازات
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            الإعدادات
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
              {/* Performance Summary */}
              <MobileCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                    ملخص الأداء
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div 
                      className="text-center p-4 bg-emerald-50 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Trophy className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-emerald-600">{averageScore.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">المعدل العام</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center p-4 bg-blue-50 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{completedAttempts.length}</div>
                      <div className="text-sm text-gray-600">امتحان مكتمل</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center p-4 bg-yellow-50 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">{highestScore}%</div>
                      <div className="text-sm text-gray-600">أعلى نتيجة</div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center p-4 bg-purple-50 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor(totalTime / 60)} د
                      </div>
                      <div className="text-sm text-gray-600">إجمالي الوقت</div>
                    </motion.div>
                  </div>

                  {/* Progress to next level */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">التقدم للمستوى التالي</span>
                      <span className="text-sm text-gray-600">{currentLevel.progress}%</span>
                    </div>
                    <Progress value={currentLevel.progress} className="h-3" />
                  </div>

                  {/* Current Rank */}
                  <motion.div 
                    className="text-center p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border-2 border-emerald-200"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-6 h-6 text-emerald-600" />
                      <span className="text-lg font-bold text-gray-900">ترتيبك الحالي</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                      <span>{currentRank.emoji}</span>
                      {currentRank.rank}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      بناءً على أدائك في الامتحانات
                    </p>
                  </motion.div>
                </div>
              </MobileCard>

              {/* Recent Activity */}
              {completedAttempts.length > 0 && (
                <MobileCard>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-blue-600" />
                      النشاط الأخير
                    </h3>
                    
                    <div className="space-y-3">
                      {completedAttempts.slice(0, 5).map((attempt, index) => (
                        <motion.div 
                          key={attempt.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
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
                          <Badge 
                            variant={(attempt.score || 0) >= 70 ? "secondary" : "destructive"}
                          >
                            {attempt.score}%
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </MobileCard>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MobileCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <User className="w-6 h-6 text-gray-600" />
                      المعلومات الشخصية
                    </h3>
                    <Button 
                      variant={isEditing ? "default" : "outline"} 
                      size="sm"
                      onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Save className="w-4 h-4 mr-2" />
                        </motion.div>
                      ) : isEditing ? (
                        <Save className="w-4 h-4 mr-2" />
                      ) : (
                        <Edit3 className="w-4 h-4 mr-2" />
                      )}
                      {isEditing ? 'حفظ' : 'تعديل'}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-right block mb-2">الاسم الكامل</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="pr-10 text-right"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-right block mb-2">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="pr-10 text-right"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-right block mb-2">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="pr-10 text-right"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="location" className="text-right block mb-2">الموقع</Label>
                      <div className="relative">
                        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          className="pr-10 text-right"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-right block mb-2">نبذة شخصية</Label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full p-3 border border-gray-200 rounded-lg text-right resize-none"
                        rows={3}
                        disabled={!isEditing}
                        placeholder="اكتب نبذة مختصرة عن نفسك..."
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <motion.div 
                      className="flex gap-3 mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button 
                        onClick={handleProfileUpdate}
                        disabled={isUpdating}
                        className="flex-1"
                      >
                        {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </motion.div>
                  )}
                </div>
              </MobileCard>

              {/* Password Change Section */}
              <MobileCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    الأمان
                  </h3>
                  
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Lock className="w-4 h-4 mr-2" />
                        تغيير كلمة المرور
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                      <DialogHeader>
                        <DialogTitle>تغيير كلمة المرور</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                          <div className="relative">
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="pr-10 pl-10 text-right"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="text-right"
                          />
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="text-right"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={handlePasswordChange}
                            disabled={isUpdating}
                            className="flex-1"
                          >
                            {isUpdating ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowPasswordDialog(false)}
                            className="flex-1"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </MobileCard>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MobileCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                    الإنجازات المحققة
                    <Badge variant="secondary" className="mr-2">
                      {achievements.filter(a => a.unlocked).length}/{achievements.length}
                    </Badge>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      const colorClasses = {
                        emerald: 'from-emerald-500 to-green-600 border-emerald-200 bg-emerald-50',
                        blue: 'from-blue-500 to-cyan-600 border-blue-200 bg-blue-50',
                        purple: 'from-purple-500 to-pink-600 border-purple-200 bg-purple-50',
                        yellow: 'from-yellow-500 to-orange-600 border-yellow-200 bg-yellow-50',
                        orange: 'from-orange-500 to-red-600 border-orange-200 bg-orange-50',
                        pink: 'from-pink-500 to-rose-600 border-pink-200 bg-pink-50'
                      };

                      return (
                        <motion.div
                          key={achievement.id}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                            achievement.unlocked 
                              ? colorClasses[achievement.color as keyof typeof colorClasses]
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                        >
                          {/* Achievement Icon */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              achievement.unlocked 
                                ? `bg-gradient-to-br ${colorClasses[achievement.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[achievement.color as keyof typeof colorClasses].split(' ')[1]} shadow-lg`
                                : 'bg-gray-200'
                            }`}>
                              <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-bold text-lg ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                                {achievement.title}
                              </h4>
                              <p className={`text-sm ${achievement.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                                {achievement.description}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className={achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}>
                                {achievement.requirement}
                              </span>
                              <span className={achievement.unlocked ? 'text-gray-800 font-semibold' : 'text-gray-400'}>
                                {Math.round(achievement.progress)}%
                              </span>
                            </div>
                            <Progress 
                              value={achievement.progress} 
                              className={`h-2 ${achievement.unlocked ? '' : 'opacity-50'}`}
                            />
                          </div>

                          {/* Unlock Badge */}
                          {achievement.unlocked && (
                            <motion.div
                              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
                            >
                              <CheckCircle className="w-5 h-5 text-yellow-800" />
                            </motion.div>
                          )}

                          {/* Sparkle Effect for Unlocked Achievements */}
                          {achievement.unlocked && (
                            <motion.div
                              className="absolute inset-0 pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                              <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-400" />
                              <Sparkles className="absolute bottom-2 left-2 w-3 h-3 text-yellow-300" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Achievement Summary */}
                  <motion.div 
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Medal className="w-6 h-6 text-yellow-600" />
                      <span className="font-bold text-yellow-800 text-lg">ملخص الإنجازات</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {achievements.filter(a => a.unlocked).length}
                        </div>
                        <div className="text-sm text-yellow-600">إنجازات محققة</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {Math.round(achievements.reduce((sum, a) => sum + a.progress, 0) / achievements.length)}%
                        </div>
                        <div className="text-sm text-yellow-600">التقدم الإجمالي</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </MobileCard>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Notifications Settings */}
              <MobileCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-600" />
                    إعدادات الإشعارات
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">إشعارات البريد الإلكتروني</div>
                        <div className="text-sm text-gray-600">تلقي إشعارات عبر البريد الإلكتروني</div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">الإشعارات الفورية</div>
                        <div className="text-sm text-gray-600">إشعارات فورية في المتصفح</div>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">تذكير الامتحانات</div>
                        <div className="text-sm text-gray-600">تذكير بالامتحانات الجديدة</div>
                      </div>
                      <Switch
                        checked={settings.examReminders}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, examReminders: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">التقارير الأسبوعية</div>
                        <div className="text-sm text-gray-600">تقرير أسبوعي عن التقدم</div>
                      </div>
                      <Switch
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </MobileCard>

              {/* Data Management */}
              <MobileCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Download className="w-6 h-6 text-green-600" />
                    إدارة البيانات
                  </h3>
                  
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleDataExport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      تصدير بياناتي
                    </Button>
                    
                    <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium mb-1">ما يتم تصديره:</div>
                      <ul className="list-disc list-inside space-y-1">
                        <li>المعلومات الشخصية</li>
                        <li>نتائج الامتحانات</li>
                        <li>الإنجازات المحققة</li>
                        <li>الإحصائيات العامة</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </MobileCard>

              {/* Danger Zone */}
              <MobileCard>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                    منطقة خطرة
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800 mb-2">حذف الحساب نهائياً</div>
                      <div className="text-sm text-red-600 mb-3">
                        سيتم حذف جميع بياناتك نهائياً ولا يمكن استرجاعها
                      </div>
                      
                      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            حذف الحساب
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">
                              هل أنت متأكد من حذف الحساب؟
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً:
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>المعلومات الشخصية</li>
                                <li>جميع نتائج الامتحانات</li>
                                <li>الإنجازات والشارات</li>
                                <li>الإعدادات والتفضيلات</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => {
                                toast({
                                  title: "تم إلغاء العملية",
                                  description: "لم يتم حذف الحساب",
                                });
                                setShowDeleteDialog(false);
                              }}
                            >
                              نعم، احذف الحساب
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </MobileCard>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};