import React from 'react';

export interface Task {
  id: string;
  originalText: string;
  absurdDescription: string;
  isCompleted: boolean;
  createdAt: number;
  difficulty: 'meh' | 'annoying' | 'nightmare';
}

export interface MadnessEvent {
  id: string;
  title: string;
  description: string;
  buff: string; // e.g., "+10% Sarcasm"
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: React.ReactNode; // Modified to allow component directly
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface UserStats {
    tasksCreated: number;
    tasksCompleted: number;
    tasksDeleted: number;
    ventingClicks: number;
    excusesGenerated: number;
}

export enum AppView {
  TASKS = 'TASKS',
  MADNESS = 'MADNESS',
  CAMERA = 'CAMERA',
  ANTISTRESS = 'ANTISTRESS',
  PROFILE = 'PROFILE',
  RAMBLINGS = 'RAMBLINGS',
}