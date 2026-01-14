'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tent } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'tent', label: 'Tent' },
  { value: 'rv', label: 'RV' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'glamping', label: 'Glamping' },
  { value: 'treehouse', label: 'Treehouse' },
  { value: 'yurt', label: 'Yurt' },
  { value: 'other', label: 'Other' },
];

interface PropertyTypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export function PropertyTypeFilter({
  selectedTypes,
  onTypesChange,
}: PropertyTypeFilterProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const getButtonLabel = () => {
    if (selectedTypes.length === 0) return 'Property Type';
    if (selectedTypes.length === 1) {
      const type = PROPERTY_TYPES.find(t => t.value === selectedTypes[0]);
      return type?.label || 'Property Type';
    }
    return `${selectedTypes.length} types`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Tent className="mr-2 h-4 w-4" />
          {getButtonLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Property Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PROPERTY_TYPES.map(type => (
          <DropdownMenuCheckboxItem
            key={type.value}
            checked={selectedTypes.includes(type.value)}
            onCheckedChange={() => toggleType(type.value)}
          >
            {type.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
