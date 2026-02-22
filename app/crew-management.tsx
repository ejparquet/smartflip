import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  Plus,
  Users,
  Phone,
  Mail,
  Star,
  Clock,
  CheckCircle,
  Calendar,
  Briefcase,
  DollarSign,
  Edit3,
  X,
  HardHat,
  Wrench,
  Zap,
  Droplets,
  Shovel,
  Hammer,
  Layers,
  Waves,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import { Professional } from "@/types";

type CrewMemberRole = "foreman" | "excavator" | "plumber" | "electrician" | "steel_worker" | "gunite_operator" | "tile_setter" | "plaster_finisher" | "laborer" | "crew_lead" | "irrigation_tech" | "hardscape_installer" | "plant_specialist" | "equipment_operator" | "lawn_tech";
type CrewMemberStatus = "available" | "on_job" | "off" | "vacation";

interface CrewMember {
  id: string;
  name: string;
  avatar: string;
  role: CrewMemberRole;
  phone: string;
  email: string;
  hourlyRate: number;
  status: CrewMemberStatus;
  currentProject?: string;
  rating: number;
  yearsExperience: number;
  skills: string[];
  certifications: string[];
  joinedDate: string;
  hoursThisWeek: number;
  projectsCompleted: number;
}

interface Subcontractor {
  id: string;
  companyName: string;
  contactName: string;
  logo: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  hourlyRate: string;
  isPreferred: boolean;
  lastWorkedWith: string;
  projectsCompleted: number;
}

const mockLandscapeCrewMembers: CrewMember[] = [
  {
    id: "lcm1",
    name: "Carlos Rivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    role: "crew_lead",
    phone: "(512) 555-0201",
    email: "carlos.r@landscapecrew.com",
    hourlyRate: 38,
    status: "on_job",
    currentProject: "Mueller Flip Full Landscape",
    rating: 4.9,
    yearsExperience: 12,
    skills: ["Project Management", "Design Implementation", "Client Relations"],
    certifications: ["Licensed Irrigator", "OSHA 30", "Pesticide Applicator"],
    joinedDate: "2019-05-15",
    hoursThisWeek: 44,
    projectsCompleted: 124,
  },
  {
    id: "lcm2",
    name: "Miguel Santos",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    role: "irrigation_tech",
    phone: "(512) 555-0202",
    email: "miguel.s@landscapecrew.com",
    hourlyRate: 32,
    status: "on_job",
    currentProject: "Mueller Flip Full Landscape",
    rating: 4.8,
    yearsExperience: 8,
    skills: ["Drip Systems", "Sprinkler Installation", "Smart Controllers"],
    certifications: ["Licensed Irrigator", "Rain Bird Certified"],
    joinedDate: "2021-03-10",
    hoursThisWeek: 40,
    projectsCompleted: 78,
  },
  {
    id: "lcm3",
    name: "David Thompson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    role: "hardscape_installer",
    phone: "(512) 555-0203",
    email: "david.t@landscapecrew.com",
    hourlyRate: 35,
    status: "available",
    rating: 4.7,
    yearsExperience: 10,
    skills: ["Paver Installation", "Retaining Walls", "Concrete Work"],
    certifications: ["ICPI Certified", "NCMA Certified"],
    joinedDate: "2020-08-22",
    hoursThisWeek: 36,
    projectsCompleted: 92,
  },
  {
    id: "lcm4",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    role: "plant_specialist",
    phone: "(512) 555-0204",
    email: "sarah.c@landscapecrew.com",
    hourlyRate: 30,
    status: "on_job",
    currentProject: "South Austin Backyard Oasis",
    rating: 4.9,
    yearsExperience: 7,
    skills: ["Native Plants", "Garden Design", "Tree Care"],
    certifications: ["ISA Certified Arborist", "Texas Master Gardener"],
    joinedDate: "2022-01-15",
    hoursThisWeek: 38,
    projectsCompleted: 56,
  },
  {
    id: "lcm5",
    name: "Roberto Garcia",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
    role: "equipment_operator",
    phone: "(512) 555-0205",
    email: "roberto.g@landscapecrew.com",
    hourlyRate: 34,
    status: "available",
    rating: 4.6,
    yearsExperience: 15,
    skills: ["Skid Steer", "Mini Excavator", "Trencher Operation"],
    certifications: ["Heavy Equipment License", "OSHA 10"],
    joinedDate: "2018-11-05",
    hoursThisWeek: 32,
    projectsCompleted: 145,
  },
  {
    id: "lcm6",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    role: "lawn_tech",
    phone: "(512) 555-0206",
    email: "james.w@landscapecrew.com",
    hourlyRate: 26,
    status: "on_job",
    currentProject: "Commercial Lawn Maintenance",
    rating: 4.5,
    yearsExperience: 4,
    skills: ["Sod Installation", "Lawn Maintenance", "Fertilization"],
    certifications: ["Pesticide Applicator"],
    joinedDate: "2023-04-20",
    hoursThisWeek: 40,
    projectsCompleted: 34,
  },
];

