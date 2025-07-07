import { useState } from "react"; 
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { StatsOverview } from "@/components/StatsOverview";
import { ExamCard } from "@/components/ExamCard";
import { StudyTips } from "@/components/StudyTips";
import { EnhancedHomeView } from "@/components/EnhancedHomeView";
import { EnhancedStatsView } from "@/components/EnhancedStatsView";
import { ProfileView } from "@/components/ProfileView";
import { StatsDetailedView } from "@/components/StatsDetailedView";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { MobileHeader } from "@/components/ui/mobile-header";
import { MobileCard } from "@/components/ui/mobile-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { DesktopNavigation } from "@/components/ui/desktop-navigation";
import {
  GraduationCap,
  LogOut,
  BookMarked,
  Home,
  BarChart3,
  User,
  Plus,
  Loader2
} from "lucide-react";
import ExamModal from "@/components/ExamModal";
import { useExams } from "@/hooks/useExams";
import { useAllExams } from "@/hooks/useAllExams";
import { useAllExamStatuses } from "@/hooks/useExamStatus";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'exams' | 'profile'>('home');
  const navigate = useNavigate();

  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: allExams, isLoading: allExamsLoading } = useAllExams();
  const { data: allStatuses, isLoading: statusesLoading } = useAllExamStatuses();

  const bottomNavItems = [
    { icon: Home, label: 'الرئيسية', active: activeTab === 'home', onClick: () => setActiveTab('home') },
    { icon: BarChart3, label: 'الإحصائيات', active: activeTab === 'stats', onClick: () => setActiveTab('stats') },
    { icon: BookMarked, label: 'الامتحانات', active: activeTab === 'exams', onClick: () => setActiveTab('exams') },
    { icon: User, label: 'الملف الشخصي', active: activeTab === 'profile', onClick: () => setActiveTab('profile') },
    { icon: LogOut, label: 'خروج', onClick: onLogout }
  ];

  if (examsLoading || allExamsLoading || statusesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center px-4" dir="rtl">
        <div className="flex flex-col items-center gap-4 p-4 w-full max-w-sm mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center animate-pulse-scale">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-lg text-gray-700 font-medium text-center">جاري تحميل البيانات...</span>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-blue-500 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const getExamStatus = (examId: string) => allStatuses?.get(examId);

  const completedAttempts = Array.from(allStatuses?.values() || []).filter(attempt => attempt?.is_completed);
  const averageScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length
    : 0;

  const totalQuestions = exams?.reduce((sum, exam) => sum + exam.total_questions, 0) || 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <EnhancedHomeView
            exams={exams || []}
            examStatuses={allStatuses || new Map()}
            onStartExam={setSelectedExam}
            completedAttempts={completedAttempts}
            averageScore={averageScore}
            totalQuestions={totalQuestions}
          />
        );
      case 'stats':
        return (
          <EnhancedStatsView />
        );
      case 'exams':
        return (
          <div className="px-4 md:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {exams?.map((exam) => (
                <ExamCard
                  key={exam.id}
                  exam={exam}
                  examStatus={getExamStatus(exam.id)}
                  onStartExam={setSelectedExam}
                />
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="px-4 md:px-0">
            <ProfileView />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-emerald-50 via-white to-blue-50" dir="rtl">
      <div className="md:hidden">
        <MobileHeader
          title="لوحة التحكم"
          subtitle="منصة التحضير لامتحان بريد الجزائر"
          rightAction={
            <div className="hidden md:flex">
              <AnimatedButton
                variant="outline"
                onClick={onLogout}
                icon={LogOut}
                iconPosition="right"
                size="sm"
              >
                تسجيل الخروج
              </AnimatedButton>
            </div>
          }
        />
      </div>

      <div className="hidden md:block">
        <DesktopNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={onLogout}
        />
      </div>

      <main className="pb-24 md:pb-8">
        <div className="container mx-auto py-6 px-2 sm:px-4">
          {renderContent()}
        </div>
      </main>

      <div className="md:hidden">
        <BottomNavigation items={bottomNavItems} />
      </div>

      {activeTab === 'exams' && (
        <div className="md:hidden">
          <FloatingActionButton
            icon={Plus}
            onClick={() => {
              if (exams && exams.length > 0) {
                setSelectedExam(exams[0].id);
              }
            }}
            label="بدء امتحان سريع"
            position="bottom-right"
          />
        </div>
      )}

      {selectedExam && (
        <ExamModal
          examId={selectedExam}
          isOpen={true}
          onClose={() => setSelectedExam(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
