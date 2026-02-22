import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  CloudFog,
  AlertTriangle,
  CheckCircle,
  MapPin,
  RefreshCw,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import * as Location from "expo-location";

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
}

interface ForecastDay {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipProbability: number;
}

interface WeatherWidgetProps {
  serviceColor?: string;
  showWorkCondition?: boolean;
  compact?: boolean;
}

const getWeatherInfo = (code: number, isDay: boolean = true) => {
  const weatherMap: Record<number, { icon: any; label: string; color: string }> = {
    0: { icon: Sun, label: "Clear", color: "#FBBF24" },
    1: { icon: Sun, label: "Mostly Clear", color: "#FBBF24" },
    2: { icon: Cloud, label: "Partly Cloudy", color: "#94A3B8" },
    3: { icon: Cloud, label: "Overcast", color: "#64748B" },
    45: { icon: CloudFog, label: "Foggy", color: "#94A3B8" },
    48: { icon: CloudFog, label: "Rime Fog", color: "#94A3B8" },
    51: { icon: CloudRain, label: "Light Drizzle", color: "#60A5FA" },
    53: { icon: CloudRain, label: "Drizzle", color: "#3B82F6" },
    55: { icon: CloudRain, label: "Heavy Drizzle", color: "#2563EB" },
    61: { icon: CloudRain, label: "Light Rain", color: "#60A5FA" },
    63: { icon: CloudRain, label: "Rain", color: "#3B82F6" },
    65: { icon: CloudRain, label: "Heavy Rain", color: "#1D4ED8" },
    71: { icon: CloudSnow, label: "Light Snow", color: "#E0E7FF" },
    73: { icon: CloudSnow, label: "Snow", color: "#C7D2FE" },
    75: { icon: CloudSnow, label: "Heavy Snow", color: "#A5B4FC" },
    77: { icon: CloudSnow, label: "Snow Grains", color: "#C7D2FE" },
    80: { icon: CloudRain, label: "Rain Showers", color: "#3B82F6" },
    81: { icon: CloudRain, label: "Moderate Showers", color: "#2563EB" },
    82: { icon: CloudRain, label: "Heavy Showers", color: "#1D4ED8" },
    85: { icon: CloudSnow, label: "Snow Showers", color: "#C7D2FE" },
    86: { icon: CloudSnow, label: "Heavy Snow Showers", color: "#A5B4FC" },
    95: { icon: CloudLightning, label: "Thunderstorm", color: "#8B5CF6" },
    96: { icon: CloudLightning, label: "Thunderstorm + Hail", color: "#7C3AED" },
    99: { icon: CloudLightning, label: "Severe Thunderstorm", color: "#6D28D9" },
  };

  return weatherMap[code] || { icon: Cloud, label: "Unknown", color: "#94A3B8" };
};

