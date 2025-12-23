"use client";
import React from "react";
import { Calendar, Gift, Plane, Check, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingPlanStore, type BillingCycle, type PricingPlanId } from "@/store/usePricingPlanStore";
import { useHolidaysStore } from "@/store/useHolidaysStore";
import { PricingPlan } from "@/components/Popups/Pricing";
import { Holidays } from "@/components/Popups/Holidays";
import { Skeleton } from "@/components/ui/skeleton";

import { getEmployeeLeaveRequests, updateLeaveRequestStatus } from "@/server/leave.action";
import { getUpcomingHolidays, getUpcomingBirthdays, UpcomingHoliday, UpcomingBirthday } from "@/server/auth.action";
import { LeaveRequest, LeaveRequestStatus } from "@/types/leave.types";
import { format } from "date-fns";

// Remove local interfaces as we will use imported types
// interface LeaveRequest { ... }
// interface SimpleItem { ... }

interface SectionCardProps<T> {
  title: string;
  icon: React.ElementType;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  accentColor: string;
  loading: boolean;
}

const DashboardPage: React.FC = () => {
  // Pricing Plan Store
  const isPricingPlanOpen = usePricingPlanStore((state) => state.isOpen);
  const closePricingPlan = usePricingPlanStore((state) => state.close);
  const selectPricingPlan = usePricingPlanStore((state) => state.selectPlan);

  // Holidays Store
  const isHolidaysOpen = useHolidaysStore((state) => state.isOpen);
  const openHolidays = useHolidaysStore((state) => state.open);
  const closeHolidays = useHolidaysStore((state) => state.close);
  const selectHolidayPackage = useHolidaysStore((state) => state.selectPackage);

  // Track if pricing plan was handled (selected or closed)
  const [pricingPlanHandled, setPricingPlanHandled] = React.useState(false);

  // Handle pricing plan selection
  const handlePricingPlanSelect = React.useCallback(
    (planId: PricingPlanId, billingCycle: BillingCycle) => {
      selectPricingPlan(planId, billingCycle);
      closePricingPlan();
      setPricingPlanHandled(true);
      // Open holidays popup after pricing plan is selected
      openHolidays();
    },
    [closePricingPlan, selectPricingPlan, openHolidays],
  );

  // Handle pricing plan close (X icon)
  const handlePricingPlanClose = React.useCallback(() => {
    closePricingPlan();
    setPricingPlanHandled(true);
    // Open holidays popup even if pricing plan was just closed
    openHolidays();
  }, [closePricingPlan, openHolidays]);

  // Handle holiday package selection
  const handleHolidaysSelect = React.useCallback(
    (region: string) => {
      selectHolidayPackage(region);
      closeHolidays();
    },
    [selectHolidayPackage, closeHolidays],
  );
  const [pendingLeaves, setPendingLeaves] = React.useState<LeaveRequest[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = React.useState<UpcomingHoliday[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = React.useState<UpcomingBirthday[]>([]);
  
  const [leavesLoading, setLeavesLoading] = React.useState(true);
  const [holidaysLoading, setHolidaysLoading] = React.useState(true);
  const [birthdaysLoading, setBirthdaysLoading] = React.useState(true);

  // Helper to fetch independent data
  const fetchLeaves = async () => {
    try {
      const res = await getEmployeeLeaveRequests({ status: "pending", limit: 5, page: 1 });
      if (res.ok && res.data) setPendingLeaves(res.data.leaveRequests);
    } catch (e) {
      console.error(e);
    } finally {
      setLeavesLoading(false);
    }
  };
  // Handle holidays skip
  const handleHolidaysSkip = React.useCallback(() => {
    // Don't store anything, just close
    closeHolidays();
  }, [closeHolidays]);

  // Handle holidays close (X icon)
  const handleHolidaysClose = React.useCallback(() => {
    closeHolidays();
  }, [closeHolidays]);

  const fetchHolidays = async () => {
    try {
      const res = await getUpcomingHolidays();
      if (res.ok && res.data) setUpcomingHolidays(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setHolidaysLoading(false);
    }
  };

  const fetchBirthdays = async () => {
    try {
      const res = await getUpcomingBirthdays();
      if (res.ok && res.data) setUpcomingBirthdays(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setBirthdaysLoading(false);
    }
  };

  React.useEffect(() => {
    // Fire all concurrently
    fetchLeaves();
    fetchHolidays();
    fetchBirthdays();
  }, []);

  const handleApprove = async (leaveRequestId: string) => {
    const res = await updateLeaveRequestStatus({ leaveRequestId, status: LeaveRequestStatus.APPROVED });
    if (res.ok) {
        setPendingLeaves(prev => prev.filter(l => l._id !== leaveRequestId));
    } else {
        console.error("Failed to approve leave");
    }
  };

  const handleReject = async (leaveRequestId: string) => {
    const res = await updateLeaveRequestStatus({ leaveRequestId, status: LeaveRequestStatus.REJECTED });
    if (res.ok) {
        setPendingLeaves(prev => prev.filter(l => l._id !== leaveRequestId));
    } else {
         console.error("Failed to reject leave");
    }
  };

  const SectionCard = <T,>({
    title,
    icon: Icon,
    items,
    renderItem,
    accentColor,
    loading
  }: SectionCardProps<T>) => (
    <div className="group bg-[rgb(var(--color-surface))] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-[rgb(var(--color-border))] relative overflow-hidden">
      {/* Accent line */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentColor}`}></div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${accentColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-[rgb(var(--color-text))]">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {loading ? (
           <>
             <Skeleton className="h-20 w-full rounded-xl" />
             <Skeleton className="h-20 w-full rounded-xl" />
           </>
        ) : items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-[rgb(var(--color-surface-variant))] rounded-xl border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border-hover))] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              {renderItem(item)}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[rgb(var(--color-surface-variant))] flex items-center justify-center">
              <Icon className="w-8 h-8 text-[rgb(var(--color-icon-muted))]" />
            </div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              No records available
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const stats = [
    { label: "Total Employees", value: "124", change: "+8%", color: "from-blue-500 to-blue-600" },
    { label: "Active Today", value: "118", change: "+2%", color: "from-green-500 to-green-600" },
    { label: "On Leave", value: "6", change: "-3%", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--color-background))] transition-colors duration-500">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-block">
              <h1 className="text-4xl font-bold mb-2 text-[rgb(var(--color-text))]">
                Welcome to your Dashboard
              </h1>
            </div>
            <p className="text-[rgb(var(--color-text-secondary))] text-base mt-3">
              Manage your team with ease — track leaves, celebrate moments, and stay organized.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-[rgb(var(--color-surface))] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-[rgb(var(--color-border))] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-[rgb(var(--color-text))]">{stat.value}</p>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-semibold">{stat.change}</span>
                  <span className="text-[rgb(var(--color-text-secondary))]">vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Leave Requests */}
            <SectionCard
              title="Pending Leave Requests"
              icon={Plane}
              items={pendingLeaves}
              loading={leavesLoading}
              accentColor="from-blue-500 to-cyan-500"
              renderItem={(leave) => (
                <div>
                  <p className="font-semibold text-[rgb(var(--color-text))] mb-1">{leave.employee_details?.fullName || "Unknown"}</p>
                  <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-3 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(leave.start_date), "MMM d, yyyy")} • {leave.reason}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(leave._id)}
                      variant="primary"
                      size="sm"
                      fullWidth
                    >
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(leave._id)}
                      variant="secondary"
                      size="sm"
                      fullWidth
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            />

            {/* Upcoming Holidays */}
            <SectionCard
              title="Upcoming Holidays"
              icon={Calendar}
              items={upcomingHolidays}
              loading={holidaysLoading}
              accentColor="from-purple-500 to-pink-500"
              renderItem={(holiday) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[rgb(var(--color-text))] mb-1">{holiday.holiday_name}</p>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(holiday.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              )}
            />

            {/* Upcoming Birthdays */}
            <SectionCard
              title="Upcoming Birthdays"
              icon={Gift}
              items={upcomingBirthdays}
              loading={birthdaysLoading}
              accentColor="from-orange-500 to-pink-500"
              renderItem={(bday) => (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[rgb(var(--color-text))] mb-1">{bday.fullName}</p>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      {format(new Date(bday.dateOfBirth), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
      {/* Pricing Plan Popup - Shows first */}
      {isPricingPlanOpen && (
        <PricingPlan
          isOpen={isPricingPlanOpen}
          onClose={handlePricingPlanClose}
          onSelectPlan={handlePricingPlanSelect}
        />
      )}

      {/* Holidays Popup - Shows after pricing plan is handled */}
      {isHolidaysOpen && pricingPlanHandled && (
        <Holidays
          isOpen={isHolidaysOpen}
          onClose={handleHolidaysClose}
          onSelectPackage={handleHolidaysSelect}
          onSkip={handleHolidaysSkip}
        />
      )}
    </>
  );
};

export default DashboardPage;
