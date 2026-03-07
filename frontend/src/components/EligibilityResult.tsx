import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { useLowBandwidth } from '../hooks';
import { announceToScreenReader } from '../utils/accessibility';
import type { EligibilityResult as EligibilityResultType } from '../types';

interface EligibilityResultProps {
  result: EligibilityResultType;
  onClose: () => void;
  onApply?: () => void;
}

export const EligibilityResult: React.FC<EligibilityResultProps> = ({
  result,
  onClose,
  onApply,
}) => {
  const { isLowBandwidth } = useLowBandwidth();
  const { t } = useTranslation();

  // Announce result to screen readers
  useEffect(() => {
    const message = result.eligible
      ? `You are eligible for ${result.schemeDetails.name}. ${result.explanation.summary}`
      : `You are not eligible for ${result.schemeDetails.name}. ${result.explanation.summary}`;
    
    announceToScreenReader(message, 'assertive');
  }, [result]);

  const animationProps = isLowBandwidth
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4, ease: 'easeOut' },
      };

  return (
    <motion.div {...animationProps}>
      <GlassCard className="p-6 max-w-3xl mx-auto" hover={false}>
        {/* Eligibility Status Header */}
        <div className="mb-6" role="status" aria-live="assertive">
          <div className="flex items-center gap-4 mb-3">
            {result.eligible ? (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.eligible ? t('eligibility.result.eligible') : t('eligibility.result.notEligible')}
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {t('eligibility.form.for')} <span className="font-semibold">{result.schemeDetails.name}</span>
              </p>
            </div>
          </div>

          {/* Summary */}
          <div
            className={`p-4 rounded-lg ${
              result.eligible
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-red-500/10 border border-red-500/30'
            }`}
          >
            <p className="text-sm text-gray-900 dark:text-white">
              {result.explanation.summary}
            </p>
          </div>
        </div>

        {/* Eligibility Criteria Checklist */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('eligibility.result.criteria')}
          </h3>
          <div className="space-y-3" role="list" aria-label="Eligibility criteria checklist">
            {result.explanation.criteria.map((criterion, index) => (
              <motion.div
                key={index}
                initial={isLowBandwidth ? {} : { opacity: 0, x: -20 }}
                animate={isLowBandwidth ? {} : { opacity: 1, x: 0 }}
                transition={isLowBandwidth ? {} : { delay: index * 0.1, duration: 0.3 }}
                className={`p-4 rounded-lg border ${
                  criterion.met
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {criterion.met ? (
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-red-600 dark:text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Criterion Details */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {criterion.criterion}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      <span className="font-medium">Required:</span> {criterion.required}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Your value:</span> {criterion.userValue}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        criterion.met
                          ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {criterion.met ? t('eligibility.result.met') : t('eligibility.result.notMet')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scheme Benefits (only if eligible) */}
        {result.eligible && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('schemes.benefits')}
            </h3>
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-orange-500/20">
              <p className="text-sm text-gray-900 dark:text-white">
                {result.schemeDetails.benefits}
              </p>
            </div>
          </div>
        )}

        {/* Application Process (only if eligible) */}
        {result.eligible && result.schemeDetails.applicationProcess.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('schemes.applicationSteps')}
            </h3>
            <ol className="space-y-2" role="list" aria-label="Application steps">
              {result.schemeDetails.applicationProcess.map((step, index) => (
                <motion.li
                  key={index}
                  initial={isLowBandwidth ? {} : { opacity: 0, x: -20 }}
                  animate={isLowBandwidth ? {} : { opacity: 1, x: 0 }}
                  transition={isLowBandwidth ? {} : { delay: index * 0.1, duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 dark:bg-black/10"
                  role="listitem"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-sm text-gray-900 dark:text-white pt-0.5">
                    {step}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        )}

        {/* Required Documents (only if eligible) */}
        {result.eligible && result.schemeDetails.requiredDocuments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('schemes.documents')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.schemeDetails.requiredDocuments.map((document, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 dark:bg-black/10"
                >
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {document}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/20 dark:border-white/10">
          {result.eligible && onApply && (
            <GlassButton
              onClick={onApply}
              className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold"
            >
              {t('schemes.applyNow')}
            </GlassButton>
          )}
          <GlassButton
            onClick={onClose}
            className={result.eligible ? 'sm:w-auto px-8' : 'flex-1'}
          >
            {result.eligible ? t('common.close') : t('eligibility.result.tryAnother')}
          </GlassButton>
        </div>
      </GlassCard>
    </motion.div>
  );
};
