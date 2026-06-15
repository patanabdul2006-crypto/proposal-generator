// ============================================================
// useChat Hook — Prompt 1 logic, JSON extraction, refinement
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { sendMessage } from '../api/aiProvider';
import { COLLECTION_SYSTEM_PROMPT } from '../prompts/collectionPrompt';
import { generateSessionId } from '../utils/sessionManager';

const JSON_REGEX = /<PROPOSAL_JSON>([\s\S]*?)<\/PROPOSAL_JSON>/;

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I am the Proposal Generator Agent. I will help you collect client details and generate a proposal.\n\nPlease share the client's name, type (Hospital or Doctor), city, and what services they need — you can tell me everything at once or I'll guide you step by step.",
};

export function useChat({ onProposalJsonReady }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [proposalJson, setProposalJson] = useState(null);
  const [isRefinementMode, setIsRefinementMode] = useState(false);
  const sessionId = useRef(generateSessionId());

  const extractJson = useCallback((text) => {
    const match = text.match(JSON_REGEX);
    if (!match) return null;
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      console.error('[useChat] JSON parse error:', e);
      return null;
    }
  }, []);

  const sendUserMessage = useCallback(
    async (userInput) => {
      if (!userInput.trim()) return;
      setError(null);

      const userMessage = { role: 'user', content: userInput };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsTyping(true);

      try {
        const responseText = await sendMessage(updatedMessages, COLLECTION_SYSTEM_PROMPT);

        // Strip <PROPOSAL_JSON> block from displayed message
        let displayText = responseText.replace(JSON_REGEX, '').trim();

        // ── Sanitise AI filler ──────────────────────────────
        // The model sometimes generates multi-turn simulations
        // within a single response (e.g. "User hasn't responded
        // yet. We'll wait."). Strip all such lines aggressively.
        const FILLER_PATTERNS = [
          /^.*user hasn.t responded.*$/gim,
          /^.*we.ll wait.*$/gim,
          /^.*waiting for.*(?:user|input|reply|response|answer).*$/gim,
          /^.*we.* (?:wait|remain|stand\s*by).*$/gim,
          /^.*no further output.*$/gim,
          /^\(.*\)$/gim,  // lines that are just parenthetical stage directions
          /^.*user didn.t answer.*$/gim,
          /^.*we should not output.*$/gim,
        ];
        for (const pattern of FILLER_PATTERNS) {
          displayText = displayText.replace(pattern, '');
        }
        // Collapse leftover blank lines into at most one newline
        displayText = displayText.replace(/\n{3,}/g, '\n\n').trim();

        const assistantMessage = { role: 'assistant', content: displayText };

        setMessages((prev) => [...prev, assistantMessage]);

        // Check for JSON output
        const extracted = extractJson(responseText);
        if (extracted) {
          setProposalJson(extracted);
          if (!isRefinementMode) {
            setIsRefinementMode(true);
          }
          onProposalJsonReady(extracted, sessionId.current, [
            ...updatedMessages,
            assistantMessage,
          ]);
        }
      } catch (err) {
        console.error('[useChat] Error:', err);
        setError(err.message || 'Something went wrong. Please try again.');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '⚠️ I encountered an error. Please try again.',
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isRefinementMode, extractJson, onProposalJsonReady]
  );

  const resetChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setProposalJson(null);
    setIsRefinementMode(false);
    setError(null);
    sessionId.current = generateSessionId();
  }, []);

  return {
    messages,
    isTyping,
    error,
    proposalJson,
    isRefinementMode,
    sessionId: sessionId.current,
    sendUserMessage,
    resetChat,
  };
}