const mockLandscapeSubcontractors: Subcontractor[] = [
  {
    id: "lsub1",
    companyName: "Austin Tree Services",
    contactName: "Mike Johnson",
    logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    specialty: "Tree Installation & Removal",
    phone: "(512) 555-3001",
    email: "mike@austintreeservices.com",
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: "$85-125/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-22",
    projectsCompleted: 42,
  },
  {
    id: "lsub2",
    companyName: "Hill Country Irrigation",
    contactName: "Tom Davis",
    logo: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200",
    specialty: "Commercial Irrigation Systems",
    phone: "(512) 555-3002",
    email: "tom@hillcountryirrigation.com",
    rating: 4.7,
    reviewCount: 89,
    hourlyRate: "$65-95/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-18",
    projectsCompleted: 38,
  },
  {
    id: "lsub3",
    companyName: "Stone & Paver Pros",
    contactName: "Juan Rodriguez",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    specialty: "Hardscape & Patio Installation",
    phone: "(512) 555-3003",
    email: "juan@stonepaverpros.com",
    rating: 4.8,
    reviewCount: 112,
    hourlyRate: "$55-85/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-25",
    projectsCompleted: 56,
  },
  {
    id: "lsub4",
    companyName: "Green Thumb Nursery",
    contactName: "Lisa Thompson",
    logo: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200",
    specialty: "Plant Supply & Consultation",
    phone: "(512) 555-3004",
    email: "lisa@greenthumb.com",
    rating: 4.6,
    reviewCount: 78,
    hourlyRate: "$45-65/hr",
    isPreferred: false,
    lastWorkedWith: "2026-01-10",
    projectsCompleted: 28,
  },
];