const getWorkCondition = (weather: WeatherData) => {
  const { temperature, windSpeed, precipitation, weatherCode } = weather;
  
  const badCodes = [63, 65, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
  const cautionCodes = [45, 48, 51, 53, 55, 61];
  
  if (badCodes.includes(weatherCode) || temperature < 32 || temperature > 100 || windSpeed > 25) {
    return {
      status: "poor",
      label: "Poor Conditions",
      description: "Consider rescheduling outdoor work",
      color: "#EF4444",
      icon: AlertTriangle,
    };
  }
  
  if (cautionCodes.includes(weatherCode) || temperature < 45 || temperature > 90 || windSpeed > 15 || precipitation > 0) {
    return {
      status: "caution",
      label: "Fair Conditions",
      description: "Proceed with caution",
      color: "#272D53",
      icon: AlertTriangle,
    };
  }
  
  return {
    status: "good",
    label: "Good Conditions",
    description: "Great day for outdoor work",
    color: "#22C55E",
    icon: CheckCircle,
  };
};

const getDayName = (dateStr: string, index: number) => {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export default function WeatherWidget({ 
  serviceColor = Colors.primary, 
  showWorkCondition = true,
  compact = false,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [location, setLocation] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      let latitude = 30.2672;
      let longitude = -97.7431;
      let cityName = "Austin, TX";

      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
          
          try {
            const [address] = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
            if (address) {
              cityName = address.city 
                ? `${address.city}, ${address.region || ""}` 
                : address.region || "Current Location";
            }
          } catch {
            cityName = "Current Location";
          }
        }
      }

      setLocation(cityName);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=5`
      );

      if (!response.ok) throw new Error("Failed to fetch weather");

      const data = await response.json();

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day === 1,
        precipitation: data.current.precipitation,
      });

      const forecastDays: ForecastDay[] = data.daily.time.map((date: string, index: number) => ({
        date,
        dayName: getDayName(date, index),
        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        weatherCode: data.daily.weather_code[index],
        precipProbability: data.daily.precipitation_probability_max[index],
      }));

      setForecast(forecastDays);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={serviceColor} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.errorContainer}>
          <Cloud size={24} color={Colors.textTertiary} />
          <Text style={styles.errorText}>{error || "Weather unavailable"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWeather}>
            <RefreshCw size={14} color={serviceColor} />
            <Text style={[styles.retryText, { color: serviceColor }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const weatherInfo = getWeatherInfo(weather.weatherCode, weather.isDay);
  const WeatherIcon = weatherInfo.icon;
  const workCondition = showWorkCondition ? getWorkCondition(weather) : null;
  const WorkConditionIcon = workCondition?.icon;

  if (compact) {
    return (
      <View style={[styles.container, styles.containerCompact]}>
        <View style={styles.compactRow}>
          <View style={[styles.compactIconContainer, { backgroundColor: `${weatherInfo.color}20` }]}>
            <WeatherIcon size={24} color={weatherInfo.color} />
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTemp}>{weather.temperature}°F</Text>
            <Text style={styles.compactLabel}>{weatherInfo.label}</Text>
          </View>
          {workCondition && (
            <View style={[styles.compactCondition, { backgroundColor: `${workCondition.color}15` }]}>
              {WorkConditionIcon && <WorkConditionIcon size={14} color={workCondition.color} />}
              <Text style={[styles.compactConditionText, { color: workCondition.color }]}>
                {workCondition.status === "good" ? "Good" : workCondition.status === "caution" ? "Fair" : "Poor"}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <TouchableOpacity onPress={fetchWeather} style={styles.refreshButton}>
          <RefreshCw size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.currentWeather}>
        <View style={styles.mainTemp}>
          <View style={[styles.weatherIconContainer, { backgroundColor: `${weatherInfo.color}20` }]}>
            <WeatherIcon size={40} color={weatherInfo.color} />
          </View>
          <View style={styles.tempInfo}>
            <Text style={styles.temperature}>{weather.temperature}°F</Text>
            <Text style={styles.weatherLabel}>{weatherInfo.label}</Text>
            <Text style={styles.feelsLike}>Feels like {weather.feelsLike}°F</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Droplets size={16} color="#3B82F6" />
            <Text style={styles.detailValue}>{weather.humidity}%</Text>
            <Text style={styles.detailLabel}>Humidity</Text>
          </View>
          <View style={styles.detailItem}>
            <Wind size={16} color="#64748B" />
            <Text style={styles.detailValue}>{weather.windSpeed} mph</Text>
            <Text style={styles.detailLabel}>Wind</Text>
          </View>
          <View style={styles.detailItem}>
            <Thermometer size={16} color="#EF4444" />
            <Text style={styles.detailValue}>{weather.feelsLike}°F</Text>
            <Text style={styles.detailLabel}>Feels Like</Text>
          </View>
        </View>
      </View>

      {workCondition && (
        <View style={[styles.workConditionCard, { backgroundColor: `${workCondition.color}10`, borderColor: `${workCondition.color}30` }]}>
          {WorkConditionIcon && <WorkConditionIcon size={18} color={workCondition.color} />}
          <View style={styles.workConditionInfo}>
            <Text style={[styles.workConditionLabel, { color: workCondition.color }]}>{workCondition.label}</Text>
            <Text style={styles.workConditionDesc}>{workCondition.description}</Text>
          </View>
        </View>
      )}

      <View style={styles.forecastSection}>
        <Text style={styles.forecastTitle}>5-Day Forecast</Text>
        <View style={styles.forecastRow}>
          {forecast.map((day, index) => {
            const dayWeather = getWeatherInfo(day.weatherCode);
            const DayIcon = dayWeather.icon;
            return (
              <View key={day.date} style={styles.forecastDay}>
                <Text style={[styles.forecastDayName, index === 0 && { color: serviceColor, fontWeight: "700" as const }]}>
                  {day.dayName}
                </Text>
                <View style={[styles.forecastIconContainer, { backgroundColor: `${dayWeather.color}15` }]}>
                  <DayIcon size={20} color={dayWeather.color} />
                </View>
                <Text style={styles.forecastHigh}>{day.maxTemp}°</Text>
                <Text style={styles.forecastLow}>{day.minTemp}°</Text>
                {day.precipProbability > 20 && (
                  <View style={styles.precipBadge}>
                    <Droplets size={10} color="#3B82F6" />
                    <Text style={styles.precipText}>{day.precipProbability}%</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,

  },
  containerCompact: {
    padding: 12,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  refreshButton: {
    padding: 6,
  },
  currentWeather: {
    marginBottom: 12,
  },
  mainTemp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  weatherIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tempInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 42,
    fontWeight: "700" as const,
    color: Colors.text,
    lineHeight: 48,
  },
  weatherLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  feelsLike: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  detailItem: {
    alignItems: "center",
    gap: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  workConditionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  workConditionInfo: {
    flex: 1,
  },
  workConditionLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  workConditionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  forecastSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forecastDay: {
    alignItems: "center",
    flex: 1,
  },
  forecastDayName: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  forecastIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  forecastHigh: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  forecastLow: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  precipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  precipText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "500" as const,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  compactInfo: {
    flex: 1,
  },
  compactTemp: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  compactLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  compactCondition: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compactConditionText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
