"use client";

import React, { useState } from "react";
import { LeaveBalance } from "./LeaveBalance";
import { LeaveList } from "./LeaveList";
import { ApplyLeaveModal } from "./ApplyLeaveModal";

export const LeaveDashboard = () => {
  const [refreshListTrigger, setRefreshListTrigger] = useState(0);

  const handleUpdate = () => {
    setRefreshListTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Leaves</h1>
          <p className="text-sm text-gray-500">View your leave balance and history</p>
        </div>
        <ApplyLeaveModal onSuccess={handleUpdate} />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h2>
        <LeaveBalance refreshTrigger={refreshListTrigger} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave History</h2>
        <LeaveList refreshTrigger={refreshListTrigger} onDeleteSuccess={handleUpdate} />
      </section>
    </div>
  );
};
