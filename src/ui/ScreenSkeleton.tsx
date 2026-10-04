import React from 'react';
import { Skeleton } from './Skeleton';

export interface ScreenSkeletonProps {
  type?: 'today' | 'closet' | 'style' | 'me';
}

export const ScreenSkeleton: React.FC<ScreenSkeletonProps> = ({ type = 'today' }) => {
  if (type === 'closet') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200" aria-label="Loading closet...">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-24 h-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="w-20 h-8 rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2 p-3 bg-surface border border-border rounded-card">
              <Skeleton variant="tile" className="aspect-square" />
              <Skeleton variant="text" className="w-3/4 h-4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'style') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200" aria-label="Loading style profile...">
        <div className="flex gap-2 pb-2 border-b border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="w-24 h-8 rounded-control" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-card p-6 space-y-4">
            <Skeleton variant="text" className="w-40 h-6" />
            <Skeleton variant="text" className="w-full h-16" />
            <div className="flex gap-3">
              <Skeleton variant="circle" className="w-12 h-12" />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="w-1/2 h-4" />
                <Skeleton variant="text" className="w-1/3 h-3" />
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-card p-6 space-y-4">
            <Skeleton variant="text" className="w-40 h-6" />
            <Skeleton variant="card" className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'me') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200" aria-label="Loading account and settings...">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-40 h-8" />
          <Skeleton variant="text" className="w-64 h-4" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-card p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="w-10 h-10" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton variant="text" className="w-48 h-5" />
                  <Skeleton variant="text" className="w-3/4 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Today default skeleton
  return (
    <div className="space-y-6 animate-in fade-in duration-200" aria-label="Loading today's outfit...">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32 h-4" />
        </div>
        <Skeleton variant="text" className="w-28 h-8 rounded-full" />
      </div>
      <div className="bg-surface border border-border rounded-card p-6 space-y-6">
        <Skeleton variant="card" className="h-64 sm:h-80" />
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Skeleton variant="text" className="w-36 h-10" />
          <div className="flex gap-2">
            <Skeleton variant="text" className="w-20 h-10" />
            <Skeleton variant="text" className="w-28 h-10" />
          </div>
        </div>
      </div>
    </div>
  );
};
