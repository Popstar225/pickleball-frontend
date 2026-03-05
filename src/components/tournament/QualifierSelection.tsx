/**
 * Qualifier Selection Component
 *
 * Extracts and displays qualifiers from group stage to knockout.
 * Supports two strategies:
 * 1. "Top N per group" - Simple extraction of top N players
 * 2. "Best of remaining" - Top N from each group + best remaining to fill bracket
 *
 * Features:
 * - Display qualified players from each group
 * - Show tiebreaker positions
 * - Select qualification strategy
 * - Preview bracket size and byes
 * - Confirm advancement
 *
 * @author Tournament System
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Users, Zap, CheckCircle } from 'lucide-react';

interface Qualifier {
  userId: string;
  userName: string;
  position: number;
  groupId: string;
  groupNumber: number;
  matchesWon: number;
  qualified: boolean;
}

interface QualifierSelectionProps {
  eventId: string;
  eventName: string;
  groups: any[];
  qualifiers: Qualifier[];
  advanceCount: number;
  onExtractQualifiers: (strategy: 'topN' | 'bestOf') => Promise<void>;
  onConfirmAdvancement: () => Promise<void>;
}

const STRATEGIES = [
  {
    id: 'topN',
    name: 'Top N Per Group',
    description: 'Extract top 2 (or N) players from each group. Simple and straightforward.',
    example: '5 groups × 2 = 10 qualifiers',
  },
  {
    id: 'bestOf',
    name: 'Best of Remaining',
    description:
      'Top N from each group, then best remaining players fill bracket. Ensures competitive bracket.',
    example: '5 groups: all 10 qualify, but 3 best 2nd place advance (8 total for QF)',
  },
];

const QualifierSelection: React.FC<QualifierSelectionProps> = ({
  eventId,
  eventName,
  groups,
  qualifiers,
  advanceCount,
  onExtractQualifiers,
  onConfirmAdvancement,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'topN' | 'bestOf'>('topN');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      await onExtractQualifiers(selectedStrategy);
    } catch (error) {
      console.error('Error extracting qualifiers:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirmAdvancement();
    } catch (error) {
      console.error('Error confirming advancement:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  // Calculate bracket info
  const qualifierCount = qualifiers.length;
  let bracketSize = 1;
  while (bracketSize < qualifierCount) {
    bracketSize *= 2;
  }
  const byeCount = bracketSize - qualifierCount;

  // Group qualifiers by group
  const qualifiersByGroup = groups.map((group) => ({
    ...group,
    qualifiers: qualifiers.filter((q) => q.groupId === group.id),
  }));

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Qualifier Selection
          </CardTitle>
          <CardDescription className="text-slate-400">{eventName}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Strategy Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Select Advancement Strategy</h3>

            <div className="space-y-3">
              {STRATEGIES.map((strategy) => (
                <div
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id as any)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedStrategy === strategy.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                        selectedStrategy === strategy.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-600'
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{strategy.name}</h4>
                      <p className="text-xs text-slate-400 mb-2">{strategy.description}</p>
                      <p className="text-xs text-slate-500 italic">{strategy.example}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extract Button */}
          <Button
            onClick={handleExtract}
            disabled={isExtracting}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-10"
          >
            {isExtracting && <Zap className="mr-2 h-4 w-4 animate-spin" />}
            {isExtracting ? 'Extracting Qualifiers...' : 'Extract Qualifiers'}
          </Button>

          {/* Bracket Preview */}
          {qualifierCount > 0 && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bracket Preview
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xs text-slate-500">Qualifiers</div>
                  <div className="text-2xl font-bold text-white">{qualifierCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500">Bracket Size</div>
                  <div className="text-2xl font-bold text-white">{bracketSize}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500">Byes</div>
                  <div className="text-2xl font-bold text-yellow-500">{byeCount}</div>
                </div>
              </div>

              {selectedStrategy === 'topN' && (
                <div className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded">
                  {qualifierCount} qualifiers will form a {bracketSize}-player bracket with{' '}
                  {byeCount} bye(s) awarded to highest seeds.
                </div>
              )}

              {selectedStrategy === 'bestOf' && (
                <div className="text-xs text-slate-400 bg-slate-700/30 p-2 rounded">
                  Best {Math.ceil(qualifierCount / groups.length)} per group advance. Remaining
                  bracket positions filled by best 2nd place finishers and beyond.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Qualifiers Display */}
      {qualifierCount > 0 && (
        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Qualified Players by Group</CardTitle>
            <CardDescription className="text-slate-400">
              {qualifierCount} total qualifiers
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {qualifiersByGroup.map((group) => (
                <div key={group.id} className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">
                    Group {group.groupNumber} ({group.qualifiers.length} qualifiers)
                  </h4>

                  <div className="space-y-1 pl-4 border-l border-slate-700">
                    {group.qualifiers.map((qualifier: Qualifier, idx: number) => (
                      <div
                        key={qualifier.userId}
                        className="flex items-center justify-between text-sm p-2 bg-slate-800/30 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">
                            #{qualifier.position}
                          </span>
                          <span className="text-white">{qualifier.userName}</span>
                          {qualifier.position <= advanceCount && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Auto-advances
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{qualifier.matchesWon}W</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={isConfirming || qualifierCount === 0}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white h-10"
            >
              {isConfirming && <Zap className="mr-2 h-4 w-4 animate-spin" />}
              {isConfirming ? 'Confirming...' : 'Confirm Advancement & Generate Bracket'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QualifierSelection;
