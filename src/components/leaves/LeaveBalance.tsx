"use client";

import React, { useEffect, useState } from "react";
import { getTotalLeaveBalance } from "@/server/leave.action";
import { Skeleton } from "@/components/ui/skeleton"; 

type LeaveBalance = {
  _id: string;
  leave_type_name: string;
  hex_color_code: string;
  total_leaves: number;
  utilized_leaves: number;
};

export const LeaveBalance = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      // Only show loading on initial fetch or maybe quiet update?
      // User wanted recall, better safe to fetch.
      // If we want to avoid flickering skeleton, we can skip setLoading(true) on subsequent updates.
      // But for now, simple approach.
      // setLoading(true); 
      
      const res = await getTotalLeaveBalance();
      if (res.ok && res.data) {
        setBalances(res.data.leaveBalanceList);
      }
      setLoading(false);
    };
    fetchBalance();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="p-6 pt-0">
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-4 w-[100px] mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {balances.map((balance) => (
        <div 
          key={balance._id} 
          className="rounded-xl border bg-white text-gray-900 shadow-sm transition-shadow hover:shadow-md"
          style={{ borderTop: `4px solid ${balance.hex_color_code}` }}
        >
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="font-semibold leading-none tracking-tight">
              {balance.leave_type_name}
            </h3>
             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: balance.hex_color_code }} />
          </div>
          <div className="p-6 pt-2">
            <div className="text-2xl font-bold">{balance.total_leaves - balance.utilized_leaves}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available (Total: {balance.total_leaves})
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
