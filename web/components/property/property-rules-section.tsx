'use client';

import type { Property } from '@/types/property-site';
import { AlertCircle, Dog, Flame, Volume2 } from 'lucide-react';

interface PropertyRulesSectionProps {
  rules: Property['rules'];
  checkInInstructions?: string;
  checkOutInstructions?: string;
}

const ruleIcons: Record<string, React.ReactNode> = {
  pets: <Dog className="h-5 w-5" />,
  noise: <Volume2 className="h-5 w-5" />,
  fire: <Flame className="h-5 w-5" />,
  general: <AlertCircle className="h-5 w-5" />,
};

const ruleCategoryLabels: Record<string, string> = {
  pets: 'Thú cưng',
  noise: 'Tiếng ồn',
  fire: 'Lửa trại',
  general: 'Quy định chung',
};

export function PropertyRulesSection({
  rules,
  checkInInstructions,
  checkOutInstructions,
}: PropertyRulesSectionProps) {
  // Group rules by category
  const groupedRules = rules?.reduce(
    (acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = [];
      }
      acc[rule.category].push(rule);
      return acc;
    },
    {} as Record<string, typeof rules>,
  );

  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Nội quy & Hướng dẫn</h2>
      </div>

      {/* Check-in/Check-out Instructions */}
      {(checkInInstructions || checkOutInstructions) && (
        <div className="space-y-4 rounded-lg border p-6">
          {checkInInstructions && (
            <div>
              <h3 className="mb-2 font-semibold">Hướng dẫn Check-in</h3>
              <p className="text-muted-foreground text-sm">
                {checkInInstructions}
              </p>
            </div>
          )}
          {checkOutInstructions && (
            <div>
              <h3 className="mb-2 font-semibold">Hướng dẫn Check-out</h3>
              <p className="text-muted-foreground text-sm">
                {checkOutInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rules by Category */}
      <div className="space-y-6">
        {Object.entries(groupedRules || {})
          .sort(([a], [b]) => {
            const order = ['general', 'pets', 'fire', 'noise'];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map(([category, categoryRules]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                {ruleIcons[category]}
                <h3 className="font-semibold">
                  {ruleCategoryLabels[category] || category}
                </h3>
              </div>
              <ul className="space-y-2">
                {categoryRules
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((rule, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                      <span>{rule.text}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
