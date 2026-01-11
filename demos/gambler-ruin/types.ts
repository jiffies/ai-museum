import React from 'react';

export interface StorySection {
  id: string;
  title: string;
  content: React.ReactNode;
  config: SimulationConfig;
}

export interface SimulationConfig {
  mode: 'intro' | 'random_walk' | 'absorbing_barrier' | 'negative_drift' | 'leverage' | 'positive_drift';
  volatility: number; // How much price moves per tick
  drift: number; // Direction bias (-1 to 1)
  startingCapital: number;
  barrierPosition: number; // 0 means no barrier visible, positive number is distance from center
  showWall: boolean; // Infinite wall visual
  showCliff: boolean; // Cliff visual
  simulationSpeed: number;
  leverage: number; // Multiplier for volatility
}

export interface Point {
  x: number;
  y: number;
}