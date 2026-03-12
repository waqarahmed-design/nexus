import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
  StyleSheet, Animated, Easing,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { Card, CardDivider } from '@/components/ui/Card';
import { INSIGHTS, Insight } from '@/data/mockData';

// ── Helpers ──────────────────────────────────────────────────────────────────

function insightAccentColor(type: string): string {
  if (type === 'warning') return Colors.red;
  if (type === 'tip')     return Colors.accent;
  return Colors.gray;
}

// ── Insight Detail Modal ──────────────────────────────────────────────────────

interface InsightModalProps {
  insight: Insight | null;
  onClose: () => void;
}

function InsightModal({ insight, onClose }: InsightModalProps) {
  if (!insight) return null;

  const accent = insightAccentColor(insight.type);

  return (
    <Modal
      visible={!!insight}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={m.container}>
        {/* Drag handle */}
        <View style={m.handle} />

        {/* Header */}
        <View style={m.header}>
          <View style={[m.headerDot, { backgroundColor: accent }]} />
          <Text style={m.headerTitle} numberOfLines={2}>{insight.title}</Text>
          <TouchableOpacity style={m.closeBtn} onPress={onClose} activeOpacity={0.75}>
            <Icon icon={Icons.close} size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={m.divider} />

        {/* Scrollable content */}
        <ScrollView
          style={m.scroll}
          contentContainerStyle={m.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Body */}
          <Text style={m.body}>{insight.body}</Text>

          {/* Recommendations */}
          <Text style={m.recLabel}>RECOMMENDATIONS</Text>
          {insight.recommendations.map((rec, i) => (
            <View key={i} style={m.recRow}>
              <View style={[m.recNumber, { borderColor: accent }]}>
                <Text style={[m.recNumberText, { color: accent }]}>{i + 1}</Text>
              </View>
              <Text style={m.recText}>{rec}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const m = StyleSheet.create({
  container: {
    flex:             1,
    backgroundColor:  Colors.bg,
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[2],
    paddingBottom:     Spacing[8],
  },

  handle: {
    alignSelf:       'center',
    width:           32,
    height:          4,
    borderRadius:    Radii.pill,
    backgroundColor: Colors.cardBorder,
    marginTop:       Spacing[3],
    marginBottom:    Spacing[4],
  },

  header: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           Spacing[3],
    marginBottom:  Spacing[4],
  },

  headerDot: {
    width:        10,
    height:       10,
    borderRadius: Radii.pill,
    marginTop:    Spacing[2],
    flexShrink:   0,
  },

  headerTitle: {
    flex:  1,
    color: Colors.white,
    ...TypeScale.title.sm,
  },

  closeBtn: {
    width:           Spacing.touchTarget,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },

  divider: {
    height:          1,
    backgroundColor: Colors.cardBorder,
    marginBottom:    Spacing[5],
  },

  scroll: { flex: 1 },

  scrollContent: {
    gap: Spacing[4],
    paddingBottom: Spacing[8],
  },

  body: {
    color:      Colors.gray,
    ...TypeScale.body.lg,
    lineHeight: 24,
  },

  recLabel: {
    color:      Colors.gray,
    ...TypeScale.label.md,
    marginTop:  Spacing[1],
  },

  recRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           Spacing[3],
  },

  recNumber: {
    width:        24,
    height:       24,
    borderRadius: Radii.pill,
    borderWidth:  1,
    alignItems:   'center',
    justifyContent: 'center',
    flexShrink:   0,
    marginTop:    2,
  },

  recNumberText: {
    ...TypeScale.label.sm,
  },

  recText: {
    flex:       1,
    color:      Colors.white,
    ...TypeScale.body.lg,
    lineHeight: 24,
  },
});

// ── InsightsList ──────────────────────────────────────────────────────────────

interface InsightsListProps {
  /** true = stagger entrance animations on mount (Analytics tab) */
  animated?: boolean;
}

export function InsightsList({ animated = false }: InsightsListProps) {
  const [activeInsight, setActiveInsight] = useState<Insight | null>(null);

  const anims = useRef(
    INSIGHTS.map(() => ({
      opacity:    new Animated.Value(animated ? 0 : 1),
      translateY: new Animated.Value(animated ? 16 : 0),
    }))
  ).current;

  useEffect(() => {
    if (!animated) return;
    const ease = Easing.out(Easing.cubic);
    Animated.stagger(
      60,
      anims.map(({ opacity, translateY }) =>
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true, easing: ease, delay: 200 }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true, easing: ease, delay: 200 }),
        ])
      )
    ).start();
  }, []);

  return (
    <>
      <Card variant="sm">
        {INSIGHTS.map((insight, i) => {
          const dotColor = insightAccentColor(insight.type);
          const isLast   = i === INSIGHTS.length - 1;

          return (
            <Animated.View
              key={insight.id}
              style={{
                opacity:   anims[i].opacity,
                transform: [{ translateY: anims[i].translateY }],
              }}
            >
              <TouchableOpacity
                style={s.row}
                onPress={() => setActiveInsight(insight)}
                activeOpacity={0.75}
              >
                <View style={[s.dot, { backgroundColor: dotColor }]} />
                <Text style={s.title} numberOfLines={1}>{insight.title}</Text>
                <Icon icon={Icons.forward} size={16} color={Colors.gray} />
              </TouchableOpacity>
              {!isLast && <CardDivider />}
            </Animated.View>
          );
        })}
      </Card>

      <InsightModal
        insight={activeInsight}
        onClose={() => setActiveInsight(null)}
      />
    </>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection:    'row',
    alignItems:       'center',
    minHeight:        Spacing.touchTarget,
    paddingHorizontal: Spacing.cardPad,
    gap:              Spacing[3],
  },

  dot: {
    width:        6,
    height:       6,
    borderRadius: Radii.pill,
    flexShrink:   0,
  },

  title: {
    flex:  1,
    color: Colors.white,
    ...TypeScale.body.lg,
  },
});
