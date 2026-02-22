import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  SprayCan,
  Paintbrush,
  Ruler,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Droplets,
  Wind,
  ChevronRight,
  RotateCcw,
  Info,
} from 'lucide-react-native';

type SurfaceType = {
  id: string;
  name: string;
  icon: string;
  sprayMultiplier: number;
  brushMultiplier: number;
  rollerMultiplier: number;
  description: string;
};

type ApplicationMethod = 'spray' | 'brush' | 'roller';

type Recommendation = {
  method: ApplicationMethod;
  score: number;
  timeEstimate: number;
  costEstimate: number;
  pros: string[];
  cons: string[];
  tips: string[];
};

const SURFACE_TYPES: SurfaceType[] = [
  {
    id: 'smooth-wall',
    name: 'Smooth Wall',
    icon: '🧱',
    sprayMultiplier: 1.0,
    brushMultiplier: 0.7,
    rollerMultiplier: 0.9,
    description: 'Drywall, plaster, or smooth surfaces',
  },
  {
    id: 'textured-wall',
    name: 'Textured Wall',
    icon: '🏔️',
    sprayMultiplier: 1.2,
    brushMultiplier: 0.5,
    rollerMultiplier: 0.8,
    description: 'Popcorn, knockdown, or orange peel',
  },
  {
    id: 'cabinets',
    name: 'Cabinets',
    icon: '🗄️',
    sprayMultiplier: 1.3,
    brushMultiplier: 0.8,
    rollerMultiplier: 0.6,
    description: 'Kitchen or bathroom cabinets',
  },
  {
    id: 'trim',
    name: 'Trim & Molding',
    icon: '📐',
    sprayMultiplier: 0.9,
    brushMultiplier: 1.1,
    rollerMultiplier: 0.5,
    description: 'Baseboards, crown molding, door frames',
  },
  {
    id: 'doors',
    name: 'Doors',
    icon: '🚪',
    sprayMultiplier: 1.2,
    brushMultiplier: 0.7,
    rollerMultiplier: 0.8,
    description: 'Interior or exterior doors',
  },
  {
    id: 'fence',
    name: 'Fence',
    icon: '🏡',
    sprayMultiplier: 1.4,
    brushMultiplier: 0.4,
    rollerMultiplier: 0.6,
    description: 'Wood or metal fencing',
  },
  {
    id: 'deck',
    name: 'Deck',
    icon: '🪵',
    sprayMultiplier: 1.1,
    brushMultiplier: 0.5,
    rollerMultiplier: 0.9,
    description: 'Wood deck or patio surface',
  },
  {
    id: 'exterior-siding',
    name: 'Exterior Siding',
    icon: '🏠',
    sprayMultiplier: 1.5,
    brushMultiplier: 0.3,
    rollerMultiplier: 0.7,
    description: 'Wood, vinyl, or fiber cement',
  },
  {
    id: 'furniture',
    name: 'Furniture',
    icon: '🪑',
    sprayMultiplier: 1.2,
    brushMultiplier: 0.9,
    rollerMultiplier: 0.5,
    description: 'Tables, chairs, dressers',
  },
  {
    id: 'ceiling',
    name: 'Ceiling',
    icon: '⬆️',
    sprayMultiplier: 1.3,
    brushMultiplier: 0.4,
    rollerMultiplier: 1.0,
    description: 'Flat or textured ceilings',
  },
];

const AREA_THRESHOLDS = {
  small: 100,
  medium: 500,
  large: 1000,
};

