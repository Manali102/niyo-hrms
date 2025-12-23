export const endpoints = {
  auth: {
    login: '/api/auth/login',
    resetPassword: '/api/auth/reset-password',
    viewUpcomingHolidays: '/api/auth/view-upcoming-holidays',
    viewUpcomingBirthdays: '/api/auth/view-upcoming-birthdays',
  },
  organization: {
    create: '/api/organization/create',
    subscriptionPlans: '/api/organization/subscription-plan',
    subscriptionBuy: (stripePriceId: string) => `/api/organization/subscription-buy/${stripePriceId}`,
    holidayList: '/api/organization/holiday-list',
    insertHolidays: '/api/organization/insert-holidays',
  },
  employee: {
    create: '/api/employee/create',
    resetPassword: '/api/employee/reset-password',
    list: '/api/employee/list',
    get: (id: string) => `/api/employee/get/${id}`,
    update: (id: string) => `/api/employee/update/${id}`,
    hierarchy: (id: string) => `/api/employee/hierarchy/${id}`,
  },
  leaveRequest: {
    employeeRequests: '/api/leave-request/employee-requests',
    update: '/api/leave-request/update',
    totalLeaveBalance: '/api/leave-request/total-leave-balance',
    request: '/api/leave-request/request',
    listRequests: '/api/leave-request/list-requests',
    cancel: (id: string) => `/api/leave-request/cancel/${id}`,
  },
};