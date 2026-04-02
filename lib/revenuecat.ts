"use client";

import { isNativeIOS } from "@/lib/platform";

// ---------------------------------------------------------------------------
// Types shared between native (Capacitor) and web (JS) SDKs
// ---------------------------------------------------------------------------

export const RC_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || "";
export const RC_ENTITLEMENT_ID = "Colorbestie Pro";

export type RCPackage = {
  identifier: string;
  /** e.g. "$rc_monthly", "$rc_annual", "$rc_lifetime" */
  packageType: string;
  localizedPriceString: string;
  product: { identifier: string; title: string };
};

export type RCOffering = {
  identifier: string;
  availablePackages: RCPackage[];
  monthly: RCPackage | null;
  annual: RCPackage | null;
  lifetime: RCPackage | null;
};

export type RCCustomerInfo = {
  activeSubscriptions: string[];
  entitlements: { active: Record<string, unknown> };
  originalAppUserId: string;
};

// ---------------------------------------------------------------------------
// Initialise RevenueCat — call once on app startup
// ---------------------------------------------------------------------------

let configured = false;

export async function configureRevenueCat(appUserId?: string): Promise<void> {
  if (configured) return;

  if (isNativeIOS()) {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    // appUserId is optional — omitting it lets RevenueCat generate an anonymous ID.
    // This is important so products load even before the user is authenticated.
    const cfg: Parameters<typeof Purchases.configure>[0] = { apiKey: RC_API_KEY };
    if (appUserId) cfg.appUserID = appUserId;
    await Purchases.configure(cfg);
  } else {
    const { Purchases } = await import("@revenuecat/purchases-js");
    Purchases.configure(RC_API_KEY, appUserId ?? "");
  }

  configured = true;
}

// ---------------------------------------------------------------------------
// Identify / login — call after user authenticates
// ---------------------------------------------------------------------------

export async function loginRevenueCat(appUserId: string): Promise<void> {
  if (isNativeIOS()) {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    await Purchases.logIn({ appUserID: appUserId });
  } else {
    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    await purchases.changeUser(appUserId);
  }
}

// ---------------------------------------------------------------------------
// Check entitlement
// ---------------------------------------------------------------------------

export async function hasRevenueCatPro(): Promise<boolean> {
  try {
    if (isNativeIOS()) {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const { customerInfo } = await Purchases.getCustomerInfo();
      return RC_ENTITLEMENT_ID in customerInfo.entitlements.active;
    }

    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    const customerInfo = await purchases.getCustomerInfo();
    return RC_ENTITLEMENT_ID in customerInfo.entitlements.active;
  } catch {
    return false;
  }
}

export async function getRevenueCatCustomerInfo(): Promise<RCCustomerInfo | null> {
  try {
    if (isNativeIOS()) {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo as unknown as RCCustomerInfo;
    }

    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    const info = await purchases.getCustomerInfo();
    return info as unknown as RCCustomerInfo;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Get offerings (products/packages)
// ---------------------------------------------------------------------------

export async function getOfferings(): Promise<RCOffering | null> {
  try {
    if (isNativeIOS()) {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      if (!offerings.current) return null;
      const current = offerings.current;
      return {
        identifier: current.identifier,
        availablePackages: current.availablePackages.map(mapNativePackage),
        monthly: current.monthly ? mapNativePackage(current.monthly) : null,
        annual: current.annual ? mapNativePackage(current.annual) : null,
        lifetime: current.lifetime ? mapNativePackage(current.lifetime) : null,
      };
    }

    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    const offerings = await purchases.getOfferings();
    if (!offerings.current) return null;
    const current = offerings.current;
    return {
      identifier: current.identifier,
      availablePackages: current.availablePackages.map(mapWebPackage),
      monthly: current.monthly ? mapWebPackage(current.monthly) : null,
      annual: current.annual ? mapWebPackage(current.annual) : null,
      lifetime: current.lifetime ? mapWebPackage(current.lifetime) : null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Purchase a package
// ---------------------------------------------------------------------------

export type PurchaseResult = {
  success: boolean;
  customerInfo: RCCustomerInfo | null;
  userCancelled?: boolean;
};

export async function purchasePackage(pkg: RCPackage): Promise<PurchaseResult> {
  try {
    if (isNativeIOS()) {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      // The Capacitor plugin needs the original package object.
      // We re-fetch offerings to get the real reference.
      const offerings = await Purchases.getOfferings();
      const realPkg = offerings.current?.availablePackages.find(
        (p: { identifier: string }) => p.identifier === pkg.identifier,
      );
      if (!realPkg) return { success: false, customerInfo: null };

      const result = await Purchases.purchasePackage({ aPackage: realPkg });
      return {
        success: true,
        customerInfo: result.customerInfo as unknown as RCCustomerInfo,
      };
    }

    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    const offerings = await purchases.getOfferings();
    const realPkg = offerings.current?.availablePackages.find(
      (p) => p.identifier === pkg.identifier,
    );
    if (!realPkg) return { success: false, customerInfo: null };

    const { customerInfo } = await purchases.purchase({ rcPackage: realPkg });
    return {
      success: true,
      customerInfo: customerInfo as unknown as RCCustomerInfo,
    };
  } catch (error: unknown) {
    const err = error as { userCancelled?: boolean; code?: number };
    if (err.userCancelled || err.code === 1) {
      return { success: false, customerInfo: null, userCancelled: true };
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Restore purchases
// ---------------------------------------------------------------------------

export async function restorePurchases(): Promise<RCCustomerInfo | null> {
  try {
    if (isNativeIOS()) {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const { customerInfo } = await Purchases.restorePurchases();
      return customerInfo as unknown as RCCustomerInfo;
    }

    // Web SDK doesn't need restore — purchases are tied to the user ID
    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    const info = await purchases.getCustomerInfo();
    return info as unknown as RCCustomerInfo;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Present RevenueCat Paywall (web only — native uses purchasePackage)
// ---------------------------------------------------------------------------

export async function presentWebPaywall(): Promise<PurchaseResult> {
  if (isNativeIOS()) {
    throw new Error("Use purchasePackage() on native iOS instead of presentWebPaywall()");
  }

  try {
    const { Purchases } = await import("@revenuecat/purchases-js");
    const purchases = Purchases.getSharedInstance();
    const offerings = await purchases.getOfferings();
    const currentOffering = offerings.current;
    if (!currentOffering) return { success: false, customerInfo: null };

    const { customerInfo } = await purchases.presentPaywall({
      offering: currentOffering,
    });
    return {
      success: true,
      customerInfo: customerInfo as unknown as RCCustomerInfo,
    };
  } catch (error: unknown) {
    const err = error as { userCancelled?: boolean };
    if (err.userCancelled) {
      return { success: false, customerInfo: null, userCancelled: true };
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Helpers to normalise package shapes
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNativePackage(p: any): RCPackage {
  return {
    identifier: p.identifier,
    packageType: p.packageType ?? "",
    localizedPriceString: p.product?.priceString ?? "",
    product: {
      identifier: p.product?.identifier ?? "",
      title: p.product?.title ?? p.identifier,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWebPackage(p: any): RCPackage {
  return {
    identifier: p.identifier,
    packageType: p.packageType ?? "",
    localizedPriceString: p.rcBillingProduct?.currentPrice?.formattedPrice ?? "",
    product: {
      identifier: p.rcBillingProduct?.identifier ?? "",
      title: p.rcBillingProduct?.displayName ?? p.identifier,
    },
  };
}
