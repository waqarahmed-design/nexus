/**
 * Icon — HugeIcons wrapper component
 *
 * Usage:
 *   import { Icon } from '@/components/ui';
 *   import { Icons } from '@/constants';
 *
 *   <Icon icon={Icons.back} size="md" color={Colors.gray} />
 *   <Icon icon={Icons.shieldCheck} size="sm" color={Colors.green} />
 */

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { IconSize } from '@/constants/Spacing';
import { Colors } from '@/constants/Colors';

// The type HugeIcons expects for its icon prop
type HugeIconElement = React.ComponentProps<typeof HugeiconsIcon>['icon'];

type IconSizeKey = keyof typeof IconSize;

interface IconProps {
  /** The icon component from @/constants/Icons */
  icon: HugeIconElement;

  /**
   * Size — uses the named scale from IconSize.
   * 'feature' = 32, 'md' = 24, 'sm' = 20, 'xs' = 16.
   * Or pass a raw number (must be multiple of 4).
   */
  size?: IconSizeKey | number;

  /** Icon stroke/fill color */
  color?: string;

  /**
   * Stroke width. Default 1.5 for md/feature, 1.5 for sm/xs.
   * Use 2 for extra emphasis.
   */
  strokeWidth?: number;
}

export function Icon({ icon, size = 'md', color = Colors.gray, strokeWidth = 1.5 }: IconProps) {
  const resolvedSize = typeof size === 'number' ? size : IconSize[size];

  return (
    <HugeiconsIcon
      icon={icon}
      size={resolvedSize}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
}
