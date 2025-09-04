// Mock for react-icons/fa icons used in ResultsSummary component
import React from 'react';

export const FaVoteYea = () => React.createElement('span', { 'data-testid': 'icon-fa-vote-yea' }, '🗳️');
export const FaClock = () => React.createElement('span', { 'data-testid': 'icon-fa-clock' }, '⏰');
export const FaQuestionCircle = () => React.createElement('span', { 'data-testid': 'icon-fa-question-circle' }, '❓');
export const FaExclamationTriangle = () => React.createElement('span', { 'data-testid': 'icon-fa-exclamation-triangle' }, '⚠️');
export const FaCheck = () => React.createElement('span', { 'data-testid': 'icon-fa-check' }, '✅');
export const FaPaperPlane = () => React.createElement('span', { 'data-testid': 'icon-fa-paper-plane' }, '✈️');

// Named export for the entire module
const IconMocks = {
  FaVoteYea,
  FaClock,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaCheck,
  FaPaperPlane,
};

export default IconMocks;
