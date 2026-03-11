import React, { useState, useEffect, useRef } from "react";
import { Role } from "../types";
import {
  User,
  Bell,
  Lock,
  Building,
  CreditCard,
  Users,
  Save,
  Check,
  Download,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import api from "@/services/api";
import { jwtDecode } from "jwt-decode";

interface SettingsProps {
  role: Role;
}

const Settings: React.FC<SettingsProps> = ({ role }) => {
  const { showToast } = useToast();
  const isAdmin = role === Role.COMPANY_ADMIN || role === Role.HR_ADMIN;
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [timeZones, setTimeZones] = useState<any[]>([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: role,
    bio: "",
    profileImage: "",
  });

  const [notifications, setNotifications] = useState({
    EmailAlerts: false,
    SMSNotifications: false,
    InAppNotifications: false,
    WeeklyDigest: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProfile();
    loadNotifications();
    loadCurrencies();
    loadTimeZones();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get("/Settings/user_profile");

      setProfile({
        name: response.data.fullName,
        email: response.data.email,
        role: role,
        bio: response.data.bio || "",
        profileImage: response.data.profileImage || "",
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to load profile", "error");
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get("/Settings/notification");

      console.log(res, "ressssssssssssssssss");

      setNotifications({
        emailAlerts: res.data.emailAlerts,
        smsNotifications: res.data.smsNotifications,
        inAppNotifications: res.data.inAppNotifications,
        weeklyDigest: res.data.weeklyDigest,
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to load notifications", "error");
    }
  };

  const loadCurrencies = async () => {
    try {
      const res = await api.get("/Settings/currencyCombo");

      setCurrencies(res.data);
    } catch (error) {
      console.error(error);
      showToast("Failed to load currencies", "error");
    }
  };

  const loadTimeZones = async () => {
    try {
      const res = await api.get("/Settings/timezoneCombo");
      setTimeZones(res.data);
    } catch (error) {
      console.error(error);
      showToast("Failed to load timezones", "error");
    }
  };

  const updatePassword = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        showToast("User not authenticated", "error");
        return;
      }

      const decoded: any = jwtDecode(token);
      const userId = decoded.id;

      const response = await api.post("/Settings/password", {
        userID: userId,
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      showToast("Password updated successfully", "success");

      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      if (error.response) {
        showToast(error.response.data, "error");
      } else {
        showToast("Error updating password", "error");
      }

      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await api.put("/Settings/user_profile", {
        fullName: profile.name,
        email: profile.email,
        bio: profile.bio,
        profileImage: profile.profileImage,
      });

      showToast("Profile updated successfully", "success");
    } catch (error: any) {
      if (error.response) {
        showToast(error.response.data.message, "error");
      } else {
        showToast("Failed to update profile", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      await api.put("/Settings/notification", {
        emailAlerts: notifications.emailAlerts,
        smsNotifications: notifications.smsNotifications,
        inAppNotifications: notifications.inAppNotifications,
        weeklyDigest: notifications.weeklyDigest,
      });

      showToast("Notification settings updated", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update notifications", "error");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast("Image must be less than 1MB", "error");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        profileImage: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: <User size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security", icon: <Lock size={18} /> },
  ];

  if (isAdmin) {
    tabs.push(
      { id: "company", label: "Company", icon: <Building size={18} /> },
      { id: "team", label: "Team Members", icon: <Users size={18} /> },
      { id: "billing", label: "Billing", icon: <CreditCard size={18} /> },
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Profile</h3>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                {profile.profileImage ? (
                  <img
                    key={profile.profileImage}
                    src={profile.profileImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleButtonClick}
                  className="text-sm text-indigo-600 font-medium hover:underline"
                >
                  Change Avatar
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <p className="text-xs text-slate-400">
                  JPG, GIF or PNG. 1MB Max.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                />
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Alert Preferences
              </h3>

              <button
                onClick={saveNotifications}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Save size={16} />
                Save Preferences
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  key: "emailAlerts",
                  label: "Email Alerts",
                  desc: "Receive daily summaries and urgent updates via email.",
                },
                {
                  key: "smsNotifications",
                  label: "SMS Notifications",
                  desc: "Get text messages for critical security alerts.",
                },
                {
                  key: "inAppNotifications",
                  label: "In-App Notifications",
                  desc: "Show badges and popups within the dashboard.",
                },
                {
                  key: "weeklyDigest",
                  label: "Weekly Performance Digest",
                  desc: "A summary of your team's activity sent every Monday.",
                },
              ].map((item: any) => (
                <div
                  key={item.key}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]:
                          !notifications[
                            item.key as keyof typeof notifications
                          ],
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? "bg-indigo-600" : "bg-slate-300"}`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-6" : ""}`}
                    ></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case "company":
        return (
          <div className="space-y-6 animate-in fade-in">
            {/* Section Header */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Company Settings
              </h3>

              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Save size={16} />
                Save Changes
              </button>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  defaultValue="PeopleCore Inc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tax ID / EIN
                </label>
                <input
                  defaultValue="XX-XXXXXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Timezone
                </label>
                <select
                  value={selectedTimeZone}
                  onChange={(e) => setSelectedTimeZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select TimeZone</option>

                  {timeZones.map((c: any) => (
                    <option key={c.timeZoneId} value={c.timeZoneId}>
                      {c.timeZoneName} ({c.utcOffset})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Primary Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Currency</option>

                  {currencies.map((c: any) => (
                    <option key={c.currencyId} value={c.currencyId}>
                      {c.currencyCode} ({c.currencySymbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Branding */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Branding</h3>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Logo
                </div>

                <button className="text-sm font-medium text-indigo-600 hover:underline">
                  Upload Logo
                </button>
              </div>
            </div>
          </div>
        );
      case "team":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Team Management</h3>
                <p className="text-sm text-slate-500">
                  Manage access and roles for the HR platform.
                </p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Invite Member
              </button>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    {
                      name: "Jane Doe",
                      email: "jane@company.com",
                      role: "Admin",
                      status: "Active",
                    },
                    {
                      name: "John Smith",
                      email: "john@company.com",
                      role: "Recruiter",
                      status: "Active",
                    },
                    {
                      name: "Sarah Connor",
                      email: "sarah@company.com",
                      role: "Hiring Manager",
                      status: "Invited",
                    },
                  ].map((user, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-indigo-600 cursor-pointer hover:underline">
                        Edit
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "billing":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-indigo-100 text-sm font-medium mb-1">
                    Current Plan
                  </p>
                  <h3 className="text-3xl font-bold">Enterprise</h3>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-6 border-t border-white/20 pt-4">
                <div>
                  <p className="text-indigo-200 text-xs uppercase font-bold">
                    Billing Cycle
                  </p>
                  <p className="font-medium">Monthly</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-xs uppercase font-bold">
                    Next Invoice
                  </p>
                  <p className="font-medium">Nov 01, 2023</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-xs uppercase font-bold">
                    Amount
                  </p>
                  <p className="font-medium">$299.00</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Invoice History</h3>
                <button className="text-sm text-indigo-600 font-medium hover:underline">
                  Download All
                </button>
              </div>
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Invoice ID</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    {
                      id: "INV-001",
                      date: "Oct 01, 2023",
                      amount: "$299.00",
                      status: "Paid",
                    },
                    {
                      id: "INV-002",
                      date: "Sep 01, 2023",
                      amount: "$299.00",
                      status: "Paid",
                    },
                    {
                      id: "INV-003",
                      date: "Aug 01, 2023",
                      amount: "$299.00",
                      status: "Paid",
                    },
                  ].map((inv, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono">{inv.id}</td>
                      <td className="px-6 py-4">{inv.date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {inv.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check size={14} /> {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Download
                          size={16}
                          className="ml-auto text-slate-400 hover:text-slate-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2">Change Password</h3>

              <div className="grid grid-cols-1 gap-4 max-w-md">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />

                <button
                  onClick={updatePassword}
                  className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 w-fit"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-slate-400 p-8 text-center flex flex-col items-center">
            <Building size={48} className="mb-4 opacity-20" />
            <p>
              Settings module for <span className="font-bold">{activeTab}</span>{" "}
              coming soon.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">
            Manage your profile, preferences, and company configuration.
          </p>
        </div>
        {/* <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button> */}
      </div>

      <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                activeTab === tab.id
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Settings;