const mockCrewMembers: CrewMember[] = [
  {
    id: "cm1",
    name: "Mike Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    role: "foreman",
    phone: "(512) 555-0101",
    email: "mike.r@poolcrew.com",
    hourlyRate: 48,
    status: "on_job",
    currentProject: "Johnson Infinity Pool",
    rating: 4.9,
    yearsExperience: 18,
    skills: ["Project Management", "Pool Design", "Quality Control"],
    certifications: ["CPO Certified", "OSHA 30", "First Aid"],
    joinedDate: "2018-03-15",
    hoursThisWeek: 42,
    projectsCompleted: 156,
  },
  {
    id: "cm2",
    name: "Carlos Martinez",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    role: "excavator",
    phone: "(512) 555-0102",
    email: "carlos.m@poolcrew.com",
    hourlyRate: 42,
    status: "on_job",
    currentProject: "Smith Family Pool",
    rating: 4.8,
    yearsExperience: 12,
    skills: ["Excavation", "Grading", "Heavy Equipment"],
    certifications: ["Heavy Equipment License", "OSHA 10"],
    joinedDate: "2020-06-20",
    hoursThisWeek: 40,
    projectsCompleted: 89,
  },
  {
    id: "cm3",
    name: "David Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    role: "electrician",
    phone: "(512) 555-0103",
    email: "david.c@poolcrew.com",
    hourlyRate: 55,
    status: "available",
    rating: 4.8,
    yearsExperience: 14,
    skills: ["Pool Lighting", "Pump Wiring", "Control Systems"],
    certifications: ["Master Electrician", "Pool Electric Specialist", "OSHA 30"],
    joinedDate: "2019-11-10",
    hoursThisWeek: 32,
    projectsCompleted: 134,
  },
  {
    id: "cm4",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
    role: "plumber",
    phone: "(512) 555-0104",
    email: "james.w@poolcrew.com",
    hourlyRate: 52,
    status: "on_job",
    currentProject: "Martinez Spa & Pool",
    rating: 4.7,
    yearsExperience: 11,
    skills: ["Pool Plumbing", "Filtration Systems", "Spa Jets"],
    certifications: ["Master Plumber", "Pool Plumbing Specialist", "OSHA 10"],
    joinedDate: "2021-01-05",
    hoursThisWeek: 38,
    projectsCompleted: 78,
  },
  {
    id: "cm5",
    name: "Roberto Garcia",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
    role: "gunite_operator",
    phone: "(512) 555-0105",
    email: "roberto.g@poolcrew.com",
    hourlyRate: 45,
    status: "available",
    rating: 4.9,
    yearsExperience: 15,
    skills: ["Gunite Application", "Shotcrete", "Shell Construction"],
    certifications: ["ACI Shotcrete Nozzleman", "OSHA 10"],
    joinedDate: "2019-04-12",
    hoursThisWeek: 36,
    projectsCompleted: 112,
  },
  {
    id: "cm6",
    name: "Tony Hernandez",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
    role: "tile_setter",
    phone: "(512) 555-0106",
    email: "tony.h@poolcrew.com",
    hourlyRate: 40,
    status: "on_job",
    currentProject: "Davis Backyard Oasis",
    rating: 4.8,
    yearsExperience: 9,
    skills: ["Pool Tile", "Coping", "Waterline Tile", "Mosaics"],
    certifications: ["Tile Setter Certification", "OSHA 10"],
    joinedDate: "2021-09-01",
    hoursThisWeek: 40,
    projectsCompleted: 67,
  },
  {
    id: "cm7",
    name: "Marcus Johnson",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
    role: "plaster_finisher",
    phone: "(512) 555-0107",
    email: "marcus.j@poolcrew.com",
    hourlyRate: 42,
    status: "available",
    rating: 4.7,
    yearsExperience: 8,
    skills: ["Pebble Finish", "Plaster Application", "Pool Resurfacing"],
    certifications: ["NPP Applicator", "OSHA 10"],
    joinedDate: "2022-02-15",
    hoursThisWeek: 0,
    projectsCompleted: 54,
  },
  {
    id: "cm8",
    name: "Luis Ramirez",
    avatar: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=200",
    role: "steel_worker",
    phone: "(512) 555-0108",
    email: "luis.r@poolcrew.com",
    hourlyRate: 38,
    status: "on_job",
    currentProject: "Johnson Infinity Pool",
    rating: 4.6,
    yearsExperience: 6,
    skills: ["Rebar Installation", "Steel Framing", "Structural Support"],
    certifications: ["Ironworker Certification", "OSHA 10"],
    joinedDate: "2023-01-10",
    hoursThisWeek: 42,
    projectsCompleted: 38,
  },
];

