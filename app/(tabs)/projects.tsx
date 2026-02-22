import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors from "@/constants/colors";
import { useProjects } from "@/contexts/ProjectContext";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarScreen() {
  const { projects } = useProjects();
  const { theme, isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 24));
  const [refreshing, setRefreshing] = useState(false);

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: theme.background },
    title: { color: theme.navy },
    calendarCard: { backgroundColor: theme.surface },
    monthYear: { color: theme.navy },
    dayOfWeekText: { color: theme.navy },
    dayText: { color: theme.navy },
    dayTextOther: { color: theme.textTertiary },
    dayCellSelected: { backgroundColor: theme.navy },
    dayTextSelected: { color: theme.white },
    dot: { backgroundColor: theme.navy },
    dotOther: { backgroundColor: theme.textTertiary },
    dotSelected: { backgroundColor: theme.white },
    selectedDateCard: { backgroundColor: theme.surface },
    selectedDateTitle: { color: theme.navy },
    selectedDateSubtitle: { color: theme.textSecondary },
    noProjectsText: { color: theme.navy },
    overviewCard: { backgroundColor: theme.surface },
    overviewTitle: { color: theme.navy },
    statNumber: { color: theme.navy },
    statLabel: { color: theme.textSecondary },
  }), [theme]);

  const scheduledDates = useMemo(() => {
    const dates = new Set<string>();
    projects.forEach((project) => {
      if (project.startDate) {
        dates.add(new Date(project.startDate).toDateString());
      }
      if (project.estimatedEndDate) {
        dates.add(new Date(project.estimatedEndDate).toDateString());
      }
    });
    dates.add(new Date(2026, 0, 15).toDateString());
    dates.add(new Date(2026, 0, 20).toDateString());
    dates.add(new Date(2026, 0, 28).toDateString());
    return dates;
  }, [projects]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: { date: number; isCurrentMonth: boolean; fullDate: Date; hasEvent: boolean }[] = [];
    
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      const fullDate = new Date(year, month - 1, date);
      days.push({
        date,
        isCurrentMonth: false,
        fullDate,
        hasEvent: scheduledDates.has(fullDate.toDateString()),
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = new Date(year, month, i);
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate,
        hasEvent: scheduledDates.has(fullDate.toDateString()),
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const fullDate = new Date(year, month + 1, i);
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate,
        hasEvent: scheduledDates.has(fullDate.toDateString()),
      });
    }
    
    return days;
  }, [currentDate, scheduledDates]);

  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [currentDate]);

  const selectedDateFormatted = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const completedProjects = projects.filter(p => p.status === "completed").length;
  const upcomingProjects = projects.filter(p => p.status === "planning").length;
  const overdueProjects = projects.filter(p => p.status === "in_progress").length;

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, dynamicStyles.container]}>
        <View style={styles.header}>
          <Text style={[styles.title, dynamicStyles.title]}>Calendar</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <View style={[styles.calendarCard, dynamicStyles.calendarCard]}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <ChevronLeft size={24} color={theme.navy} />
            </TouchableOpacity>
            <Text style={[styles.monthYear, dynamicStyles.monthYear]}>{monthYear}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <ChevronRight size={24} color={theme.navy} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysOfWeek}>
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} style={styles.dayOfWeekCell}>
                <Text style={[styles.dayOfWeekText, dynamicStyles.dayOfWeekText]}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isSelected(day.fullDate) && dynamicStyles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(day.fullDate)}
              >
                <Text
                  style={[
                    styles.dayText,
                    dynamicStyles.dayText,
                    !day.isCurrentMonth && dynamicStyles.dayTextOther,
                    isSelected(day.fullDate) && dynamicStyles.dayTextSelected,
                  ]}
                >
                  {day.date}
                </Text>
                {day.hasEvent && (
                  <View style={styles.dotsContainer}>
                    <View style={[styles.dot, dynamicStyles.dot, !day.isCurrentMonth && dynamicStyles.dotOther, isSelected(day.fullDate) && dynamicStyles.dotSelected]} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.selectedDateCard, dynamicStyles.selectedDateCard]}>
          <Text style={[styles.selectedDateTitle, dynamicStyles.selectedDateTitle]}>{selectedDateFormatted}</Text>
          <Text style={[styles.selectedDateSubtitle, dynamicStyles.selectedDateSubtitle]}>
            Showing projects with todays completion date
          </Text>
          <Text style={[styles.noProjectsText, dynamicStyles.noProjectsText]}>No projects, check back later</Text>
        </View>

        <View style={[styles.overviewCard, dynamicStyles.overviewCard]}>
          <Text style={[styles.overviewTitle, dynamicStyles.overviewTitle]}>Monthly Projects Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, isDark ? { backgroundColor: '#3D3D00' } : styles.statCardTotal]}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{projects.length}</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Total Projects</Text>
            </View>
            <View style={[styles.statCard, isDark ? { backgroundColor: '#1A4D1A' } : styles.statCardCompleted]}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{completedProjects}</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Completed</Text>
            </View>
            <View style={[styles.statCard, isDark ? { backgroundColor: '#4D4D00' } : styles.statCardUpcoming]}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{upcomingProjects}</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Upcoming</Text>
            </View>
            <View style={[styles.statCard, isDark ? { backgroundColor: '#4D1A1A' } : styles.statCardOverdue]}>
              <Text style={[styles.statNumber, dynamicStyles.statNumber]}>{overdueProjects}</Text>
              <Text style={[styles.statLabel, dynamicStyles.statLabel]}>Overdue</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  calendarCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.navy,
  },
  daysOfWeek: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  dayOfWeekText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.navy,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayCellSelected: {
    backgroundColor: Colors.navy,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.navy,
    marginBottom: 4,
  },
  dayTextOther: {
    color: Colors.textTertiary,
  },
  dayTextSelected: {
    color: Colors.white,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.navy,
  },
  dotOther: {
    backgroundColor: Colors.textTertiary,
  },
  dotSelected: {
    backgroundColor: Colors.white,
  },
  selectedDateCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.navy,
    marginBottom: 4,
  },
  selectedDateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  noProjectsText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.navy,
    textAlign: "center",
    marginTop: 8,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.navy,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  statCardTotal: {
    backgroundColor: "#FDF6E3",
  },
  statCardCompleted: {
    backgroundColor: "#E8F5E9",
  },
  statCardUpcoming: {
    backgroundColor: "#FFF8E1",
  },
  statCardOverdue: {
    backgroundColor: "#FFEBEE",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
});
