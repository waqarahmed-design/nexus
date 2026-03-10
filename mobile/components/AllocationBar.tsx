import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';

interface Exchange {
  id: string;
  name: string;
  color: string;
  totalValueUSD: number;
}

interface Props {
  exchanges: Exchange[];
  total: number;
}

export function AllocationBar({ exchanges, total }: Props) {
  return (
    <View style={s.wrap}>
      <View style={s.bar}>
        {exchanges.map((exc, i) => {
          const pct = (exc.totalValueUSD / total) * 100;
          return (
            <View
              key={exc.id}
              style={[
                s.segment,
                { flex: pct, backgroundColor: exc.color },
                i > 0 && { marginLeft: 2 },
              ]}
            />
          );
        })}
      </View>

      <View style={s.legend}>
        {exchanges.map((exc) => {
          const pct = (exc.totalValueUSD / total) * 100;
          return (
            <View key={exc.id} style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: exc.color }]} />
              <Text style={s.legendName}>{exc.name}</Text>
              <Text style={s.legendPct}>{pct.toFixed(0)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:   { gap: Spacing[2] },   // 8
  bar: {
    flexDirection:   'row',
    height:           4,
    borderRadius:     3,
    overflow:        'hidden',
    backgroundColor: Colors.muted,
  },
  segment:    { height: 4 },
  legend:     { flexDirection: 'row', gap: Spacing[4] },   // 16
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1] },   // 4
  dot:        { width: 6, height: 6, borderRadius: 3 },
  legendName: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },
  legendPct: {
    color: Colors.white,
    ...TypeScale.serifNumeric.sm,
  },
});
