import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CloudSun,
  CloudLightning,
  MapPin,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";

type WeatherCondition = "sunny" | "partly_cloudy" | "cloudy" | "rainy" | "stormy" | "snowy" | "windy";

interface HourlyForecast {
  time: string;
  temp: number;
  condition: WeatherCondition;
  precipitation: number;
}

interface DailyForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipitation: number;
  windSpeed: number;
  workSuitable: boolean;
}

interface WeatherAlert {
  id: string;
  type: "warning" | "watch" | "advisory";
  title: string;
  description: string;
  validUntil: string;
}

const getWeatherIcon = (condition: WeatherCondition, size: number = 24) => {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (condition) {
    case "sunny":
      return <Sun {...iconProps} color="#272D53" />;
    case "partly_cloudy":
      return <CloudSun {...iconProps} color="#6B7280" />;
    case "cloudy":
      return <Cloud {...iconProps} color="#9CA3AF" />;
    case "rainy":
      return <CloudRain {...iconProps} color="#3B82F6" />;
    case "stormy":
      return <CloudLightning {...iconProps} color="#8B5CF6" />;
    case "snowy":
      return <CloudSnow {...iconProps} color="#60A5FA" />;
    case "windy":
      return <Wind {...iconProps} color="#6B7280" />;
    default:
      return <Sun {...iconProps} color="#272D53" />;
  }
};

const mockCurrentWeather = {
  location: "San Francisco, CA",
  temp: 68,
  feelsLike: 65,
  condition: "partly_cloudy" as WeatherCondition,
  description: "Partly Cloudy",
  humidity: 62,
  windSpeed: 12,
  windDirection: "NW",
  visibility: 10,
  pressure: 30.1,
  uvIndex: 6,
  sunrise: "6:45 AM",
  sunset: "7:32 PM",
};

const mockHourlyForecast: HourlyForecast[] = [
  { time: "Now", temp: 68, condition: "partly_cloudy", precipitation: 0 },
  { time: "10 AM", temp: 70, condition: "sunny", precipitation: 0 },
  { time: "11 AM", temp: 72, condition: "sunny", precipitation: 0 },
  { time: "12 PM", temp: 74, condition: "sunny", precipitation: 5 },
  { time: "1 PM", temp: 75, condition: "partly_cloudy", precipitation: 10 },
  { time: "2 PM", temp: 74, condition: "partly_cloudy", precipitation: 15 },
  { time: "3 PM", temp: 73, condition: "cloudy", precipitation: 20 },
  { time: "4 PM", temp: 71, condition: "cloudy", precipitation: 25 },
  { time: "5 PM", temp: 69, condition: "partly_cloudy", precipitation: 15 },
  { time: "6 PM", temp: 67, condition: "partly_cloudy", precipitation: 10 },
  { time: "7 PM", temp: 65, condition: "partly_cloudy", precipitation: 5 },
  { time: "8 PM", temp: 63, condition: "cloudy", precipitation: 10 },
];

const mockDailyForecast: DailyForecast[] = [
  { day: "Today", date: "Jan 25", high: 75, low: 58, condition: "partly_cloudy", precipitation: 10, windSpeed: 12, workSuitable: true },
  { day: "Sun", date: "Jan 26", high: 72, low: 55, condition: "sunny", precipitation: 0, windSpeed: 8, workSuitable: true },
  { day: "Mon", date: "Jan 27", high: 68, low: 52, condition: "cloudy", precipitation: 30, windSpeed: 15, workSuitable: true },
  { day: "Tue", date: "Jan 28", high: 62, low: 48, condition: "rainy", precipitation: 80, windSpeed: 20, workSuitable: false },
  { day: "Wed", date: "Jan 29", high: 58, low: 45, condition: "rainy", precipitation: 90, windSpeed: 25, workSuitable: false },
  { day: "Thu", date: "Jan 30", high: 65, low: 50, condition: "partly_cloudy", precipitation: 20, windSpeed: 12, workSuitable: true },
  { day: "Fri", date: "Jan 31", high: 70, low: 54, condition: "sunny", precipitation: 5, windSpeed: 10, workSuitable: true },
];

const mockAlerts: WeatherAlert[] = [
  {
    id: "1",
    type: "watch",
    title: "Wind Advisory",
    description: "Winds 25-35 mph expected Tuesday through Wednesday. Secure loose materials and equipment.",
    validUntil: "Wed, Jan 29 at 6:00 PM",
  },
];

const getWorkRecommendation = (forecast: DailyForecast) => {
  if (forecast.precipitation >= 70) {
    return { status: "poor", text: "Not recommended - High precipitation expected", color: "#EF4444" };
  }
  if (forecast.windSpeed >= 25) {
    return { status: "poor", text: "Not recommended - High winds expected", color: "#EF4444" };
  }
  if (forecast.precipitation >= 40 || forecast.windSpeed >= 18) {
    return { status: "fair", text: "Caution advised - Check conditions", color: "#272D53" };
  }
  return { status: "good", text: "Good conditions for outdoor work", color: "#10B981" };
};

