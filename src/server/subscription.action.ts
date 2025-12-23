'use server';

import { apiClient } from '@/lib/api/api-client.server';
import { endpoints } from '@/lib/api/endpoints';
import { isRedirectError } from '@/lib/utils';

type ActionResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

export type SubscriptionPlanPrice = {
  id: string;
  amount: number;
  currency: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  features?: {
    title?: string;
    body?: string;
  };
  metadata: {
    name: string;
    range?: string;
    badge?: string;
    ctaLabel?: string;
    footnote?: string;
    features?: string;
  };
  active: boolean;
  prices: SubscriptionPlanPrice;
};

type SubscriptionPlansApiResponse = {
  success: boolean;
  message?: string;
  data?: SubscriptionPlan[];
};

/**
 * Fetches the list of available subscription plans from the server.
 * @returns {Promise<ActionResult<SubscriptionPlan[]>>} A list of subscription plans or an error message.
 */

export async function getSubscriptionPlans(): Promise<ActionResult<SubscriptionPlan[]>> {
  try {
    const response = await apiClient.get<SubscriptionPlansApiResponse>(
      endpoints.organization.subscriptionPlans,
      { auth: true }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: response.error ?? 'Unable to fetch subscription plans.',
        details: response.details,
      };
    }

    const payload = response.data;
    const plans = Array.isArray(payload?.data) ? payload?.data : [];

    if (!plans.length) {
      return {
        ok: false,
        error: payload?.message ?? 'No subscription plans available right now.',
      };
    }

    const normalizedPlans = plans.map((plan) => ({
      ...plan,
      description: plan.features?.body ?? plan.description ?? null,
    }));

    return {
      ok: true,
      data: normalizedPlans,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to fetch subscription plans.',
    };
  }
}

type SubscriptionBuyApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    stripeCheckoutURL: string;
  };
};

/**
 * Initiates a Stripe checkout session for a given subscription plan.
 * @param {string} stripePriceId - The Stripe price ID of the selected plan.
 * @returns {Promise<ActionResult<{ stripeCheckoutURL: string }>>} Checkout URL or error details.
 */

export async function buySubscription(stripePriceId: string): Promise<ActionResult<{ stripeCheckoutURL: string }>> {
  try {
    const response = await apiClient.get<SubscriptionBuyApiResponse>(
      endpoints.organization.subscriptionBuy(stripePriceId),
      { auth: true }
    );
    if (!response.ok) {
      return {
        ok: false,
        error: response.error ?? 'Unable to create checkout session.',
        details: response.details,
      };
    }

    const payload = response.data;
    const checkoutURL = payload?.data?.stripeCheckoutURL;

    if (!checkoutURL) {
      return {
        ok: false,
        error: payload?.message ?? 'Checkout URL not received from server.',
      };
    }

    return {
      ok: true,
      data: { stripeCheckoutURL: checkoutURL },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to create checkout session.',
    };
  }
}

