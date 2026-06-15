// ============================================================
// useProposal Hook — Prompt 2 logic and Supabase save
// ============================================================

import { useState, useCallback } from 'react';
import { generateProposal } from '../api/aiProvider';
import { GENERATION_SYSTEM_PROMPT } from '../prompts/generationPrompt';
import { saveSession } from '../utils/sessionManager';

export function useProposal() {
  const [proposalHtml, setProposalHtml] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(
    async ({ proposalJson, sessionId, conversationHistory }) => {
      if (!proposalJson) return;
      setIsGenerating(true);
      setError(null);

      try {
        const fullPrompt = `${GENERATION_SYSTEM_PROMPT}

---
## CLIENT DATA JSON
\`\`\`json
${JSON.stringify(proposalJson, null, 2)}
\`\`\`

Generate the full proposal HTML now. Output ONLY the HTML — no markdown fences, no extra text.`;

        const html = await generateProposal(fullPrompt);

        // Strip any accidental markdown fences
        const cleaned = html
          .replace(/^```html\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();

        setProposalHtml(cleaned);

        // Silent background save
        saveSession({
          sessionId,
          clientName: proposalJson.clientName,
          clientType: proposalJson.clientType,
          conversationHistory,
          finalProposal: cleaned,
          proposalJson,
        });
      } catch (err) {
        console.error('[useProposal] Generation error:', err);
        setError(err.message || 'Failed to generate proposal. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const clearProposal = useCallback(() => {
    setProposalHtml(null);
    setError(null);
  }, []);

  return {
    proposalHtml,
    isGenerating,
    error,
    generate,
    clearProposal,
  };
}