export default function WeatherScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navy} />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  const todayRecommendation = getWorkRecommendation(mockDailyForecast[0]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Weather Forecast</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.navy} />
          }
        >
          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={16} color="#6B7280" strokeWidth={1.5} />
            <Text style={styles.locationText}>{mockCurrentWeather.location}</Text>
          </View>

          {/* Current Weather Card */}
          <View style={styles.currentWeatherCard}>
            <View style={styles.currentWeatherMain}>
              <View style={styles.currentWeatherLeft}>
                {getWeatherIcon(mockCurrentWeather.condition, 64)}
                <Text style={styles.currentCondition}>{mockCurrentWeather.description}</Text>
              </View>
              <View style={styles.currentWeatherRight}>
                <Text style={styles.currentTemp}>{mockCurrentWeather.temp}°</Text>
                <Text style={styles.feelsLike}>Feels like {mockCurrentWeather.feelsLike}°</Text>
              </View>
            </View>
            
            {/* Work Recommendation */}
            <View style={[styles.workRecommendation, { backgroundColor: `${todayRecommendation.color}15` }]}>
              {todayRecommendation.status === "good" ? (
                <CheckCircle size={18} color={todayRecommendation.color} strokeWidth={2} />
              ) : todayRecommendation.status === "fair" ? (
                <AlertTriangle size={18} color={todayRecommendation.color} strokeWidth={2} />
              ) : (
                <XCircle size={18} color={todayRecommendation.color} strokeWidth={2} />
              )}
              <Text style={[styles.workRecommendationText, { color: todayRecommendation.color }]}>
                {todayRecommendation.text}
              </Text>
            </View>

            {/* Weather Details Grid */}
            <View style={styles.weatherDetailsGrid}>
              <View style={styles.weatherDetailItem}>
                <Droplets size={18} color="#3B82F6" strokeWidth={1.5} />
                <Text style={styles.weatherDetailValue}>{mockCurrentWeather.humidity}%</Text>
                <Text style={styles.weatherDetailLabel}>Humidity</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Wind size={18} color="#6B7280" strokeWidth={1.5} />
                <Text style={styles.weatherDetailValue}>{mockCurrentWeather.windSpeed} mph</Text>
                <Text style={styles.weatherDetailLabel}>{mockCurrentWeather.windDirection} Wind</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Eye size={18} color="#8B5CF6" strokeWidth={1.5} />
                <Text style={styles.weatherDetailValue}>{mockCurrentWeather.visibility} mi</Text>
                <Text style={styles.weatherDetailLabel}>Visibility</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Gauge size={18} color="#10B981" strokeWidth={1.5} />
                <Text style={styles.weatherDetailValue}>{mockCurrentWeather.pressure}</Text>
                <Text style={styles.weatherDetailLabel}>Pressure</Text>
              </View>
            </View>

            {/* Sun Times */}
            <View style={styles.sunTimesRow}>
              <View style={styles.sunTimeItem}>
                <Sunrise size={16} color="#272D53" strokeWidth={1.5} />
                <Text style={styles.sunTimeText}>{mockCurrentWeather.sunrise}</Text>
              </View>
              <View style={styles.sunTimeDivider} />
              <View style={styles.sunTimeItem}>
                <Sunset size={16} color="#272D53" strokeWidth={1.5} />
                <Text style={styles.sunTimeText}>{mockCurrentWeather.sunset}</Text>
              </View>
            </View>
          </View>

          {/* Weather Alerts */}
          {mockAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weather Alerts</Text>
              {mockAlerts.map((alert) => (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={[
                      styles.alertTypeBadge,
                      alert.type === "warning" && styles.alertWarning,
                      alert.type === "watch" && styles.alertWatch,
                      alert.type === "advisory" && styles.alertAdvisory,
                    ]}>
                      <AlertTriangle size={12} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.alertTypeText}>
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                  </View>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                  <Text style={styles.alertValidUntil}>Valid until: {alert.validUntil}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Hourly Forecast */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hourly Forecast</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyContainer}
            >
              {mockHourlyForecast.map((hour, index) => (
                <View key={index} style={styles.hourlyItem}>
                  <Text style={styles.hourlyTime}>{hour.time}</Text>
                  {getWeatherIcon(hour.condition, 24)}
                  <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
                  {hour.precipitation > 0 && (
                    <View style={styles.hourlyPrecip}>
                      <Droplets size={10} color="#3B82F6" strokeWidth={2} />
                      <Text style={styles.hourlyPrecipText}>{hour.precipitation}%</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 7-Day Forecast */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7-Day Forecast</Text>
            <View style={styles.dailyContainer}>
              {mockDailyForecast.map((day, index) => {
                const recommendation = getWorkRecommendation(day);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dailyItem,
                      selectedDay?.date === day.date && styles.dailyItemSelected,
                    ]}
                    onPress={() => setSelectedDay(selectedDay?.date === day.date ? null : day)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dailyLeft}>
                      <Text style={styles.dailyDay}>{day.day}</Text>
                      <Text style={styles.dailyDate}>{day.date}</Text>
                    </View>
                    <View style={styles.dailyMiddle}>
                      {getWeatherIcon(day.condition, 28)}
                      {day.precipitation > 0 && (
                        <Text style={styles.dailyPrecip}>{day.precipitation}%</Text>
                      )}
                    </View>
                    <View style={styles.dailyRight}>
                      <Text style={styles.dailyHigh}>{day.high}°</Text>
                      <Text style={styles.dailyLow}>{day.low}°</Text>
                    </View>
                    <View style={[styles.workIndicator, { backgroundColor: recommendation.color }]}>
                      {day.workSuitable ? (
                        <CheckCircle size={14} color="#FFFFFF" strokeWidth={2.5} />
                      ) : (
                        <XCircle size={14} color="#FFFFFF" strokeWidth={2.5} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Day Details */}
          {selectedDay && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{selectedDay.day} Details</Text>
              <View style={styles.selectedDayCard}>
                <View style={styles.selectedDayRow}>
                  <View style={styles.selectedDayItem}>
                    <Thermometer size={18} color="#EF4444" strokeWidth={1.5} />
                    <Text style={styles.selectedDayLabel}>High/Low</Text>
                    <Text style={styles.selectedDayValue}>{selectedDay.high}° / {selectedDay.low}°</Text>
                  </View>
                  <View style={styles.selectedDayItem}>
                    <CloudRain size={18} color="#3B82F6" strokeWidth={1.5} />
                    <Text style={styles.selectedDayLabel}>Precipitation</Text>
                    <Text style={styles.selectedDayValue}>{selectedDay.precipitation}%</Text>
                  </View>
                  <View style={styles.selectedDayItem}>
                    <Wind size={18} color="#6B7280" strokeWidth={1.5} />
                    <Text style={styles.selectedDayLabel}>Wind</Text>
                    <Text style={styles.selectedDayValue}>{selectedDay.windSpeed} mph</Text>
                  </View>
                </View>
                <View style={[
                  styles.selectedDayRecommendation,
                  { backgroundColor: `${getWorkRecommendation(selectedDay).color}15` },
                ]}>
                  <Text style={[
                    styles.selectedDayRecommendationText,
                    { color: getWorkRecommendation(selectedDay).color },
                  ]}>
                    {getWorkRecommendation(selectedDay).text}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Work Schedule Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Days for Outdoor Work</Text>
            <View style={styles.bestDaysContainer}>
              {mockDailyForecast
                .filter((day) => day.workSuitable)
                .slice(0, 3)
                .map((day, index) => (
                  <View key={index} style={styles.bestDayItem}>
                    <View style={styles.bestDayIcon}>
                      {getWeatherIcon(day.condition, 20)}
                    </View>
                    <View style={styles.bestDayInfo}>
                      <Text style={styles.bestDayName}>{day.day}, {day.date}</Text>
                      <Text style={styles.bestDayTemp}>{day.high}° / {day.low}°</Text>
                    </View>
                    <View style={styles.bestDayBadge}>
                      <CheckCircle size={14} color="#10B981" strokeWidth={2} />
                      <Text style={styles.bestDayBadgeText}>Ideal</Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  currentWeatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentWeatherMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  currentWeatherLeft: {
    alignItems: "center",
    gap: 8,
  },
  currentCondition: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  currentWeatherRight: {
    alignItems: "flex-end",
  },
  currentTemp: {
    fontSize: 56,
    fontWeight: "300" as const,
    color: "#1F2937",
  },
  feelsLike: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  workRecommendation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  workRecommendationText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  weatherDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weatherDetailItem: {
    width: "23%",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
  },
  weatherDetailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  weatherDetailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
  sunTimesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  sunTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
  },
  sunTimeDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
  },
  sunTimeText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500" as const,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: "#E8E9EE",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#272D53",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  alertTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#272D53",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertWarning: {
    backgroundColor: "#EF4444",
  },
  alertWatch: {
    backgroundColor: "#272D53",
  },
  alertAdvisory: {
    backgroundColor: "#3B82F6",
  },
  alertTypeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#92400E",
  },
  alertDescription: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
    marginBottom: 6,
  },
  alertValidUntil: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: "500" as const,
  },
  hourlyContainer: {
    paddingVertical: 4,
    gap: 12,
  },
  hourlyItem: {
    width: 64,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  hourlyTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500" as const,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  hourlyPrecip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  hourlyPrecipText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "500" as const,
  },
  dailyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dailyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dailyItemSelected: {
    backgroundColor: "#F3F4F6",
  },
  dailyLeft: {
    width: 70,
  },
  dailyDay: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  dailyDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  dailyMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dailyPrecip: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500" as const,
  },
  dailyRight: {
    flexDirection: "row",
    gap: 12,
    marginRight: 12,
  },
  dailyHigh: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  dailyLow: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  workIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedDayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  selectedDayItem: {
    alignItems: "center",
    gap: 6,
  },
  selectedDayLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  selectedDayValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  selectedDayRecommendation: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  selectedDayRecommendationText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  bestDaysContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bestDayItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bestDayIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  bestDayInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bestDayName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  bestDayTemp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  bestDayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bestDayBadgeText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600" as const,
  },
});
