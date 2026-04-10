import React from 'react';

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface AnalyticsTopic {
  name: string;
  value: number;
}

export interface AnalyticsComplexity {
  concept: string;
  score: number; // 1-100
}

export interface LectureData {
  executiveSummary: string;
  transcript: string;
  quiz: QuizQuestion[];
  topicDistribution: AnalyticsTopic[];
  conceptComplexity: AnalyticsComplexity[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}