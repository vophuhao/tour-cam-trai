/* eslint-disable @typescript-eslint/no-explicit-any */
/* ...existing code... */
"use client";

import { SiteAmenities } from "./site-amenities";
import { SiteRules } from "./site-rules";

interface SiteAmenitiesRulesProps {
  data: {
    amenities?: string[];
    rules?: any;
  } | undefined;
  onChange: (patch: Partial<{ amenities: string[]; rules: any }>) => void;
}

export function SiteAmenitiesRules({ data = {}, onChange }: SiteAmenitiesRulesProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <SiteAmenities
          data={data.amenities ?? []}
          onChange={(ids: string[]) => onChange({ amenities: ids })}
        />
        <SiteRules
          data={data.rules ?? { guestsShouldBring: [], siteSpecificRules: [] }}
          onChange={(r: any) => onChange({ rules: { ...(data.rules ?? {}), ...(r ?? {}) } })}
        />
      </div>
    </div>
  );
}
/* ...existing code... */