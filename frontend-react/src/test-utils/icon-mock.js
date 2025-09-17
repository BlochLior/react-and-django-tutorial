// Mock for react-icons/fa icons used throughout the application
import React from 'react';

// Icons used in ResultsSummary component
export const FaVoteYea = () => React.createElement('span', { 'data-testid': 'icon-fa-vote-yea' }, '🗳️');
export const FaClock = () => React.createElement('span', { 'data-testid': 'icon-fa-clock' }, '⏰');
export const FaQuestionCircle = () => React.createElement('span', { 'data-testid': 'icon-fa-question-circle' }, '❓');
export const FaExclamationTriangle = () => React.createElement('span', { 'data-testid': 'icon-fa-exclamation-triangle' }, '⚠️');

// Icons used in ReviewPage component
export const FaCheck = () => React.createElement('span', { 'data-testid': 'icon-fa-check' }, '✅');
export const FaPaperPlane = () => React.createElement('span', { 'data-testid': 'icon-fa-paper-plane' }, '✈️');

// Icons used in PollsContainer component
export const FaEye = () => React.createElement('span', { 'data-testid': 'icon-fa-eye' }, '👁️');

// Icons used in AdminDashboard component
export const FaPlus = () => React.createElement('span', { 'data-testid': 'icon-fa-plus' }, '➕');

// Icons used in AdminQuestionList component
export const FaInfoCircle = () => React.createElement('span', { 'data-testid': 'icon-fa-info-circle' }, 'ℹ️');

// Icons used in AdminQuestionCard component
export const FaEdit = () => React.createElement('span', { 'data-testid': 'icon-fa-edit' }, '✏️');

// Icons used in SuccessPage component
export const FaCheckCircle = () => React.createElement('span', { 'data-testid': 'icon-fa-check-circle' }, '✅');
export const FaPoll = () => React.createElement('span', { 'data-testid': 'icon-fa-poll' }, '📊');
export const FaChartBar = () => React.createElement('span', { 'data-testid': 'icon-fa-chart-bar' }, '📈');
export const FaHome = () => React.createElement('span', { 'data-testid': 'icon-fa-home' }, '🏠');
export const FaRedo = () => React.createElement('span', { 'data-testid': 'icon-fa-redo' }, '🔄');

// Icons used in QuestionForm component
export const FaTrash = () => React.createElement('span', { 'data-testid': 'icon-fa-trash' }, '🗑️');

// Icons used in Pagination component
export const FaChevronLeft = () => React.createElement('span', { 'data-testid': 'icon-fa-chevron-left' }, '◀️');
export const FaChevronRight = () => React.createElement('span', { 'data-testid': 'icon-fa-chevron-right' }, '▶️');

// Named export for the entire module
const IconMocks = {
  // ResultsSummary icons
  FaVoteYea,
  FaClock,
  FaQuestionCircle,
  FaExclamationTriangle,
  // ReviewPage icons
  FaCheck,
  FaPaperPlane,
  // PollsContainer icons
  FaEye,
  // AdminDashboard icons
  FaPlus,
  // AdminQuestionList icons
  FaInfoCircle,
  // AdminQuestionCard icons
  FaEdit,
  // SuccessPage icons
  FaCheckCircle,
  FaPoll,
  FaChartBar,
  FaHome,
  FaRedo,
  // QuestionForm icons
  FaTrash,
  // Pagination icons
  FaChevronLeft,
  FaChevronRight,
};

export default IconMocks;
