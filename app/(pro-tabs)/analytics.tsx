import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  MapPin,
  Zap,
  Trophy,
  Star,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Droplets,
  Wrench,
  Home,
  Briefcase,
  Repeat,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useService } from '@/contexts/ServiceContext';
import { Professional, ProfessionalType } from '@/types';

const { width } = Dimensions.get('window');

interface StatData {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

interface DealSource {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

interface MarketInsight {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

interface Goal {
  title: string;
  current: number;
  target: number;
  unit: string;
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  color: string;
}

const getPeriodMultiplier = (period: 'week' | 'month' | 'quarter' | 'year') => {
  switch (period) {
    case 'week': return { value: 0.25, change: 0.5 };
    case 'month': return { value: 1, change: 1 };
    case 'quarter': return { value: 3, change: 1.5 };
    case 'year': return { value: 12, change: 2 };
  }
};

const getStatsForType = (professionalType: ProfessionalType | undefined, serviceColor: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): StatData[] => {
  const multiplier = getPeriodMultiplier(period);
  switch (professionalType) {
    case 'realtor':
      return [
        { label: 'Total Leads', value: String(Math.round(147 * multiplier.value)), change: 12.5 * multiplier.change, icon: <Users size={20} color={serviceColor} /> },
        { label: 'Conversions', value: String(Math.round(34 * multiplier.value)), change: 8.3 * multiplier.change, icon: <TrendingUp size={20} color={Colors.success} /> },
        { label: 'Closings', value: String(Math.round(18 * multiplier.value)), change: -2.1 * multiplier.change, icon: <Target size={20} color={Colors.accent} /> },
        { label: 'Total Volume', value: `${(4.2 * multiplier.value).toFixed(1)}M`, change: 15.7 * multiplier.change, icon: <DollarSign size={20} color="#272D53" /> },
      ];
    case 'landscaper':
      return [
        { label: 'Total Projects', value: String(Math.round(47 * multiplier.value)), change: 15.2 * multiplier.change, icon: <Leaf size={20} color={serviceColor} /> },
        { label: 'Repeat Clients', value: String(Math.round(18 * multiplier.value)), change: 22.5 * multiplier.change, icon: <Repeat size={20} color={Colors.primary} /> },
        { label: 'Revenue', value: `${(42.5 * multiplier.value).toFixed(1)}K`, change: 18.3 * multiplier.change, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Avg Rating', value: '4.8', change: 2.1 * multiplier.change, icon: <Star size={20} color={Colors.accent} /> },
      ];
    case 'contractor':
      return [
        { label: 'Active Jobs', value: String(Math.round(8 * multiplier.value)), change: 14.3 * multiplier.change, icon: <Wrench size={20} color={serviceColor} /> },
        { label: 'Completed', value: String(Math.round(52 * multiplier.value)), change: 18.2 * multiplier.change, icon: <Target size={20} color={Colors.success} /> },
        { label: 'Revenue', value: `${Math.round(125 * multiplier.value)}K`, change: 22.1 * multiplier.change, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Win Rate', value: '68%', change: 5.4 * multiplier.change, icon: <TrendingUp size={20} color={Colors.accent} /> },
      ];
    case 'plumber':
      return [
        { label: period === 'week' ? 'Jobs This Week' : period === 'quarter' ? 'Jobs This Qtr' : period === 'year' ? 'Jobs This Year' : 'Jobs This Month', value: String(Math.round(32 * multiplier.value)), change: 8.5 * multiplier.change, icon: <Droplets size={20} color={serviceColor} /> },
        { label: 'Emergency Calls', value: String(Math.round(12 * multiplier.value)), change: 15.0 * multiplier.change, icon: <Zap size={20} color={Colors.warning} /> },
        { label: 'Revenue', value: `${(18.5 * multiplier.value).toFixed(1)}K`, change: 12.3 * multiplier.change, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Response Time', value: '28min', change: -15.0 * multiplier.change, icon: <Clock size={20} color={Colors.success} /> },
      ];
    case 'electrician':
      return [
        { label: 'Jobs Completed', value: '45', change: 11.2, icon: <Zap size={20} color={serviceColor} /> },
        { label: 'Inspections Passed', value: '42', change: 8.5, icon: <Target size={20} color={Colors.success} /> },
        { label: 'Revenue', value: '$52K', change: 19.3, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Safety Rating', value: '98%', change: 2.1, icon: <Star size={20} color={Colors.accent} /> },
      ];
    case 'interior_designer':
      return [
        { label: 'Active Projects', value: '6', change: 20.0, icon: <Home size={20} color={serviceColor} /> },
        { label: 'Completed', value: '22', change: 15.8, icon: <Target size={20} color={Colors.success} /> },
        { label: 'Revenue', value: '$78K', change: 25.4, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Client Satisfaction', value: '4.9', change: 3.2, icon: <Star size={20} color={Colors.accent} /> },
      ];
    case 'pool_company':
      return [
        { label: 'Active Builds', value: '3', change: 50.0, icon: <Droplets size={20} color={serviceColor} /> },
        { label: 'Maintenance Clients', value: '28', change: 12.0, icon: <Repeat size={20} color={Colors.primary} /> },
        { label: 'Revenue', value: '$145K', change: 28.5, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Referral Rate', value: '42%', change: 8.3, icon: <Users size={20} color={Colors.accent} /> },
      ];
    case 'dumpster_service':
      return [
        { label: 'Active Rentals', value: '12', change: 9.1, icon: <Briefcase size={20} color={serviceColor} /> },
        { label: 'Deliveries', value: '48', change: 15.7, icon: <Target size={20} color={Colors.success} /> },
        { label: 'Revenue', value: '$18K', change: 12.5, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'On-Time Rate', value: '96%', change: 4.2, icon: <Clock size={20} color={Colors.accent} /> },
      ];
    case 'painter':
      return [
        { label: 'Jobs Completed', value: '38', change: 14.8, icon: <Briefcase size={20} color={serviceColor} /> },
        { label: 'Sq Ft Painted', value: '12.5K', change: 22.3, icon: <Target size={20} color={Colors.success} /> },
        { label: 'Revenue', value: '$42K', change: 18.9, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Repeat Rate', value: '35%', change: 5.6, icon: <Repeat size={20} color={Colors.accent} /> },
      ];
    default:
      return [
        { label: 'Total Jobs', value: '35', change: 10.5, icon: <Briefcase size={20} color={serviceColor} /> },
        { label: 'Completed', value: '28', change: 12.3, icon: <Target size={20} color={Colors.success} /> },
        { label: 'Revenue', value: '$28K', change: 15.7, icon: <DollarSign size={20} color="#272D53" /> },
        { label: 'Avg Rating', value: '4.7', change: 3.2, icon: <Star size={20} color={Colors.accent} /> },
      ];
  }
};

const getDealSourcesForType = (professionalType: ProfessionalType | undefined): DealSource[] => {
  switch (professionalType) {
    case 'realtor':
      return [
        { source: 'App Leads', count: 8, percentage: 44, color: '#4299E1' },
        { source: 'Firm Leads', count: 4, percentage: 22, color: '#48BB78' },
        { source: 'Personal Network', count: 4, percentage: 22, color: '#272D53' },
        { source: 'Repeat Clients', count: 2, percentage: 12, color: '#9F7AEA' },
      ];
    case 'landscaper':
      return [
        { source: 'App Leads', count: 22, percentage: 47, color: '#4299E1' },
        { source: 'Referrals', count: 12, percentage: 26, color: '#48BB78' },
        { source: 'Repeat Clients', count: 8, percentage: 17, color: '#272D53' },
        { source: 'Direct Contact', count: 5, percentage: 10, color: '#9F7AEA' },
      ];
    case 'contractor':
      return [
        { source: 'App Projects', count: 18, percentage: 35, color: '#4299E1' },
        { source: 'Builder Referrals', count: 15, percentage: 29, color: '#48BB78' },
        { source: 'Repeat Clients', count: 12, percentage: 23, color: '#272D53' },
        { source: 'Direct Bids', count: 7, percentage: 13, color: '#9F7AEA' },
      ];
    case 'plumber':
      return [
        { source: 'Emergency Calls', count: 12, percentage: 38, color: '#E53E3E' },
        { source: 'App Bookings', count: 10, percentage: 31, color: '#4299E1' },
        { source: 'Contractor Refs', count: 6, percentage: 19, color: '#48BB78' },
        { source: 'Repeat Clients', count: 4, percentage: 12, color: '#272D53' },
      ];
    default:
      return [
        { source: 'App Leads', count: 15, percentage: 43, color: '#4299E1' },
        { source: 'Referrals', count: 10, percentage: 29, color: '#48BB78' },
        { source: 'Repeat Clients', count: 7, percentage: 20, color: '#272D53' },
        { source: 'Direct', count: 3, percentage: 8, color: '#9F7AEA' },
      ];
  }
};

const getMarketInsightsForType = (professionalType: ProfessionalType | undefined): MarketInsight[] => {
  switch (professionalType) {
    case 'realtor':
      return [
        { label: 'Median Price', value: '$425,000', trend: 'up', change: '+3.2%' },
        { label: 'Days on Market', value: '24', trend: 'down', change: '-5 days' },
        { label: 'Active Inventory', value: '342', trend: 'up', change: '+18 homes' },
        { label: 'Closed This Month', value: '89', trend: 'up', change: '+12%' },
      ];
    case 'landscaper':
      return [
        { label: 'Avg Project Size', value: '$4,800', trend: 'up', change: '+8%' },
        { label: 'Seasonal Demand', value: 'High', trend: 'up', change: 'Peak season' },
        { label: 'Local Competition', value: '45', trend: 'neutral', change: 'Stable' },
        { label: 'Material Costs', value: '+5%', trend: 'up', change: 'vs last month' },
      ];
    case 'contractor':
      return [
        { label: 'Avg Contract Value', value: '$28,500', trend: 'up', change: '+12%' },
        { label: 'Material Costs', value: '+3%', trend: 'up', change: 'vs last quarter' },
        { label: 'Labor Availability', value: 'Tight', trend: 'down', change: '-15%' },
        { label: 'Permit Wait Time', value: '12 days', trend: 'down', change: '-3 days' },
      ];
    case 'plumber':
      return [
        { label: 'Avg Service Call', value: '$185', trend: 'up', change: '+5%' },
        { label: 'Emergency Rate', value: '$125/hr', trend: 'neutral', change: 'Standard' },
        { label: 'Parts Markup', value: '25%', trend: 'neutral', change: 'Industry avg' },
        { label: 'Demand Level', value: 'High', trend: 'up', change: 'Winter peak' },
      ];
    default:
      return [
        { label: 'Avg Job Value', value: '$850', trend: 'up', change: '+6%' },
        { label: 'Local Demand', value: 'High', trend: 'up', change: 'Growing' },
        { label: 'Competition', value: 'Moderate', trend: 'neutral', change: 'Stable' },
        { label: 'Material Costs', value: '+4%', trend: 'up', change: 'vs last month' },
      ];
  }
};

const getGoalsForType = (professionalType: ProfessionalType | undefined): Goal[] => {
  switch (professionalType) {
    case 'realtor':
      return [
        { title: 'Monthly Transactions', current: 6, target: 8, unit: 'deals' },
        { title: 'Monthly Volume', current: 1.8, target: 2.5, unit: 'M' },
        { title: 'New Leads', current: 32, target: 50, unit: 'leads' },
      ];
    case 'landscaper':
      return [
        { title: 'Monthly Projects', current: 8, target: 12, unit: 'jobs' },
        { title: 'Monthly Revenue', current: 12.5, target: 18, unit: 'K' },
        { title: 'New Clients', current: 4, target: 8, unit: 'clients' },
      ];
    case 'contractor':
      return [
        { title: 'Active Projects', current: 8, target: 10, unit: 'projects' },
        { title: 'Monthly Revenue', current: 42, target: 50, unit: 'K' },
        { title: 'Bid Win Rate', current: 68, target: 75, unit: '%' },
      ];
    case 'plumber':
      return [
        { title: 'Monthly Jobs', current: 32, target: 40, unit: 'jobs' },
        { title: 'Monthly Revenue', current: 18.5, target: 22, unit: 'K' },
        { title: 'Response Time', current: 28, target: 20, unit: 'min' },
      ];
    default:
      return [
        { title: 'Monthly Jobs', current: 12, target: 15, unit: 'jobs' },
        { title: 'Monthly Revenue', current: 8, target: 12, unit: 'K' },
        { title: 'Client Rating', current: 4.7, target: 4.9, unit: 'stars' },
      ];
  }
};

const getBadgesForType = (professionalType: ProfessionalType | undefined): Badge[] => {
  switch (professionalType) {
    case 'realtor':
      return [
        { id: '1', title: 'Top 10% in Area', description: 'Ranked in top 10% of agents by volume', icon: <Trophy size={24} color="#FFD700" />, earned: true, color: '#FFD700' },
        { id: '2', title: 'Fast Responder', description: 'Average response time under 5 minutes', icon: <Zap size={24} color="#4299E1" />, earned: true, color: '#4299E1' },
        { id: '3', title: 'Investor Specialist', description: '10+ investor deals closed', icon: <Award size={24} color="#48BB78" />, earned: true, color: '#48BB78' },
        { id: '4', title: 'Rising Star', description: 'Most improved agent this quarter', icon: <Star size={24} color="#9F7AEA" />, earned: false, color: '#9F7AEA' },
      ];
    case 'landscaper':
      return [
        { id: '1', title: 'Top Rated', description: 'Maintained 4.8+ rating for 6 months', icon: <Trophy size={24} color="#FFD700" />, earned: true, color: '#FFD700' },
        { id: '2', title: 'Quick Responder', description: 'Average response time under 2 hours', icon: <Zap size={24} color="#4299E1" />, earned: true, color: '#4299E1' },
        { id: '3', title: 'Master Landscaper', description: '50+ projects completed', icon: <Award size={24} color="#48BB78" />, earned: false, color: '#48BB78' },
        { id: '4', title: 'Client Favorite', description: '10+ 5-star reviews', icon: <Star size={24} color="#9F7AEA" />, earned: true, color: '#9F7AEA' },
      ];
    case 'contractor':
      return [
        { id: '1', title: 'Trusted Pro', description: 'Verified license and insurance', icon: <Award size={24} color="#FFD700" />, earned: true, color: '#FFD700' },
        { id: '2', title: 'On-Time Expert', description: '95% projects completed on schedule', icon: <Clock size={24} color="#4299E1" />, earned: true, color: '#4299E1' },
        { id: '3', title: 'Volume Leader', description: '$500K+ in completed projects', icon: <Trophy size={24} color="#48BB78" />, earned: false, color: '#48BB78' },
        { id: '4', title: 'Budget Master', description: '90% projects under budget', icon: <Target size={24} color="#9F7AEA" />, earned: true, color: '#9F7AEA' },
      ];
    case 'plumber':
      return [
        { id: '1', title: 'Emergency Hero', description: '24/7 availability maintained', icon: <Zap size={24} color="#E53E3E" />, earned: true, color: '#E53E3E' },
        { id: '2', title: 'Fast Fixer', description: 'Average response under 30 min', icon: <Clock size={24} color="#4299E1" />, earned: true, color: '#4299E1' },
        { id: '3', title: 'Master Plumber', description: 'Licensed master plumber', icon: <Award size={24} color="#48BB78" />, earned: true, color: '#48BB78' },
        { id: '4', title: 'Client Choice', description: '50+ 5-star reviews', icon: <Star size={24} color="#9F7AEA" />, earned: false, color: '#9F7AEA' },
      ];
    default:
      return [
        { id: '1', title: 'Top Rated', description: 'Maintained high rating', icon: <Trophy size={24} color="#FFD700" />, earned: true, color: '#FFD700' },
        { id: '2', title: 'Quick Responder', description: 'Fast response time', icon: <Zap size={24} color="#4299E1" />, earned: true, color: '#4299E1' },
        { id: '3', title: 'Expert Pro', description: 'Verified professional', icon: <Award size={24} color="#48BB78" />, earned: false, color: '#48BB78' },
        { id: '4', title: 'Client Favorite', description: 'Highly recommended', icon: <Star size={24} color="#9F7AEA" />, earned: true, color: '#9F7AEA' },
      ];
  }
};

const getQuickStatsForType = (professionalType: ProfessionalType | undefined) => {
  switch (professionalType) {
    case 'realtor':
      return { stat1: { value: '18 days', label: 'Avg. Days to Close' }, stat2: { value: '23.1%', label: 'Conversion Rate' } };
    case 'landscaper':
      return { stat1: { value: '4.2 days', label: 'Avg. Project Time' }, stat2: { value: '38%', label: 'Repeat Client Rate' } };
    case 'contractor':
      return { stat1: { value: '6 weeks', label: 'Avg. Project Duration' }, stat2: { value: '68%', label: 'Bid Win Rate' } };
    case 'plumber':
      return { stat1: { value: '28 min', label: 'Avg. Response Time' }, stat2: { value: '94%', label: 'First-Fix Rate' } };
    default:
      return { stat1: { value: '2 days', label: 'Avg. Completion' }, stat2: { value: '85%', label: 'Satisfaction Rate' } };
  }
};

const getMarketInsightTitle = (professionalType: ProfessionalType | undefined): string => {
  switch (professionalType) {
    case 'realtor':
      return 'Market Insights';
    case 'landscaper':
      return 'Industry Insights';
    case 'contractor':
      return 'Market Conditions';
    case 'plumber':
      return 'Service Insights';
    default:
      return 'Market Insights';
  }
};

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { serviceConfig } = useService();
  const { theme } = useTheme();
  const professional = user as Professional | null;
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const serviceColor = serviceConfig?.color || Colors.primary;
  const mockStats = useMemo(() => getStatsForType(professional?.professionalType, serviceColor, selectedPeriod), [professional?.professionalType, serviceColor, selectedPeriod]);
  const mockDealSources = getDealSourcesForType(professional?.professionalType);
  const mockMarketInsights = getMarketInsightsForType(professional?.professionalType);
  const mockGoals = getGoalsForType(professional?.professionalType);
  const mockBadges = getBadgesForType(professional?.professionalType);
  const quickStats = getQuickStatsForType(professional?.professionalType);
  const marketInsightTitle = getMarketInsightTitle(professional?.professionalType);

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[styles.periodButton, selectedPeriod === period && [styles.periodButtonActive, { backgroundColor: serviceColor }]]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextActive]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatCard = (stat: StatData, index: number) => (
    <View key={index} style={styles.statCard}>
      <View style={styles.statIconContainer}>{stat.icon}</View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
      <View style={styles.statChangeContainer}>
        {stat.change >= 0 ? (
          <ArrowUpRight size={14} color={Colors.success} />
        ) : (
          <ArrowDownRight size={14} color={Colors.error} />
        )}
        <Text style={[styles.statChange, { color: stat.change >= 0 ? Colors.success : Colors.error }]}>
          {Math.abs(stat.change)}%
        </Text>
      </View>
    </View>
  );

  const renderDealSourcesChart = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <PieChart size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>
          {professional?.professionalType === 'realtor' ? 'Deal Sources' : 'Job Sources'}
        </Text>
      </View>
      <View style={styles.dealSourcesContainer}>
        <View style={styles.pieChartPlaceholder}>
          {mockDealSources.map((source, index) => (
            <View key={index} style={[styles.pieSegment, { backgroundColor: source.color, width: `${source.percentage}%` }]} />
          ))}
        </View>
        <View style={styles.dealSourcesList}>
          {mockDealSources.map((source, index) => (
            <View key={index} style={styles.dealSourceItem}>
              <View style={styles.dealSourceLeft}>
                <View style={[styles.dealSourceDot, { backgroundColor: source.color }]} />
                <Text style={styles.dealSourceName}>{source.source}</Text>
              </View>
              <View style={styles.dealSourceRight}>
                <Text style={styles.dealSourceCount}>{source.count}</Text>
                <Text style={styles.dealSourcePercentage}>{source.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMarketInsights = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <MapPin size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{marketInsightTitle}</Text>
        <Text style={styles.sectionSubtitle}>Austin, TX</Text>
      </View>
      <View style={styles.marketInsightsGrid}>
        {mockMarketInsights.map((insight, index) => (
          <View key={index} style={styles.marketInsightCard}>
            <Text style={styles.marketInsightLabel}>{insight.label}</Text>
            <Text style={styles.marketInsightValue}>{insight.value}</Text>
            <View style={styles.marketInsightTrend}>
              {insight.trend === 'up' ? (
                <ArrowUpRight size={12} color={Colors.success} />
              ) : insight.trend === 'down' ? (
                <ArrowDownRight size={12} color={Colors.error} />
              ) : null}
              <Text style={[styles.marketInsightChange, { color: insight.trend === 'up' ? Colors.success : insight.trend === 'down' ? Colors.error : Colors.textSecondary }]}>
                {insight.change}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderGoalTracking = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Target size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Goal Tracking</Text>
      </View>
      {mockGoals.map((goal, index) => {
        const progress = (goal.current / goal.target) * 100;
        return (
          <View key={index} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalProgress}>
                {goal.current}{goal.unit === 'M' || goal.unit === 'K' ? goal.unit : ''} / {goal.target}{goal.unit === 'M' || goal.unit === 'K' ? goal.unit : ` ${goal.unit}`}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%`, backgroundColor: progress >= 100 ? Colors.success : progress >= 75 ? Colors.progressBlue : progress >= 50 ? Colors.accent : Colors.warning }]} />
            </View>
            <Text style={styles.goalPercentage}>{Math.round(progress)}% complete</Text>
          </View>
        );
      })}
    </View>
  );

  const renderBadges = () => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Award size={20} color={Colors.primary} />
        <Text style={styles.sectionTitle}>Rankings & Badges</Text>
      </View>
      <View style={styles.badgesGrid}>
        {mockBadges.map((badge) => (
          <View key={badge.id} style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}>
            <View style={[styles.badgeIconContainer, { backgroundColor: badge.earned ? `${badge.color}20` : Colors.surfaceSecondary }]}>
              {badge.icon}
            </View>
            <Text style={[styles.badgeTitle, !badge.earned && styles.badgeTitleLocked]}>{badge.title}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            {!badge.earned && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>Locked</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsCard}>
      <View style={styles.quickStatItem}>
        <Clock size={18} color={Colors.textSecondary} />
        <View style={styles.quickStatContent}>
          <Text style={styles.quickStatValue}>{quickStats.stat1.value}</Text>
          <Text style={styles.quickStatLabel}>{quickStats.stat1.label}</Text>
        </View>
      </View>
      <View style={styles.quickStatDivider} />
      <View style={styles.quickStatItem}>
        <BarChart3 size={18} color={Colors.textSecondary} />
        <View style={styles.quickStatContent}>
          <Text style={styles.quickStatValue}>{quickStats.stat2.value}</Text>
          <Text style={styles.quickStatLabel}>{quickStats.stat2.label}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.borderLight }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={[styles.exportButtonText, { color: theme.navy }]}>Export</Text>
          <ChevronRight size={16} color={theme.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderPeriodSelector()}
        <View style={styles.statsGrid}>
          {mockStats.map((stat, index) => renderStatCard(stat, index))}
        </View>
        {renderQuickStats()}
        {renderDealSourcesChart()}
        {renderMarketInsights()}
        {renderGoalTracking()}
        {renderBadges()}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  headerTitle: { fontSize: 28, fontWeight: '700' as const, color: Colors.text },
  exportButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exportButtonText: { fontSize: 14, fontWeight: '600' as const, color: Colors.primary },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  periodSelector: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  periodButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  periodButtonActive: { backgroundColor: Colors.primary },
  periodButtonText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  periodButtonTextActive: { color: Colors.white },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: (width - 44) / 2, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, alignItems: 'flex-start' },
  statIconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceSecondary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  statChangeContainer: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  statChange: { fontSize: 12, fontWeight: '600' as const },
  quickStatsCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  quickStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickStatContent: { flex: 1 },
  quickStatValue: { fontSize: 18, fontWeight: '700' as const, color: Colors.text },
  quickStatLabel: { fontSize: 12, color: Colors.textSecondary },
  quickStatDivider: { width: 1, backgroundColor: Colors.borderLight, marginHorizontal: 16 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600' as const, color: Colors.text, flex: 1 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary },
  dealSourcesContainer: { gap: 16 },
  pieChartPlaceholder: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' },
  pieSegment: { height: '100%' },
  dealSourcesList: { gap: 12 },
  dealSourceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dealSourceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dealSourceDot: { width: 10, height: 10, borderRadius: 5 },
  dealSourceName: { fontSize: 14, color: Colors.text },
  dealSourceRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dealSourceCount: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, minWidth: 20, textAlign: 'right' as const },
  dealSourcePercentage: { fontSize: 13, color: Colors.textSecondary, minWidth: 35, textAlign: 'right' as const },
  marketInsightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  marketInsightCard: { width: (width - 76) / 2, backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 14 },
  marketInsightLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  marketInsightValue: { fontSize: 18, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  marketInsightTrend: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  marketInsightChange: { fontSize: 12, fontWeight: '500' as const },
  goalItem: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  goalTitle: { fontSize: 14, fontWeight: '500' as const, color: Colors.text },
  goalProgress: { fontSize: 13, color: Colors.textSecondary },
  progressBarContainer: { height: 8, backgroundColor: Colors.surfaceSecondary, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  progressBar: { height: '100%', borderRadius: 4 },
  goalPercentage: { fontSize: 12, color: Colors.textSecondary },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: (width - 76) / 2, backgroundColor: Colors.surfaceSecondary, borderRadius: 12, padding: 14, alignItems: 'center' },
  badgeCardLocked: { opacity: 0.6 },
  badgeIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  badgeTitle: { fontSize: 13, fontWeight: '600' as const, color: Colors.text, textAlign: 'center' as const, marginBottom: 4 },
  badgeTitleLocked: { color: Colors.textSecondary },
  badgeDescription: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' as const, lineHeight: 15 },
  lockedBadge: { marginTop: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.border, borderRadius: 4 },
  lockedText: { fontSize: 10, fontWeight: '500' as const, color: Colors.textTertiary },
  bottomPadding: { height: 20 },
});
