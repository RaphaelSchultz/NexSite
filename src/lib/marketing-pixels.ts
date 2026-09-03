declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type MarketingPixelConsent = {
  analytics: boolean;
  marketing: boolean;
  experience: boolean;
};

type ConsentValue = "granted" | "denied";

function consentValue(enabled: boolean): ConsentValue {
  return enabled ? "granted" : "denied";
}

function pushDataLayer(event: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function updateMarketingConsent(consent: MarketingPixelConsent) {
  window.gtag?.("consent", "update", {
    analytics_storage: consentValue(consent.analytics || consent.experience),
    ad_storage: consentValue(consent.marketing),
    ad_user_data: consentValue(consent.marketing),
    ad_personalization: consentValue(consent.marketing),
    functionality_storage: "granted",
    personalization_storage: consentValue(consent.experience),
    security_storage: "granted",
  });

  pushDataLayer({
    event: "nex_consent_update",
    nex_consent_analytics: consent.analytics,
    nex_consent_marketing: consent.marketing,
    nex_consent_experience: consent.experience,
  });
}