export default function SprayBrushCalculatorScreen() {
  const [surfaceArea, setSurfaceArea] = useState('');
  const [selectedSurface, setSelectedSurface] = useState<SurfaceType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const calculateRecommendations = useMemo((): Recommendation[] => {
    if (!surfaceArea || !selectedSurface) return [];

    const area = parseFloat(surfaceArea);
    if (isNaN(area) || area <= 0) return [];

    const baseTimePerSqFt = {
      spray: 0.5,
      brush: 2.5,
      roller: 1.2,
    };

    const baseCostPerSqFt = {
      spray: 0.15,
      brush: 0.08,
      roller: 0.10,
    };

    const areaFactor = area > AREA_THRESHOLDS.large ? 1.3 :
                       area > AREA_THRESHOLDS.medium ? 1.1 : 0.9;

    const recommendations: Recommendation[] = [
      {
        method: 'spray',
        score: selectedSurface.sprayMultiplier * areaFactor * (area > AREA_THRESHOLDS.medium ? 1.2 : 0.8),
        timeEstimate: Math.round((area * baseTimePerSqFt.spray) / selectedSurface.sprayMultiplier),
        costEstimate: Math.round(area * baseCostPerSqFt.spray * 100) / 100,
        pros: [
          'Fastest application for large areas',
          'Smoothest, most even finish',
          'Better coverage in textured surfaces',
          'Less physical effort required',
        ],
        cons: [
          'Requires extensive masking/prep',
          'Equipment setup time',
          'More overspray waste',
          'Ventilation required',
        ],
        tips: [
          'Use proper respirator and eye protection',
          'Maintain 10-12 inch spray distance',
          'Apply in thin, overlapping coats',
          'Keep sprayer moving to avoid drips',
        ],
      },
      {
        method: 'brush',
        score: selectedSurface.brushMultiplier * (1 / areaFactor) * (area < AREA_THRESHOLDS.small ? 1.3 : 0.7),
        timeEstimate: Math.round((area * baseTimePerSqFt.brush) / selectedSurface.brushMultiplier),
        costEstimate: Math.round(area * baseCostPerSqFt.brush * 100) / 100,
        pros: [
          'Best for detail work and edges',
          'Minimal prep required',
          'Most control over application',
          'Easy cleanup',
        ],
        cons: [
          'Slowest application method',
          'May show brush strokes',
          'More tiring for large areas',
          'Multiple coats often needed',
        ],
        tips: [
          'Use quality angled brush for cutting in',
          'Load brush 1/3 into paint',
          'Maintain wet edge to avoid lap marks',
          'Work in 2-3 foot sections',
        ],
      },
      {
        method: 'roller',
        score: selectedSurface.rollerMultiplier * (area > AREA_THRESHOLDS.small ? 1.2 : 0.8),
        timeEstimate: Math.round((area * baseTimePerSqFt.roller) / selectedSurface.rollerMultiplier),
        costEstimate: Math.round(area * baseCostPerSqFt.roller * 100) / 100,
        pros: [
          'Good balance of speed and control',
          'Easy to learn technique',
          'Works on most surfaces',
          'Minimal overspray',
        ],
        cons: [
          'Can leave texture pattern',
          'Not ideal for detailed areas',
          'Requires brush for edges',
          'Physical effort for ceilings',
        ],
        tips: [
          'Use W or M pattern for even coverage',
          'Choose nap thickness for surface texture',
          'Don\'t overload roller to avoid drips',
          'Roll in one direction for final pass',
        ],
      },
    ];

    return recommendations.sort((a, b) => b.score - a.score);
  }, [surfaceArea, selectedSurface]);

  const handleCalculate = () => {
    if (!surfaceArea || !selectedSurface) return;
    
    setShowResults(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleReset = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowResults(false);
      setSurfaceArea('');
      setSelectedSurface(null);
    });
  };

  const getMethodIcon = (method: ApplicationMethod) => {
    switch (method) {
      case 'spray':
        return <SprayCan size={28} color="#fff" />;
      case 'brush':
        return <Paintbrush size={28} color="#fff" />;
      case 'roller':
        return <Droplets size={28} color="#fff" />;
    }
  };

  const getMethodColor = (method: ApplicationMethod, index: number) => {
    if (index === 0) return '#10B981';
    if (index === 1) return '#272D53';
    return '#6B7280';
  };

  const getMethodName = (method: ApplicationMethod) => {
    switch (method) {
      case 'spray':
        return 'Spray Gun';
      case 'brush':
        return 'Brush';
      case 'roller':
        return 'Roller';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Spray vs Brush Calculator',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#fff',
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!showResults ? (
            <>
              <View style={styles.header}>
                <View style={styles.headerIconContainer}>
                  <SprayCan size={32} color="#fff" />
                  <Paintbrush size={28} color="#fff" style={styles.headerIconOverlap} />
                </View>
                <Text style={styles.headerTitle}>Find Your Best Method</Text>
                <Text style={styles.headerSubtitle}>
                  Enter your project details to get personalized recommendations
                </Text>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Surface Area</Text>
                <View style={styles.areaInputContainer}>
                  <Ruler size={20} color="#64748B" />
                  <TextInput
                    style={styles.areaInput}
                    placeholder="Enter square feet"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={surfaceArea}
                    onChangeText={setSurfaceArea}
                  />
                  <Text style={styles.areaUnit}>sq ft</Text>
                </View>
                
                <View style={styles.quickAreaButtons}>
                  {[50, 200, 500, 1000].map((area) => (
                    <TouchableOpacity
                      key={area}
                      style={[
                        styles.quickAreaButton,
                        surfaceArea === String(area) && styles.quickAreaButtonActive,
                      ]}
                      onPress={() => setSurfaceArea(String(area))}
                    >
                      <Text
                        style={[
                          styles.quickAreaButtonText,
                          surfaceArea === String(area) && styles.quickAreaButtonTextActive,
                        ]}
                      >
                        {area}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Surface Type</Text>
                <View style={styles.surfaceGrid}>
                  {SURFACE_TYPES.map((surface) => (
                    <TouchableOpacity
                      key={surface.id}
                      style={[
                        styles.surfaceCard,
                        selectedSurface?.id === surface.id && styles.surfaceCardSelected,
                      ]}
                      onPress={() => setSelectedSurface(surface)}
                    >
                      <Text style={styles.surfaceIcon}>{surface.icon}</Text>
                      <Text
                        style={[
                          styles.surfaceName,
                          selectedSurface?.id === surface.id && styles.surfaceNameSelected,
                        ]}
                      >
                        {surface.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedSurface && (
                <View style={styles.surfaceInfo}>
                  <Info size={16} color="#64748B" />
                  <Text style={styles.surfaceInfoText}>{selectedSurface.description}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.calculateButton,
                  (!surfaceArea || !selectedSurface) && styles.calculateButtonDisabled,
                ]}
                onPress={handleCalculate}
                disabled={!surfaceArea || !selectedSurface}
              >
                <Text style={styles.calculateButtonText}>Get Recommendation</Text>
                <ChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Recommendations</Text>
                <Text style={styles.resultsSubtitle}>
                  {surfaceArea} sq ft • {selectedSurface?.name}
                </Text>
              </View>

              {calculateRecommendations.map((rec, index) => (
                <View
                  key={rec.method}
                  style={[
                    styles.recommendationCard,
                    index === 0 && styles.recommendationCardBest,
                  ]}
                >
                  {index === 0 && (
                    <View style={styles.bestBadge}>
                      <CheckCircle size={14} color="#fff" />
                      <Text style={styles.bestBadgeText}>Best Choice</Text>
                    </View>
                  )}

                  <View style={styles.recHeader}>
                    <View
                      style={[
                        styles.recIconContainer,
                        { backgroundColor: getMethodColor(rec.method, index) },
                      ]}
                    >
                      {getMethodIcon(rec.method)}
                    </View>
                    <View style={styles.recTitleContainer}>
                      <Text style={styles.recTitle}>{getMethodName(rec.method)}</Text>
                      <View style={styles.recStats}>
                        <View style={styles.recStat}>
                          <Clock size={14} color="#64748B" />
                          <Text style={styles.recStatText}>{formatTime(rec.timeEstimate)}</Text>
                        </View>
                        <View style={styles.recStat}>
                          <DollarSign size={14} color="#64748B" />
                          <Text style={styles.recStatText}>${rec.costEstimate.toFixed(2)} materials</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.prosConsContainer}>
                    <View style={styles.prosSection}>
                      <Text style={styles.prosConsTitle}>Pros</Text>
                      {rec.pros.slice(0, 3).map((pro, i) => (
                        <View key={i} style={styles.prosConsItem}>
                          <CheckCircle size={12} color="#10B981" />
                          <Text style={styles.prosConsText}>{pro}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.consSection}>
                      <Text style={styles.prosConsTitle}>Cons</Text>
                      {rec.cons.slice(0, 3).map((con, i) => (
                        <View key={i} style={styles.prosConsItem}>
                          <AlertCircle size={12} color="#EF4444" />
                          <Text style={styles.prosConsText}>{con}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.tipsSection}>
                    <Text style={styles.tipsTitle}>Pro Tips</Text>
                    {rec.tips.slice(0, 2).map((tip, i) => (
                      <View key={i} style={styles.tipItem}>
                        <Wind size={12} color="#3B82F6" />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <RotateCcw size={18} color="#3B82F6" />
                <Text style={styles.resetButtonText}>Calculate Again</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconOverlap: {
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 12,
  },
  areaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  areaInput: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    marginLeft: 12,
  },
  areaUnit: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  quickAreaButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  quickAreaButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickAreaButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quickAreaButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#94A3B8',
  },
  quickAreaButtonTextActive: {
    color: '#fff',
  },
  surfaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  surfaceCard: {
    width: '31%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  surfaceCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
  },
  surfaceIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  surfaceName: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  surfaceNameSelected: {
    color: '#fff',
  },
  surfaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  surfaceInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  calculateButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  recommendationCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recommendationCardBest: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
    gap: 4,
  },
  bestBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitleContainer: {
    flex: 1,
    marginLeft: 14,
  },
  recTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  recStats: {
    flexDirection: 'row',
    gap: 16,
  },
  recStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recStatText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  prosConsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  prosSection: {
    flex: 1,
  },
  consSection: {
    flex: 1,
  },
  prosConsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  prosConsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  prosConsText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  tipsSection: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#3B82F6',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#3B82F6',
  },
});