const mockSubcontractors: Subcontractor[] = [
  {
    id: "sub1",
    companyName: "AquaTech Pool Equipment",
    contactName: "Steve Johnson",
    logo: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200",
    specialty: "Pool Equipment & Pumps",
    phone: "(512) 555-1001",
    email: "steve@aquatechpools.com",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: "$75-95/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-20",
    projectsCompleted: 48,
  },
  {
    id: "sub2",
    companyName: "Blue Wave Landscaping",
    contactName: "Mark Davis",
    logo: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=200",
    specialty: "Pool Landscaping & Decking",
    phone: "(512) 555-1002",
    email: "mark@bluewavelandscape.com",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: "$55-75/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-18",
    projectsCompleted: 36,
  },
  {
    id: "sub3",
    companyName: "Pool Heater Pros",
    contactName: "Lisa Thompson",
    logo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200",
    specialty: "Pool Heating Systems",
    phone: "(512) 555-1003",
    email: "lisa@poolheaterpros.com",
    rating: 4.6,
    reviewCount: 56,
    hourlyRate: "$80-110/hr",
    isPreferred: false,
    lastWorkedWith: "2025-12-10",
    projectsCompleted: 22,
  },
  {
    id: "sub4",
    companyName: "Concrete Masters",
    contactName: "Juan Rodriguez",
    logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200",
    specialty: "Pool Decking & Coping",
    phone: "(512) 555-1004",
    email: "juan@concretemasters.com",
    rating: 4.8,
    reviewCount: 72,
    hourlyRate: "$55-75/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-15",
    projectsCompleted: 31,
  },
  {
    id: "sub5",
    companyName: "WaterFeature Designs",
    contactName: "Sarah Miller",
    logo: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    specialty: "Water Features & Fountains",
    phone: "(512) 555-1005",
    email: "sarah@waterfeaturedesigns.com",
    rating: 4.9,
    reviewCount: 64,
    hourlyRate: "$85-120/hr",
    isPreferred: true,
    lastWorkedWith: "2026-01-22",
    projectsCompleted: 27,
  },
];

type TabType = "crew" | "subcontractors";

