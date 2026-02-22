import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Check,
  X,
  Briefcase,
  Home,
  Hammer,
  Plus,
  Waves,
  Shovel,
  Droplets,
  Wrench,
  ClipboardCheck,
  Sparkles,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/contexts/ServiceContext";
import { useInvitations } from "@/contexts/InvitationsContext";
import { Professional, ProfessionalType } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAY_WIDTH = (SCREEN_WIDTH - 40) / 7;

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
  projectId?: string;
  projectName?: string;
  color: string;
  professionalType?: ProfessionalType;
  participants?: { id: string; name: string; avatar: string }[];
}

interface GroupProjectInvite {
  id: string;
  projectName: string;
  projectType: string;
  address: string;
  image: string;
  invitedBy: {
    name: string;
    avatar: string;
    role: string;
  };
  estimatedBudget: string;
  timeline: string;
  startDate: string;
  teamSize: number;
  description: string;
  yourRole: string;
  invitedDate: string;
  status: "pending" | "accepted" | "declined";
}

const getEventsForProfessionalType = (type: ProfessionalType | undefined): CalendarEvent[] => {
  switch (type) {
    case "realtor":
      return [
        {
          id: "re1",
          title: "Property Showing - Oak Valley",
          date: "2026-01-28",
          startTime: "10:00 AM",
          endTime: "11:00 AM",
          type: "showing",
          location: "1234 Oak Valley Dr, Austin, TX",
          projectName: "Oak Valley Flip",
          color: "#8B5CF6",
          professionalType: "realtor",
          participants: [
            { id: "p1", name: "John & Mary Smith", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
          ],
        },
        {
          id: "re2",
          title: "Listing Appointment",
          date: "2026-01-28",
          startTime: "2:00 PM",
          endTime: "3:30 PM",
          type: "listing_appointment",
          location: "567 Lakefront Blvd, Austin, TX",
          projectName: "Lakefront Listing",
          color: "#10B981",
          professionalType: "realtor",
        },
        {
          id: "re3",
          title: "Investor Strategy Call",
          date: "2026-01-29",
          startTime: "9:00 AM",
          endTime: "10:00 AM",
          type: "strategy_call",
          projectName: "Investment Property",
          color: "#272D53",
          professionalType: "realtor",
          participants: [
            { id: "p2", name: "Marcus Thompson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
          ],
        },
        {
          id: "re4",
          title: "Open House",
          date: "2026-01-30",
          startTime: "1:00 PM",
          endTime: "4:00 PM",
          type: "open_house",
          location: "890 Commerce St, Round Rock, TX",
          projectName: "Commerce Property",
          color: "#EC4899",
          professionalType: "realtor",
        },
        {
          id: "re5",
          title: "Closing Meeting",
          date: "2026-02-01",
          startTime: "11:00 AM",
          endTime: "12:30 PM",
          type: "closing",
          location: "Title Company - 456 Main St",
          projectName: "Cedar Park Flip",
          color: "#22C55E",
          professionalType: "realtor",
          participants: [
            { id: "p3", name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
          ],
        },
        {
          id: "re6",
          title: "Market Analysis Meeting",
          date: "2026-02-02",
          startTime: "3:00 PM",
          endTime: "4:00 PM",
          type: "meeting",
          location: "Office",
          color: "#3B82F6",
          professionalType: "realtor",
        },
        {
          id: "re7",
          title: "Contract Deadline",
          date: "2026-02-05",
          startTime: "5:00 PM",
          endTime: "5:00 PM",
          type: "deadline",
          projectName: "Lakefront Listing",
          color: "#EF4444",
          professionalType: "realtor",
        },
      ];
    case "pool_company":
      return [
        {
          id: "e1",
          title: "Pool Excavation Start",
          date: "2026-01-28",
          startTime: "7:00 AM",
          endTime: "5:00 PM",
          type: "excavation",
          location: "456 Lakeview Dr, Austin, TX",
          projectName: "Rodriguez Family Pool",
          color: "#D97706",
          professionalType: "pool_company",
          participants: [
            { id: "p1", name: "Carlos Martinez", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
            { id: "p2", name: "Jake Thompson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
          ],
        },
        {
          id: "e2",
          title: "Plumbing & Steel Install",
          date: "2026-01-28",
          startTime: "1:00 PM",
          endTime: "6:00 PM",
          type: "plumbing",
          location: "789 Hillside Ave, Round Rock, TX",
          projectName: "Johnson Infinity Pool",
          color: "#0EA5E9",
          professionalType: "pool_company",
        },
        {
          id: "e3",
          title: "County Pool Inspection",
          date: "2026-01-29",
          startTime: "10:00 AM",
          endTime: "11:00 AM",
          type: "inspection",
          location: "123 Pine Ave, Cedar Park, TX",
          projectName: "Wilson Spa & Pool",
          color: "#8B5CF6",
          professionalType: "pool_company",
        },
        {
          id: "e4",
          title: "Gunite Shell Pour",
          date: "2026-01-30",
          startTime: "6:00 AM",
          endTime: "3:00 PM",
          type: "gunite",
          location: "456 Lakeview Dr, Austin, TX",
          projectName: "Rodriguez Family Pool",
          color: "#64748B",
          professionalType: "pool_company",
        },
        {
          id: "e5",
          title: "Tile & Coping Deadline",
          date: "2026-02-05",
          startTime: "5:00 PM",
          endTime: "5:00 PM",
          type: "deadline",
          projectName: "Johnson Infinity Pool",
          color: "#EF4444",
          professionalType: "pool_company",
        },
      ];
    case "electrician":
      return [
        {
          id: "ee1",
          title: "Panel Upgrade - 200A Service",
          date: "2026-01-28",
          startTime: "8:00 AM",
          endTime: "4:00 PM",
          type: "equipment",
          location: "1234 Tech Park Dr, Austin, TX",
          projectName: "Thompson Residence",
          color: "#EF4444",
          professionalType: "electrician",
          participants: [
            { id: "p1", name: "David Thompson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200" },
          ],
        },
        {
          id: "ee2",
          title: "EV Charger Installation",
          date: "2026-01-28",
          startTime: "10:00 AM",
          endTime: "2:00 PM",
          type: "equipment",
          location: "567 Office Plaza, Round Rock, TX",
          projectName: "Martinez EV Setup",
          color: "#10B981",
          professionalType: "electrician",
        },
        {
          id: "ee3",
          title: "Electrical Inspection",
          date: "2026-01-29",
          startTime: "9:00 AM",
          endTime: "10:30 AM",
          type: "inspection",
          location: "890 Cedar Lane, Cedar Park, TX",
          projectName: "Chen Remodel",
          color: "#8B5CF6",
          professionalType: "electrician",
        },
        {
          id: "ee4",
          title: "Recessed Lighting Install",
          date: "2026-01-30",
          startTime: "8:00 AM",
          endTime: "3:00 PM",
          type: "equipment",
          location: "234 Pine Ave, Austin, TX",
          projectName: "Wilson Kitchen",
          color: "#FBBF24",
          professionalType: "electrician",
          participants: [
            { id: "p2", name: "Jennifer Wilson", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200" },
          ],
        },
        {
          id: "ee5",
          title: "Emergency Call - Power Outage",
          date: "2026-01-31",
          startTime: "7:00 AM",
          endTime: "12:00 PM",
          type: "equipment",
          location: "456 Elm Street, Pflugerville, TX",
          projectName: "Garcia Emergency",
          color: "#DC2626",
          professionalType: "electrician",
        },
        {
          id: "ee6",
          title: "Permit Deadline",
          date: "2026-02-05",
          startTime: "5:00 PM",
          endTime: "5:00 PM",
          type: "deadline",
          projectName: "Thompson Panel Upgrade",
          color: "#EF4444",
          professionalType: "electrician",
        },
        {
          id: "ee7",
          title: "Code Compliance Review",
          date: "2026-02-10",
          startTime: "2:00 PM",
          endTime: "3:30 PM",
          type: "inspection",
          location: "City Permit Office",
          projectName: "Multiple Projects",
          color: "#3B82F6",
          professionalType: "electrician",
        },
      ];
    case "contractor":
      return [
        {
          id: "ce1",
          title: "Framing Inspection",
          date: "2026-01-28",
          startTime: "9:00 AM",
          endTime: "10:00 AM",
          type: "inspection",
          location: "42 Mount Vernon St, Boston, MA",
          projectName: "Beacon Hill Renovation",
          color: "#8B5CF6",
          professionalType: "contractor",
          participants: [
            { id: "p1", name: "Mike Thompson", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200" },
          ],
        },
        {
          id: "ce2",
          title: "HVAC Installation",
          date: "2026-01-28",
          startTime: "1:00 PM",
          endTime: "6:00 PM",
          type: "equipment",
          location: "42 Mount Vernon St, Boston, MA",
          projectName: "Beacon Hill Renovation",
          color: "#0EA5E9",
          professionalType: "contractor",
        },
        {
          id: "ce3",
          title: "Client Walkthrough",
          date: "2026-01-29",
          startTime: "2:00 PM",
          endTime: "3:30 PM",
          type: "meeting",
          location: "156 Tremont St, Boston, MA",
          projectName: "South End Condo Flip",
          color: "#272D53",
          professionalType: "contractor",
          participants: [
            { id: "p2", name: "Amanda Foster", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" },
          ],
        },
        {
          id: "ce4",
          title: "Drywall Delivery",
          date: "2026-01-30",
          startTime: "8:00 AM",
          endTime: "9:00 AM",
          type: "equipment",
          location: "42 Mount Vernon St, Boston, MA",
          projectName: "Beacon Hill Renovation",
          color: "#64748B",
          professionalType: "contractor",
        },
        {
          id: "ce5",
          title: "Electrical Rough-In",
          date: "2026-01-31",
          startTime: "7:00 AM",
          endTime: "4:00 PM",
          type: "equipment",
          location: "156 Tremont St, Boston, MA",
          projectName: "South End Condo Flip",
          color: "#3B82F6",
          professionalType: "contractor",
          participants: [
            { id: "p3", name: "Carlos Rodriguez", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
          ],
        },
        {
          id: "ce6",
          title: "Cabinet Installation",
          date: "2026-02-10",
          startTime: "8:00 AM",
          endTime: "5:00 PM",
          type: "milestone",
          location: "42 Mount Vernon St, Boston, MA",
          projectName: "Beacon Hill Renovation",
          color: "#22C55E",
          professionalType: "contractor",
        },
        {
          id: "ce7",
          title: "Final Inspection",
          date: "2026-02-15",
          startTime: "10:00 AM",
          endTime: "12:00 PM",
          type: "inspection",
          location: "156 Tremont St, Boston, MA",
          projectName: "South End Condo Flip",
          color: "#8B5CF6",
          professionalType: "contractor",
        },
        {
          id: "ce8",
          title: "Project Deadline",
          date: "2026-03-15",
          startTime: "5:00 PM",
          endTime: "5:00 PM",
          type: "deadline",
          projectName: "Beacon Hill Renovation",
          color: "#EF4444",
          professionalType: "contractor",
        },
      ];
    default:
      return [
        {
          id: "ge1",
          title: "Team Meeting",
          date: "2026-01-28",
          startTime: "9:00 AM",
          endTime: "10:00 AM",
          type: "meeting",
          location: "Office",
          color: "#3B82F6",
        },
        {
          id: "ge2",
          title: "Project Review",
          date: "2026-01-29",
          startTime: "2:00 PM",
          endTime: "3:00 PM",
          type: "meeting",
          color: "#10B981",
        },
        {
          id: "ge3",
          title: "Deadline",
          date: "2026-02-05",
          startTime: "5:00 PM",
          endTime: "5:00 PM",
          type: "deadline",
          color: "#EF4444",
        },
      ];
  }
};

const getInvitesForProfessionalType = (type: ProfessionalType | undefined): GroupProjectInvite[] => {
  switch (type) {
    case "realtor":
      return [
        {
          id: "ri1",
          projectName: "Westlake Hills Flip",
          projectType: "Investment Property",
          address: "4521 Westlake Dr, Austin, TX",
          image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
          invitedBy: {
            name: "Marcus Thompson",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
            role: "Investor",
          },
          estimatedBudget: "$450,000",
          timeline: "6 months",
          startDate: "2026-02-01",
          teamSize: 4,
          description: "Luxury flip opportunity in Westlake Hills. Looking for listing agent to help with acquisition analysis and eventual sale.",
          yourRole: "Listing Agent",
          invitedDate: "2026-01-25",
          status: "pending",
        },
        {
          id: "ri2",
          projectName: "Mueller Development Condos",
          projectType: "New Construction Sales",
          address: "2100 Aldrich St, Austin, TX",
          image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
          invitedBy: {
            name: "David Chen",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
            role: "Developer",
          },
          estimatedBudget: "$2,500,000",
          timeline: "12 months",
          startDate: "2026-02-15",
          teamSize: 8,
          description: "Seeking experienced realtor to handle sales for new 12-unit condo development in Mueller.",
          yourRole: "Sales Agent",
          invitedDate: "2026-01-24",
          status: "pending",
        },
        {
          id: "ri3",
          projectName: "South Congress Investment",
          projectType: "Commercial Property",
          address: "3456 S Congress Ave, Austin, TX",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
          invitedBy: {
            name: "Jennifer Mills",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
            role: "Investment Group",
          },
          estimatedBudget: "$1,200,000",
          timeline: "3 months",
          startDate: "2026-02-20",
          teamSize: 3,
          description: "Mixed-use property acquisition on South Congress. Need agent with commercial experience.",
          yourRole: "Buyer's Agent",
          invitedDate: "2026-01-23",
          status: "accepted",
        },
      ];
    case "landscaper":
      return [
        {
          id: "li1",
          projectName: "Riverside Flip Landscaping",
          projectType: "Full Landscape Design",
          address: "2847 Riverside Dr, Austin, TX 78704",
          image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
          invitedBy: {
            name: "Marcus Chen",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
            role: "Investor",
          },
          estimatedBudget: "$18,000 - $25,000",
          timeline: "3-4 weeks",
          startDate: "2026-02-15",
          teamSize: 6,
          description: "Complete landscape transformation for flip property. Native, low-maintenance plants preferred.",
          yourRole: "Lead Landscaper",
          invitedDate: "2026-01-25",
          status: "pending",
        },
        {
          id: "li2",
          projectName: "Tarrytown Estate Grounds",
          projectType: "Estate Landscaping",
          address: "2100 Windsor Rd, Austin, TX 78703",
          image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
          invitedBy: {
            name: "Robert Mitchell",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
            role: "Realtor",
          },
          estimatedBudget: "$75,000 - $95,000",
          timeline: "8-10 weeks",
          startDate: "2026-03-15",
          teamSize: 10,
          description: "Luxury property listing preparation. Pool surround, outdoor kitchen area, mature tree installation.",
          yourRole: "Landscape Contractor",
          invitedDate: "2026-01-24",
          status: "pending",
        },
      ];
    case "pool_company":
      return [
        {
          id: "gi1",
          projectName: "Sunset Valley Resort Pool",
          projectType: "Commercial Pool Build",
          address: "1234 Resort Way, Austin, TX",
          image: "https://images.unsplash.com/photo-1572331165267-854da2b021aa?w=800",
          invitedBy: {
            name: "Jessica Martinez",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
            role: "General Contractor",
          },
          estimatedBudget: "$185,000",
          timeline: "10 weeks",
          startDate: "2026-02-01",
          teamSize: 12,
          description: "Large commercial pool with lap lanes, children's splash area, and connected spa.",
          yourRole: "Lead Pool Contractor",
          invitedDate: "2026-01-25",
          status: "pending",
        },
        {
          id: "gi2",
          projectName: "Lakefront Infinity Pool",
          projectType: "Luxury Residential Pool",
          address: "567 Lakefront Blvd, Lakeway, TX",
          image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
          invitedBy: {
            name: "David Chen",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
            role: "Property Developer",
          },
          estimatedBudget: "$95,000",
          timeline: "8 weeks",
          startDate: "2026-02-15",
          teamSize: 8,
          description: "High-end infinity edge pool with vanishing edge overlooking the lake.",
          yourRole: "Pool Builder - Specialty Finishes",
          invitedDate: "2026-01-24",
          status: "pending",
        },
      ];
    default:
      return [];
  }
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ViewMode = "calendar" | "invites";

export default function CalendarScreen() {
  const { user } = useAuth();
  const { serviceConfig } = useService();
  const { theme } = useTheme();
  const { updateInviteStatus } = useInvitations();
  const professional = user as Professional | null;
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 27));
  const [selectedDate, setSelectedDate] = useState<string>("2026-01-28");
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  
  const baseRoleEvents = useMemo(() => getEventsForProfessionalType(professional?.professionalType), [professional?.professionalType]);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const roleEvents = useMemo(() => [...baseRoleEvents, ...customEvents], [baseRoleEvents, customEvents]);
  const [invites, setInvites] = useState<GroupProjectInvite[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: "9:00 AM",
    endTime: "10:00 AM",
    location: "",
    type: "meeting",
  });
  
  useEffect(() => {
    setInvites(getInvitesForProfessionalType(professional?.professionalType));
  }, [professional?.professionalType]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: { date: number; isCurrentMonth: boolean; dateString: string }[] = [];
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        date: day,
        isCurrentMonth: false,
        dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        dateString: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      days.push({
        date: i,
        isCurrentMonth: false,
        dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  const getEventsForDate = (dateString: string) => {
    return roleEvents.filter(event => event.date === dateString);
  };

  const selectedDateEvents = useMemo(() => {
    return roleEvents.filter(event => event.date === selectedDate);
  }, [selectedDate, roleEvents]);

  const pendingInvitesCount = invites.filter(i => i.status === "pending").length;

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "showing": return Home;
      case "survey": return ClipboardCheck;
      case "delivery": return Briefcase;
      case "installation": return Shovel;
      case "listing_appointment": return Briefcase;
      case "strategy_call": return Users;
      case "open_house": return Home;
      case "closing": return Check;
      case "excavation": return Shovel;
      case "plumbing": return Droplets;
      case "gunite": return Hammer;
      case "tile": return Sparkles;
      case "equipment": return Wrench;
      case "meeting": return Users;
      case "inspection": return ClipboardCheck;
      case "deadline": return Clock;
      case "milestone": return Check;
      default: return CalendarIcon;
    }
  };

  const handleInviteResponse = (inviteId: string, response: "accepted" | "declined") => {
    console.log("[Calendar] Handling invite response:", inviteId, response);
    setInvites(prev => prev.map(invite => 
      invite.id === inviteId ? { ...invite, status: response } : invite
    ));
    updateInviteStatus(inviteId, response);
  };

  const formatSelectedDate = () => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const renderCalendarView = () => (
    <>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth("prev")} style={styles.navButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthYear}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={() => navigateMonth("next")} style={styles.navButton}>
            <ChevronRight size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {DAYS.map(day => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day.dateString);
            const isSelected = day.dateString === selectedDate;
            const isToday = day.dateString === "2026-01-27";
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.dayCellOtherMonth,
                  isSelected && styles.dayCellSelected,
                  isToday && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(day.dateString)}
              >
                <Text style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextOtherMonth,
                  isSelected && styles.dayTextSelected,
                  isToday && !isSelected && styles.dayTextToday,
                ]}>
                  {day.date}
                </Text>
                {dayEvents.length > 0 && (
                  <View style={styles.eventDots}>
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <View key={i} style={[styles.eventDot, { backgroundColor: event.color }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <Text style={styles.eventsSectionTitle}>{formatSelectedDate()}</Text>
          <TouchableOpacity 
            style={styles.addEventButton}
            onPress={() => setShowAddEventModal(true)}
          >
            <Plus size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {selectedDateEvents.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <CalendarIcon size={40} color={Colors.textTertiary} />
            <Text style={styles.noEventsText}>No events scheduled</Text>
            <Text style={styles.noEventsSubtext}>Tap + to add an event</Text>
          </View>
        ) : (
          selectedDateEvents.map(event => {
            const EventIcon = getEventTypeIcon(event.type);
            return (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={[styles.eventColorBar, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <View style={[styles.eventTypeIcon, { backgroundColor: `${event.color}20` }]}>
                      <EventIcon size={16} color={event.color} />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {event.projectName && (
                        <Text style={styles.eventProject}>{event.projectName}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.eventDetails}>
                    <View style={styles.eventDetail}>
                      <Clock size={14} color={Colors.textSecondary} />
                      <Text style={styles.eventDetailText}>
                        {event.startTime} - {event.endTime}
                      </Text>
                    </View>
                    {event.location && (
                      <View style={styles.eventDetail}>
                        <MapPin size={14} color={Colors.textSecondary} />
                        <Text style={styles.eventDetailText} numberOfLines={1}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                  </View>
                  {event.participants && event.participants.length > 0 && (
                    <View style={styles.eventParticipants}>
                      {event.participants.slice(0, 4).map((p, i) => (
                        <Image
                          key={p.id}
                          source={{ uri: p.avatar }}
                          style={[styles.participantAvatar, { marginLeft: i > 0 ? -8 : 0 }]}
                        />
                      ))}
                      {event.participants.length > 4 && (
                        <View style={[styles.participantAvatar, styles.participantMore]}>
                          <Text style={styles.participantMoreText}>
                            +{event.participants.length - 4}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </>
  );

  const renderInvitesView = () => (
    <View style={styles.invitesContainer}>
      <View style={styles.invitesHeader}>
        <Text style={styles.invitesTitle}>{professional?.professionalType === "realtor" ? "Real Estate Opportunities" : serviceConfig?.displayName ? `${serviceConfig.displayName} Project Invites` : "Project Invites"}</Text>
        <Text style={styles.invitesSubtitle}>
          {pendingInvitesCount} pending invite{pendingInvitesCount !== 1 ? "s" : ""}
        </Text>
      </View>

      {invites.map(invite => (
        <View key={invite.id} style={styles.inviteCard}>
          <Image source={{ uri: invite.image }} style={styles.inviteImage} contentFit="cover" />
          
          <View style={styles.inviteContent}>
            <View style={styles.inviteHeader}>
              <View>
                <Text style={styles.inviteProjectName}>{invite.projectName}</Text>
                <View style={styles.inviteTypeBadge}>
                  {professional?.professionalType === "realtor" ? <Home size={12} color="#8B5CF6" /> : <Waves size={12} color="#0EA5E9" />}
                  <Text style={styles.inviteTypeText}>{invite.projectType}</Text>
                </View>
              </View>
              {invite.status !== "pending" && (
                <View style={[
                  styles.inviteStatusBadge,
                  { backgroundColor: invite.status === "accepted" ? `${Colors.success}15` : `${Colors.error}15` }
                ]}>
                  <Text style={[
                    styles.inviteStatusText,
                    { color: invite.status === "accepted" ? Colors.success : Colors.error }
                  ]}>
                    {invite.status === "accepted" ? "Accepted" : "Declined"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inviteLocation}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.inviteLocationText}>{invite.address}</Text>
            </View>

            <View style={styles.invitedBySection}>
              <Image source={{ uri: invite.invitedBy.avatar }} style={styles.inviterAvatar} />
              <View>
                <Text style={styles.invitedByLabel}>Invited by</Text>
                <Text style={styles.inviterName}>{invite.invitedBy.name}</Text>
                <Text style={styles.inviterRole}>{invite.invitedBy.role}</Text>
              </View>
            </View>

            <View style={styles.inviteStats}>
              <View style={styles.inviteStat}>
                <Briefcase size={14} color={Colors.textSecondary} />
                <Text style={styles.inviteStatText}>{invite.estimatedBudget}</Text>
              </View>
              <View style={styles.inviteStat}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.inviteStatText}>{invite.timeline}</Text>
              </View>
              <View style={styles.inviteStat}>
                <Users size={14} color={Colors.textSecondary} />
                <Text style={styles.inviteStatText}>{invite.teamSize} team</Text>
              </View>
            </View>

            <View style={styles.yourRoleSection}>
              <Text style={styles.yourRoleLabel}>Your Role:</Text>
              <Text style={styles.yourRoleText}>{invite.yourRole}</Text>
            </View>

            <Text style={styles.inviteDescription} numberOfLines={2}>
              {invite.description}
            </Text>

            <View style={styles.inviteFooter}>
              <View style={styles.inviteDate}>
                <CalendarIcon size={12} color={Colors.textSecondary} />
                <Text style={styles.inviteDateText}>
                  Starts {new Date(invite.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
              
              {invite.status === "pending" && (
                <View style={styles.inviteActions}>
                  <TouchableOpacity 
                    style={styles.declineBtn}
                    onPress={() => handleInviteResponse(invite.id, "declined")}
                  >
                    <X size={16} color={Colors.error} />
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.acceptBtn}
                    onPress={() => handleInviteResponse(invite.id, "accepted")}
                  >
                    <Check size={16} color={Colors.white} />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      Alert.alert("Error", "Please enter an event title");
      return;
    }

    const eventColors = ["#EC4899", "#8B5CF6", "#3B82F6", "#10B981", "#272D53", "#EF4444"];
    const randomColor = eventColors[Math.floor(Math.random() * eventColors.length)];

    const createdEvent: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEvent.title,
      date: selectedDate,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      type: newEvent.type,
      location: newEvent.location || undefined,
      color: randomColor,
      professionalType: professional?.professionalType,
    };

    setCustomEvents([...customEvents, createdEvent]);
    setShowAddEventModal(false);
    setNewEvent({
      title: "",
      startTime: "9:00 AM",
      endTime: "10:00 AM",
      location: "",
      type: "meeting",
    });
    Alert.alert("Success", "Event created successfully!");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor: theme.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{serviceConfig?.displayName || "Professional"} Schedule & Invites</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, viewMode === "calendar" && styles.tabActive]}
            onPress={() => setViewMode("calendar")}
          >
            <CalendarIcon size={16} color={viewMode === "calendar" ? theme.white : theme.textSecondary} />
            <Text style={[styles.tabText, viewMode === "calendar" && styles.tabTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, viewMode === "invites" && styles.tabActive]}
            onPress={() => setViewMode("invites")}
          >
            <Users size={16} color={viewMode === "invites" ? theme.white : theme.textSecondary} />
            <Text style={[styles.tabText, viewMode === "invites" && styles.tabTextActive]}>
              Invites
            </Text>
            {pendingInvitesCount > 0 && (
              <View style={styles.inviteBadge}>
                <Text style={styles.inviteBadgeText}>{pendingInvitesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === "calendar" ? renderCalendarView() : renderInvitesView()}
      </ScrollView>

      <Modal
        visible={showAddEventModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddEventModal(false)}
      >
        <View style={styles.eventModalOverlay}>
          <View style={styles.eventModalContent}>
            <View style={styles.eventModalHeader}>
              <Text style={styles.eventModalTitle}>New Event</Text>
              <TouchableOpacity
                style={styles.eventModalClose}
                onPress={() => setShowAddEventModal(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.eventModalDate}>
              <CalendarIcon size={16} color="#0EA5E9" />
              <Text style={styles.eventModalDateText}>{formatSelectedDate()}</Text>
            </View>

            <View style={styles.eventFormGroup}>
              <Text style={styles.eventFormLabel}>Event Title</Text>
              <TextInput
                style={styles.eventFormInput}
                placeholder="Enter event title"
                placeholderTextColor={Colors.textTertiary}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
            </View>

            <View style={styles.eventFormRow}>
              <View style={[styles.eventFormGroup, { flex: 1 }]}>
                <Text style={styles.eventFormLabel}>Start Time</Text>
                <TextInput
                  style={styles.eventFormInput}
                  placeholder="9:00 AM"
                  placeholderTextColor={Colors.textTertiary}
                  value={newEvent.startTime}
                  onChangeText={(text) => setNewEvent({ ...newEvent, startTime: text })}
                />
              </View>
              <View style={[styles.eventFormGroup, { flex: 1 }]}>
                <Text style={styles.eventFormLabel}>End Time</Text>
                <TextInput
                  style={styles.eventFormInput}
                  placeholder="10:00 AM"
                  placeholderTextColor={Colors.textTertiary}
                  value={newEvent.endTime}
                  onChangeText={(text) => setNewEvent({ ...newEvent, endTime: text })}
                />
              </View>
            </View>

            <View style={styles.eventFormGroup}>
              <Text style={styles.eventFormLabel}>Location (Optional)</Text>
              <TextInput
                style={styles.eventFormInput}
                placeholder="Enter location"
                placeholderTextColor={Colors.textTertiary}
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
              />
            </View>

            <View style={styles.eventFormGroup}>
              <Text style={styles.eventFormLabel}>Event Type</Text>
              <View style={styles.eventTypeOptions}>
                {["meeting", "inspection", "deadline", "milestone"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.eventTypeOption,
                      newEvent.type === type && styles.eventTypeOptionActive,
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, type })}
                  >
                    <Text
                      style={[
                        styles.eventTypeOptionText,
                        newEvent.type === type && styles.eventTypeOptionTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.eventModalActions}>
              <TouchableOpacity
                style={styles.eventCancelBtn}
                onPress={() => setShowAddEventModal(false)}
              >
                <Text style={styles.eventCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.eventCreateBtn}
                onPress={handleCreateEvent}
              >
                <Plus size={18} color={Colors.white} />
                <Text style={styles.eventCreateBtnText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  safeArea: {
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
    backgroundColor: "#0EA5E9",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  inviteBadge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  inviteBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  calendarContainer: {
    backgroundColor: Colors.surface,
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  weekDays: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayCell: {
    width: DAY_WIDTH,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: DAY_WIDTH,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: "#0EA5E9",
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: "#0EA5E9",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  dayTextOtherMonth: {
    color: Colors.textTertiary,
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: "700" as const,
  },
  dayTextToday: {
    color: "#0EA5E9",
    fontWeight: "700" as const,
  },
  eventDots: {
    flexDirection: "row",
    gap: 3,
    position: "absolute",
    bottom: 4,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  eventsSection: {
    padding: 20,
  },
  eventsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  addEventButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  noEventsContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  noEventsText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eventTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  eventProject: {
    fontSize: 13,
    color: Colors.primary,
    marginTop: 2,
  },
  eventDetails: {
    gap: 6,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eventDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventParticipants: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  participantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  participantMore: {
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  participantMoreText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  invitesContainer: {
    padding: 20,
  },
  invitesHeader: {
    marginBottom: 16,
  },
  invitesTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  invitesSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inviteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inviteImage: {
    width: "100%",
    height: 140,
  },
  inviteContent: {
    padding: 16,
  },
  inviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  inviteProjectName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  inviteTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  inviteTypeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#0369A1",
  },
  inviteStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inviteStatusText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  inviteLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  inviteLocationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  invitedBySection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  inviterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  invitedByLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  inviterName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inviterRole: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  inviteStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  inviteStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inviteStatText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  yourRoleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  yourRoleLabel: {
    fontSize: 12,
    color: "#0369A1",
  },
  yourRoleText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#0369A1",
    flex: 1,
  },
  inviteDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  inviteFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  inviteDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inviteDateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  inviteActions: {
    flexDirection: "row",
    gap: 10,
  },
  declineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.success,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  eventModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end" as const,
  },
  eventModalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  eventModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  eventModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  eventModalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  eventModalDate: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  eventModalDateText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0369A1",
  },
  eventFormGroup: {
    marginBottom: 16,
  },
  eventFormLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  eventFormInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  eventFormRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  eventTypeOptions: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  eventTypeOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  eventTypeOptionActive: {
    backgroundColor: "#E0F2FE",
    borderColor: "#0EA5E9",
  },
  eventTypeOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  eventTypeOptionTextActive: {
    color: "#0369A1",
    fontWeight: "600" as const,
  },
  eventModalActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  eventCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventCancelBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  eventCreateBtn: {
    flex: 1,
    flexDirection: "row" as const,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#0EA5E9",
    gap: 8,
  },
  eventCreateBtnText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
