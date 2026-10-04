import React from 'react';

interface FaceShapeIconProps {
  className?: string;
}

export const OvalFaceIcon: React.FC<FaceShapeIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <ellipse cx="20" cy="20" rx="12" ry="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 17h.01M25 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17 26c1.5 1.5 4.5 1.5 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const RoundFaceIcon: React.FC<FaceShapeIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 18h.01M25 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17 26c1.5 1.2 4.5 1.2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SquareFaceIcon: React.FC<FaceShapeIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path
      d="M8 8h24v16c0 5-4 8-12 8s-12-3-12-8V8z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 17h.01M25 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M16 26h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const HeartFaceIcon: React.FC<FaceShapeIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path
      d="M7 10c4-3 10-2 13 2 3-4 9-5 13-2 3 3 2 12-4 19-3 3.5-7 6-9 7-2-1-6-3.5-9-7-6-7-7-16-4-19z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 17h.01M25 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17 26c1.5 1 4.5 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const OblongFaceIcon: React.FC<FaceShapeIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <rect x="10" y="4" width="20" height="32" rx="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 16h.01M25 16h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17 26c1.5 1 4.5 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const DiamondFaceIcon: React.FC<FaceShapeIconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
    <path
      d="M20 5 L33 18 L20 35 L7 18 Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M15 17h.01M25 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M17 26c1.5 1 4.5 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
