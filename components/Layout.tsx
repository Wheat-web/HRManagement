import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  Bell,
  Menu,
  ShieldCheck,
  LogOut,
  UserCircle,
  ClipboardList,
  Building2,
  CalendarRange,
  BarChart3,
  DollarSign,
  TrendingUp,
  Clock,
  CalendarCheck,
  Mail,
  Lock,
  UserPlus,
  CreditCard,
  Search,
  Globe,
  ChevronDown,
  PlusCircle,
  BookUser,
} from "lucide-react";
import { Role, UserProfile, Branch } from "../types";
import { BranchCombo, getBranchCombo } from "@/services/branchService";

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  branches?: Branch[];
  selectedBranchId?: string;
  onSelectBranch?: (id: string) => void;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  unreadMessagesCount?: number;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  // branches = [],
  // selectedBranchId,
  onSelectBranch,
  onLogout,
  currentView,
  onNavigate,
  unreadMessagesCount = 0,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = React.useState(false);
  const [branches, setBranches] = useState<BranchCombo[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | "all">(
    "all",
  );

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await getBranchCombo();
      setBranches(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getMenuItems = (): MenuItem[] => {
    if (user.role === Role.CANDIDATE) {
      return [
        { id: "jobs", label: "Job Board", icon: <Briefcase size={20} /> },
        {
          id: "applications",
          label: "My Applications",
          icon: <FileText size={20} />,
        },
        {
          id: "messages",
          label: "Inbox",
          icon: <Mail size={20} />,
          badge: unreadMessagesCount,
        },
      ];
    }

    const baseItems: MenuItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={20} />,
      },
    ];

    if (user.role === Role.EMPLOYEE) {
      return [
        ...baseItems,
        { id: "hrops", label: "HR Portal", icon: <Briefcase size={20} /> },
        {
          id: "messages",
          label: "My Inbox",
          icon: <Mail size={20} />,
          badge: unreadMessagesCount,
        },
      ];
    }

    // Admin/Recruiter/Manager items
    const opsItems: MenuItem[] = [
      { id: "recruitment", label: "Recruitment", icon: <Users size={20} /> },
      { id: "schedule", label: "Interviews", icon: <Briefcase size={20} /> },
    ];

    if (
      user.role === Role.HR_ADMIN ||
      user.role === Role.COMPANY_ADMIN ||
      user.role === Role.MANAGER
    ) {
      opsItems.push({
        id: "onboarding",
        label: "Onboarding Hub",
        icon: <UserPlus size={20} />,
      });
      opsItems.push({
        id: "payroll",
        label: "Payroll",
        icon: <CreditCard size={20} />,
      });
      opsItems.push({
        id: "salary",
        label: "Salary Management",
        icon: <DollarSign size={20} />,
      });
      opsItems.push({
        id: "productivity",
        label: "Productivity",
        icon: <TrendingUp size={20} />,
      });
    }

    if (user.role === Role.HR_ADMIN || user.role === Role.COMPANY_ADMIN) {
      opsItems.push({
        id: "branches",
        label: "Branch Management",
        icon: <Globe size={20} />,
      });
      opsItems.push({
        id: "employees",
        label: "Employee Directory",
        icon: <BookUser size={20} />,
      });
      opsItems.push({
        id: "shifts",
        label: "Shift Management",
        icon: <Clock size={20} />,
      });
      opsItems.push({
        id: "attendance",
        label: "Attendance",
        icon: <CalendarCheck size={20} />,
      });
      opsItems.push({
        id: "messages",
        label: "Official Mail",
        icon: <Mail size={20} />,
        badge: unreadMessagesCount,
      });
      opsItems.push({
        id: "planner",
        label: "Recruitment Planner",
        icon: <CalendarRange size={20} />,
      });
      opsItems.push({
        id: "department",
        label: "Department",
        icon: <Building2 size={20} />,
      });
      opsItems.push({
        id: "roles",
        label: "Roles & Permissions",
        icon: <Lock size={20} />,
      });
      opsItems.push({
        id: "reports",
        label: "Reports",
        icon: <BarChart3 size={20} />,
      });
      opsItems.push({
        id: "hrops",
        label: "HR Operations",
        icon: <ClipboardList size={20} />,
      });
      opsItems.push({
        id: "compliance",
        label: "Compliance & Audit",
        icon: <ShieldCheck size={20} />,
      });
      opsItems.push({
        id: "policies",
        label: "Policies",
        icon: <FileText size={20} />,
      });
      opsItems.push({
        id: "register_org",
        label: "Register New Org",
        icon: <PlusCircle size={20} />,
      });
    }

    return [...baseItems, ...opsItems];
  };

  const navItems = getMenuItems();
  const currentBranchName =
    selectedBranchId === "all"
      ? "All Branches"
      : branches.find((b) => b.id === selectedBranchId)?.name ||
        "Unknown Branch";

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 shadow-xl flex flex-col`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">PeopleCore</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
          <button
            onClick={() => {
              onNavigate("settings");
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-4 ${
              currentView === "settings"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Settings size={20} /> Settings
          </button>

          <div className="flex items-center gap-3 px-2 py-2 bg-slate-800 rounded-lg mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.role}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-2 py-1 hover:bg-slate-800 rounded transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <button
            className="md:hidden text-slate-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 px-4 flex items-center">
            <span className="text-sm text-slate-500 hidden md:inline-block mr-4">
              {user.companyName} Workspace
            </span>

            {/* Branch Switcher for Admins/Managers */}
            {onSelectBranch && (
              <div className="relative">
                <button
                  onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Building2 size={16} className="text-indigo-600" />
                  {currentBranchName}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {isBranchMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsBranchMenuOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                      <button
                        onClick={() => {
                          onSelectBranch("all");
                          setIsBranchMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${selectedBranchId === "all" ? "text-indigo-600 font-bold bg-indigo-50" : "text-slate-700"}`}
                      >
                        <Globe size={16} /> All Branches
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            onSelectBranch(b.id);
                            setIsBranchMenuOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${selectedBranchId === b.id ? "text-indigo-600 font-bold bg-indigo-50" : "text-slate-700"}`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-700">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <UserCircle size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
