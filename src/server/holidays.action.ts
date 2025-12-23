'use server';

import { apiClient } from '@/lib/api/api-client';
import { endpoints } from '@/lib/api/endpoints';

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

export type Holiday = {
  _id: string;
  holiday_name: string;
  date: string;
  technical_name: string;
  region: string;
};

export type HolidaysPackage = {
  region: string;
  holidays: Holiday[];
};

type HolidayListApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    holidayList: HolidaysPackage[];
  };
};

/**
 * Fetches the list of available holiday packages from the server.
 * @returns {Promise<ActionResult<HolidaysPackage[]>>} A list of holiday packages or an error message.
 */
export async function getHolidayList(): Promise<ActionResult<HolidaysPackage[]>> {
  try {
    const response = await apiClient.get<HolidayListApiResponse>(
      endpoints.organization.holidayList,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error ?? 'Unable to fetch holiday list.',
        details: response.details,
      };
    }

    const payload = response.data;
    const holidayList = Array.isArray(payload?.data?.holidayList) ? payload.data.holidayList : [];

    if (!holidayList.length) {
      return {
        ok: false,
        error: payload?.message ?? 'No holiday packages available right now.',
      };
    }

    return {
      ok: true,
      data: holidayList,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to fetch holiday list.',
    };
  }
}

type InsertHolidayPayload = {
  holidayName: string;
  date: string;
};

type InsertHolidaysApiResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
};

/**
 * Inserts selected holidays into the organization.
 * @param {Holiday[]} holidays - Array of holidays to insert
 * @returns {Promise<ActionResult<unknown>>} Success or error response
 */
export async function insertHolidays(holidays: Holiday[]): Promise<ActionResult<unknown>> {
  try {
    // Transform holidays to the required API format
    const payload: InsertHolidayPayload[] = holidays.map((holiday) => ({
      holidayName: holiday.holiday_name,
      date: holiday.date,
    }));
    const response = await apiClient.post<InsertHolidaysApiResponse>(
      endpoints.organization.insertHolidays,
      payload,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error ?? 'Unable to insert holidays.',
        details: response.details,
      };
    }
    return {
      ok: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to insert holidays.',
    };
  }
}
