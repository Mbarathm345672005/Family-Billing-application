import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Render a Lucide icon dynamically by name with safe fallback
 */
export const DynamicIcon = ({ name, className = 'w-5 h-5', ...props }) => {
  if (!name) {
    return <LucideIcons.Tag className={className} {...props} />;
  }

  // Normalize icon name (e.g. 'shopping-cart' -> 'ShoppingCart', 'zap' -> 'Zap')
  let iconKey = name;
  if (name.includes('-')) {
    iconKey = name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  } else {
    iconKey = name.charAt(0).toUpperCase() + name.slice(1);
  }

  const IconComponent = LucideIcons[iconKey] || LucideIcons[name] || LucideIcons.Tag;
  return <IconComponent className={className} {...props} />;
};

export const AVAILABLE_ICONS = [
  { name: 'Zap', label: 'Electricity / Power' },
  { name: 'Droplets', label: 'Milk / Water / Dairy' },
  { name: 'ShoppingCart', label: 'Groceries / Shopping' },
  { name: 'Utensils', label: 'Food / Dining' },
  { name: 'Home', label: 'House / Rent' },
  { name: 'Layers', label: 'Other / Misc' },
  { name: 'Tag', label: 'General Tag' },
  { name: 'Wifi', label: 'Internet / Tech' },
  { name: 'Car', label: 'Transport / Vehicle' },
  { name: 'Fuel', label: 'Fuel / Gas' },
  { name: 'HeartPulse', label: 'Health / Medical' },
  { name: 'Tv', label: 'Entertainment / OTT' },
  { name: 'Coffee', label: 'Cafe / Drinks' },
  { name: 'Smartphone', label: 'Mobile / Recharge' },
  { name: 'BookOpen', label: 'Education / Books' },
  { name: 'Gift', label: 'Gifts & Donations' },
  { name: 'Wallet', label: 'Savings & Finance' },
];