export default function CrewManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const professional = user as Professional | null;
  const isLandscaper = professional?.professionalType === "landscaper";
  const [activeTab, setActiveTab] = useState<TabType>("crew");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<CrewMemberRole | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(isLandscaper ? mockLandscapeCrewMembers : mockCrewMembers);
  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    email: "",
    role: "laborer" as CrewMemberRole,
    hourlyRate: "",
  });

  const poolBuilderRoles: CrewMemberRole[] = ["foreman", "excavator", "plumber", "electrician", "steel_worker", "gunite_operator", "tile_setter", "plaster_finisher", "laborer"];
  const landscaperRoles: CrewMemberRole[] = ["crew_lead", "irrigation_tech", "hardscape_installer", "plant_specialist", "equipment_operator", "lawn_tech"];
  const availableRoles = isLandscaper ? landscaperRoles : poolBuilderRoles;

  const crewData = crewMembers;
  const subData = isLandscaper ? mockLandscapeSubcontractors : mockSubcontractors;

  const isAdmin = user?.role === "professional" && (user as any)?.isAdmin !== false;
  const currentUserId = user?.id || "";

  const canEditMember = (memberId: string) => {
    if (isAdmin) return true;
    return memberId === currentUserId;
  };

  const handleEditMember = (member: CrewMember) => {
    if (!canEditMember(member.id)) {
      Alert.alert(
        "Permission Denied",
        "You don't have permission to edit this team member's profile. Only admins can edit other members."
      );
      return;
    }
    Alert.alert("Edit Profile", `Editing ${member.name}'s profile`);
  };

  const getRoleIcon = (role: CrewMemberRole) => {
    switch (role) {
      case "foreman": return HardHat;
      case "excavator": return Shovel;
      case "plumber": return Droplets;
      case "electrician": return Zap;
      case "steel_worker": return Hammer;
      case "gunite_operator": return Waves;
      case "tile_setter": return Layers;
      case "plaster_finisher": return Wrench;
      case "laborer": return Users;
      case "crew_lead": return HardHat;
      case "irrigation_tech": return Droplets;
      case "hardscape_installer": return Layers;
      case "plant_specialist": return Shovel;
      case "equipment_operator": return Wrench;
      case "lawn_tech": return Users;
      default: return Users;
    }
  };

  const getRoleColor = (role: CrewMemberRole) => {
    switch (role) {
      case "foreman": return "#272D53";
      case "excavator": return "#8B5CF6";
      case "plumber": return "#06B6D4";
      case "electrician": return "#3B82F6";
      case "steel_worker": return "#EF4444";
      case "gunite_operator": return "#10B981";
      case "tile_setter": return "#EC4899";
      case "plaster_finisher": return "#14B8A6";
      case "laborer": return "#6B7280";
      case "crew_lead": return "#22C55E";
      case "irrigation_tech": return "#3B82F6";
      case "hardscape_installer": return "#78716C";
      case "plant_specialist": return "#10B981";
      case "equipment_operator": return "#272D53";
      case "lawn_tech": return "#22C55E";
      default: return Colors.textSecondary;
    }
  };

  const getRoleLabel = (role: CrewMemberRole) => {
    switch (role) {
      case "foreman": return "Foreman";
      case "excavator": return "Excavator";
      case "plumber": return "Pool Plumber";
      case "electrician": return "Pool Electric";
      case "steel_worker": return "Steel/Rebar";
      case "gunite_operator": return "Gunite Tech";
      case "tile_setter": return "Tile Setter";
      case "plaster_finisher": return "Plaster Tech";
      case "laborer": return "Laborer";
      case "crew_lead": return "Crew Lead";
      case "irrigation_tech": return "Irrigation Tech";
      case "hardscape_installer": return "Hardscape";
      case "plant_specialist": return "Plant Specialist";
      case "equipment_operator": return "Equipment Op";
      case "lawn_tech": return "Lawn Tech";
      default: return role;
    }
  };

  const getStatusColor = (status: CrewMemberStatus) => {
    switch (status) {
      case "available": return Colors.success;
      case "on_job": return "#3B82F6";
      case "off": return Colors.textSecondary;
      case "vacation": return "#272D53";
    }
  };

  const getStatusLabel = (status: CrewMemberStatus) => {
    switch (status) {
      case "available": return "Available";
      case "on_job": return "On Job";
      case "off": return "Off Today";
      case "vacation": return "Vacation";
    }
  };

  const filteredCrew = crewData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAddCrewMember = () => {
    if (!newMember.name || !newMember.phone || !newMember.email) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    const newCrewMember: CrewMember = {
      id: `cm${Date.now()}`,
      name: newMember.name,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      role: newMember.role,
      phone: newMember.phone,
      email: newMember.email,
      hourlyRate: parseFloat(newMember.hourlyRate) || 25,
      status: "available",
      rating: 4.5,
      yearsExperience: 1,
      skills: [],
      certifications: [],
      joinedDate: new Date().toISOString().split("T")[0],
      hoursThisWeek: 0,
      projectsCompleted: 0,
    };
    setCrewMembers(prev => [newCrewMember, ...prev]);
    setShowAddModal(false);
    setNewMember({ name: "", phone: "", email: "", role: "laborer", hourlyRate: "" });
    Alert.alert("Success", `${newMember.name} has been added to your crew!`);
  };

  const filteredSubs = subData.filter(sub =>
    sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalCrew: crewData.length,
    available: crewData.filter(m => m.status === "available").length,
    onJob: crewData.filter(m => m.status === "on_job").length,
    totalHours: crewData.reduce((sum, m) => sum + m.hoursThisWeek, 0),
  };

  const renderCrewMemberCard = (member: CrewMember) => {
    const RoleIcon = getRoleIcon(member.role);
    return (
      <TouchableOpacity 
        key={member.id} 
        style={styles.memberCard}
        onPress={() => setSelectedMember(member)}
      >
        <View style={styles.memberHeader}>
          <Image source={{ uri: member.avatar }} style={styles.memberAvatar} contentFit="cover" />
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{member.name}</Text>
            <View style={styles.memberRoleRow}>
              <View style={[styles.roleIcon, { backgroundColor: `${getRoleColor(member.role)}20` }]}>
                <RoleIcon size={12} color={getRoleColor(member.role)} />
              </View>
              <Text style={[styles.memberRole, { color: getRoleColor(member.role) }]}>
                {getRoleLabel(member.role)}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(member.status)}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(member.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(member.status) }]}>
              {getStatusLabel(member.status)}
            </Text>
          </View>
        </View>

        {member.currentProject && (
          <View style={styles.currentProjectRow}>
            <Briefcase size={14} color={Colors.textSecondary} />
            <Text style={styles.currentProjectText}>{member.currentProject}</Text>
          </View>
        )}

        <View style={styles.memberStats}>
          <View style={styles.memberStat}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.memberStatValue}>{member.rating}</Text>
          </View>
          <View style={styles.memberStat}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.memberStatValue}>{member.hoursThisWeek}h/wk</Text>
          </View>
          <View style={styles.memberStat}>
            <DollarSign size={14} color={Colors.success} />
            <Text style={styles.memberStatValue}>${member.hourlyRate}/hr</Text>
          </View>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Phone size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Mail size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.assignBtn, { backgroundColor: isLandscaper ? "#22C55E" : "#272D53" }]}
            onPress={() => {
              Alert.alert(
                "Assign to Job",
                `Select a project to assign ${member.name}`,
                [
                  { text: "Mueller Flip Full Landscape", onPress: () => Alert.alert("Success", `${member.name} assigned to Mueller Flip Full Landscape`) },
                  { text: "South Austin Backyard Oasis", onPress: () => Alert.alert("Success", `${member.name} assigned to South Austin Backyard Oasis`) },
                  { text: "Cancel", style: "cancel" },
                ]
              );
            }}
          >
            <Text style={styles.assignBtnText}>Assign to Job</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubcontractorCard = (sub: Subcontractor) => (
    <TouchableOpacity key={sub.id} style={styles.subCard}>
      <View style={styles.subHeader}>
        <Image source={{ uri: sub.logo }} style={styles.subLogo} contentFit="cover" />
        <View style={styles.subInfo}>
          <View style={styles.subNameRow}>
            <Text style={styles.subName}>{sub.companyName}</Text>
            {sub.isPreferred && (
              <View style={styles.preferredBadge}>
                <Star size={10} color={Colors.warning} fill={Colors.warning} />
                <Text style={styles.preferredText}>Preferred</Text>
              </View>
            )}
          </View>
          <Text style={styles.subContact}>{sub.contactName}</Text>
          <View style={styles.subSpecialtyRow}>
            <Wrench size={12} color={Colors.textSecondary} />
            <Text style={styles.subSpecialty}>{sub.specialty}</Text>
          </View>
        </View>
      </View>

      <View style={styles.subStats}>
        <View style={styles.subStat}>
          <Star size={14} color={Colors.warning} fill={Colors.warning} />
          <Text style={styles.subStatValue}>{sub.rating}</Text>
          <Text style={styles.subStatLabel}>({sub.reviewCount})</Text>
        </View>
        <View style={styles.subStat}>
          <DollarSign size={14} color={Colors.success} />
          <Text style={styles.subStatValue}>{sub.hourlyRate}</Text>
        </View>
        <View style={styles.subStat}>
          <CheckCircle size={14} color={Colors.primary} />
          <Text style={styles.subStatValue}>{sub.projectsCompleted}</Text>
          <Text style={styles.subStatLabel}>jobs</Text>
        </View>
      </View>

      <View style={styles.subFooter}>
        <Text style={styles.lastWorkedText}>
          Last worked: {new Date(sub.lastWorkedWith).toLocaleDateString()}
        </Text>
        <View style={styles.subActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert("Call", `Calling ${sub.contactName} at ${sub.phone}`);
            }}
          >
            <Phone size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => {
              Alert.alert("Email", `Opening email to ${sub.email}`);
            }}
          >
            <Mail size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.contactSubBtn, { backgroundColor: isLandscaper ? "#22C55E" : "#272D53" }]}
            onPress={() => {
              Alert.alert(
                "Request Quote",
                `Send a quote request to ${sub.companyName}?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Send Request", onPress: () => Alert.alert("Sent", `Quote request sent to ${sub.contactName} at ${sub.companyName}`) },
                ]
              );
            }}
          >
            <Text style={styles.contactSubText}>Request Quote</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: isLandscaper ? "Landscape Crew" : "Pool Builder Crew",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerSection}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={18} color="#272D53" />
            <Text style={styles.statValue}>{stats.totalCrew}</Text>
            <Text style={styles.statLabel}>Team</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle size={18} color={Colors.success} />
            <Text style={styles.statValue}>{stats.available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Briefcase size={18} color="#3B82F6" />
            <Text style={styles.statValue}>{stats.onJob}</Text>
            <Text style={styles.statLabel}>On Job</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={18} color={Colors.textSecondary} />
            <Text style={styles.statValue}>{stats.totalHours}</Text>
            <Text style={styles.statLabel}>Hrs/Wk</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "crew" && styles.tabActive]}
            onPress={() => setActiveTab("crew")}
          >
            <Users size={16} color={activeTab === "crew" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "crew" && styles.tabTextActive]}>
              My Crew
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "subcontractors" && styles.tabActive]}
            onPress={() => setActiveTab("subcontractors")}
          >
            <Briefcase size={16} color={activeTab === "subcontractors" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === "subcontractors" && styles.tabTextActive]}>
              Subcontractors
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === "crew" ? "Search crew members..." : "Search subcontractors..."}
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {activeTab === "crew" && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          {(isLandscaper 
            ? ["all", "crew_lead", "irrigation_tech", "hardscape_installer", "plant_specialist", "equipment_operator", "lawn_tech"] as const
            : ["all", "foreman", "excavator", "plumber", "electrician", "gunite_operator", "tile_setter", "laborer"] as const
          ).map(role => (
            <TouchableOpacity
              key={role}
              style={[styles.filterChip, filterRole === role && styles.filterChipActive]}
              onPress={() => setFilterRole(role)}
            >
              <Text style={[styles.filterChipText, filterRole === role && styles.filterChipTextActive]}>
                {role === "all" ? "All" : getRoleLabel(role)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "crew" && (
          <>
            {filteredCrew.map(member => renderCrewMemberCard(member))}
            {filteredCrew.length === 0 && (
              <View style={styles.emptyState}>
                <Users size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTitle}>No Crew Members Found</Text>
                <Text style={styles.emptyStateSubtitle}>Try adjusting your filters</Text>
              </View>
            )}
          </>
        )}

        {activeTab === "subcontractors" && (
          <>
            {filteredSubs.map(sub => renderSubcontractorCard(sub))}
            {filteredSubs.length === 0 && (
              <View style={styles.emptyState}>
                <Briefcase size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTitle}>No Subcontractors Found</Text>
                <Text style={styles.emptyStateSubtitle}>Add trusted partners to your network</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={selectedMember !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedMember(null)}
      >
        {selectedMember && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team Member</Text>
              <TouchableOpacity onPress={() => setSelectedMember(null)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <View style={styles.profileSection}>
                <Image source={{ uri: selectedMember.avatar }} style={styles.profileAvatar} contentFit="cover" />
                <Text style={styles.profileName}>{selectedMember.name}</Text>
                <View style={[styles.profileRoleBadge, { backgroundColor: `${getRoleColor(selectedMember.role)}15` }]}>
                  <Text style={[styles.profileRoleText, { color: getRoleColor(selectedMember.role) }]}>
                    {getRoleLabel(selectedMember.role)}
                  </Text>
                </View>
              </View>

              <View style={styles.contactSection}>
                <TouchableOpacity style={styles.contactRow}>
                  <Phone size={18} color={Colors.primary} />
                  <Text style={styles.contactText}>{selectedMember.phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactRow}>
                  <Mail size={18} color={Colors.primary} />
                  <Text style={styles.contactText}>{selectedMember.email}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Star size={20} color={Colors.warning} fill={Colors.warning} />
                  <Text style={styles.detailValue}>{selectedMember.rating}</Text>
                  <Text style={styles.detailLabel}>Rating</Text>
                </View>
                <View style={styles.detailCard}>
                  <Calendar size={20} color={Colors.primary} />
                  <Text style={styles.detailValue}>{selectedMember.yearsExperience} yrs</Text>
                  <Text style={styles.detailLabel}>Experience</Text>
                </View>
                <View style={styles.detailCard}>
                  <CheckCircle size={20} color={Colors.success} />
                  <Text style={styles.detailValue}>{selectedMember.projectsCompleted}</Text>
                  <Text style={styles.detailLabel}>Projects</Text>
                </View>
                <View style={styles.detailCard}>
                  <DollarSign size={20} color={Colors.success} />
                  <Text style={styles.detailValue}>${selectedMember.hourlyRate}</Text>
                  <Text style={styles.detailLabel}>Per Hour</Text>
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.skillsTags}>
                  {selectedMember.skills.map((skill, idx) => (
                    <View key={idx} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                <View style={styles.certList}>
                  {selectedMember.certifications.map((cert, idx) => (
                    <View key={idx} style={styles.certRow}>
                      <CheckCircle size={16} color={Colors.success} />
                      <Text style={styles.certText}>{cert}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                {canEditMember(selectedMember.id) ? (
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEditMember(selectedMember)}>
                    <Edit3 size={18} color={Colors.text} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.editBtn, styles.editBtnDisabled]} 
                    onPress={() => handleEditMember(selectedMember)}
                  >
                    <Edit3 size={18} color={Colors.textTertiary} />
                    <Text style={[styles.editBtnText, { color: Colors.textTertiary }]}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.assignJobBtn, { backgroundColor: isLandscaper ? "#22C55E" : "#272D53" }]}
                  onPress={() => {
                    Alert.alert(
                      "Assign to Job",
                      `Select a project to assign ${selectedMember.name}`,
                      [
                        { text: "Mueller Flip Full Landscape", onPress: () => { Alert.alert("Success", `${selectedMember.name} assigned to Mueller Flip Full Landscape`); setSelectedMember(null); } },
                        { text: "South Austin Backyard Oasis", onPress: () => { Alert.alert("Success", `${selectedMember.name} assigned to South Austin Backyard Oasis`); setSelectedMember(null); } },
                        { text: "Cancel", style: "cancel" },
                      ]
                    );
                  }}
                >
                  <Briefcase size={18} color={Colors.white} />
                  <Text style={styles.assignJobText}>Assign to Job</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Crew Member</Text>
            <TouchableOpacity onPress={handleAddCrewMember}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter full name"
                placeholderTextColor={Colors.textTertiary}
                value={newMember.name}
                onChangeText={(text) => setNewMember(prev => ({ ...prev, name: text }))}
              />
              <Text style={styles.formLabel}>Phone *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="(512) 555-0000"
                placeholderTextColor={Colors.textTertiary}
                value={newMember.phone}
                onChangeText={(text) => setNewMember(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="email@example.com"
                placeholderTextColor={Colors.textTertiary}
                value={newMember.email}
                onChangeText={(text) => setNewMember(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.formLabel}>Role *</Text>
              <View style={styles.roleOptions}>
                {availableRoles.map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      newMember.role === role && { backgroundColor: getRoleColor(role), borderColor: getRoleColor(role) }
                    ]}
                    onPress={() => setNewMember(prev => ({ ...prev, role }))}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      newMember.role === role && { color: Colors.white }
                    ]}>
                      {getRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.formLabel}>Hourly Rate</Text>
              <View style={styles.rateInputWrapper}>
                <Text style={styles.ratePrefix}>$</Text>
                <TextInput
                  style={styles.rateInput}
                  placeholder="25"
                  placeholderTextColor={Colors.textTertiary}
                  value={newMember.hourlyRate}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, hourlyRate: text }))}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.rateSuffix}>/hr</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  headerSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabActive: {
    backgroundColor: "#22C55E",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  searchSection: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#272D53",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChips: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  memberCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  memberAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  memberRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  roleIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  memberRole: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  currentProjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surfaceSecondary,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  currentProjectText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  memberStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  memberStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberStatValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  memberActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  assignBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#272D53",
    alignItems: "center",
  },
  assignBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  subCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  subLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 12,
  },
  subInfo: {
    flex: 1,
  },
  subNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  subName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  preferredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8E9EE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  preferredText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#B45309",
  },
  subContact: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  subSpecialtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  subSpecialty: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  subStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  subStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subStatValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  subStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastWorkedText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subActions: {
    flexDirection: "row",
    gap: 8,
  },
  contactSubBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#272D53",
  },
  contactSubText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  profileRoleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileRoleText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  contactSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  detailCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  skillsTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  certList: {
    gap: 10,
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  certText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  assignJobBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#272D53",
  },
  assignJobText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  editBtnDisabled: {
    backgroundColor: Colors.borderLight,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0EA5E9",
  },
  formSection: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  roleOptions: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: "transparent",
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  rateInputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  ratePrefix: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  rateInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 14,
    marginLeft: 4,
  },
  rateSuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
