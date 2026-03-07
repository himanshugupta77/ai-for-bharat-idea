/**
 * Example usage of EligibilityForm and EligibilityResult components
 * 
 * This file demonstrates how to integrate the eligibility check flow
 * into your application.
 */

import React, { useState } from 'react';
import { EligibilityForm } from './EligibilityForm';
import { EligibilityResult } from './EligibilityResult';
import { api } from '../utils/api';
import type { UserInfo, EligibilityResult as EligibilityResultType } from '../types';

type FlowState = 'form' | 'loading' | 'result';

interface EligibilityFlowProps {
  schemeId: string;
  schemeName: string;
  onClose: () => void;
}

export const EligibilityFlowExample: React.FC<EligibilityFlowProps> = ({
  schemeId,
  schemeName,
  onClose,
}) => {
  const [flowState, setFlowState] = useState<FlowState>('form');
  const [result, setResult] = useState<EligibilityResultType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (userInfo: UserInfo) => {
    setFlowState('loading');
    setError(null);

    try {
      // Call the eligibility check API
      const response = await api.checkEligibility({
        schemeId,
        userInfo,
      });

      setResult(response);
      setFlowState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFlowState('form');
    }
  };

  const handleApply = () => {
    // Open the official website in a new tab
    if (result?.schemeDetails) {
      // In a real implementation, you would get the official website URL
      // from the scheme details or API response
      window.open('https://example.gov.in', '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setFlowState('form');
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="min-h-screen p-4">
      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {flowState === 'loading' && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-900 dark:text-white">
            Checking your eligibility...
          </p>
        </div>
      )}

      {/* Form State */}
      {flowState === 'form' && (
        <EligibilityForm
          schemeId={schemeId}
          schemeName={schemeName}
          onSubmit={handleFormSubmit}
          onCancel={handleClose}
        />
      )}

      {/* Result State */}
      {flowState === 'result' && result && (
        <EligibilityResult
          result={result}
          onClose={handleClose}
          onApply={handleApply}
        />
      )}
    </div>
  );
};

/**
 * Usage in a parent component:
 * 
 * ```tsx
 * import { EligibilityFlowExample } from './components/EligibilityFlow.example';
 * 
 * function MyComponent() {
 *   const [showEligibility, setShowEligibility] = useState(false);
 *   
 *   return (
 *     <>
 *       <button onClick={() => setShowEligibility(true)}>
 *         Check Eligibility
 *       </button>
 *       
 *       {showEligibility && (
 *         <EligibilityFlowExample
 *           schemeId="pm-kisan"
 *           schemeName="PM-KISAN"
 *           onClose={() => setShowEligibility(false)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 */
