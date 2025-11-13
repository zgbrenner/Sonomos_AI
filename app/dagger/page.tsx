'use client';

import React from 'react';
import { useState } from 'react';
import SensitiveSpan from '@/components/SensitiveSpan';

interface DaggerResponse {
  annotatedText: string;
}

// Simple XML parser for SENSITIVE tags
function parseAnnotatedText(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  const regex = /<SENSITIVE type="([^"]+)" risk="([^"]+)">([^<]+)<\/SENSITIVE>/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push(
        <span key={`text-${key++}`}>{text.substring(lastIndex, match.index)}</span>
      );
    }

    // Add the sensitive span
    segments.push(
      <SensitiveSpan
        key={`sensitive-${key++}`}
        type={match[1]}
        risk={match[2] as 'high' | 'medium'}
        text={match[3]}
      />
    );

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push(
      <span key={`text-${key++}`}>{text.substring(lastIndex)}</span>
    );
  }

  return segments;
}

// Traffic Light Icon Component
function TrafficLightIcon() {
  return (
    <svg width="32" height="60" viewBox="0 0 32 60" style={{ marginRight: '12px' }}>
      <rect x="4" y="0" width="24" height="60" fill="#000" rx="4" />
      <circle cx="16" cy="12" r="6" fill="#ef4444" />
      <circle cx="16" cy="30" r="6" fill="#f59e0b" />
      <circle cx="16" cy="48" r="6" fill="#10b981" />
    </svg>
  );
}

export default function DaggerPage() {
  const [inputText, setInputText] = useState('');
  const [annotatedText, setAnnotatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setError('');
    setAnnotatedText('');

    if (!inputText.trim()) {
      setError('Please enter some text to scan');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/dagger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data: DaggerResponse & { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan text');
      }

      setAnnotatedText(data.annotatedText);
    } catch (err: any) {
      setError(err.message || 'An error occurred while scanning the text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setAnnotatedText('');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <header
          style={{
            borderBottom: '1px solid #000',
            paddingBottom: '2rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <TrafficLightIcon />
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                margin: 0,
                color: '#000',
                letterSpacing: '0.05em',
              }}
            >
              SONOMOS AI
            </h1>
          </div>

          {/* Navigation */}
          <nav
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '1rem',
            }}
          >
            <a
              href="/"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              CLOAK
            </a>
            <a
              href="/dagger"
              style={{
                color: '#000',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '700',
                borderBottom: '2px solid #000',
                paddingBottom: '2px',
              }}
            >
              DAGGER
            </a>
          </nav>
        </header>

        {/* Page Title */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#000',
            }}
          >
            DAGGER – Inline Risk Detection
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            See sensitive information underlined before you send it to an AI.
          </p>
        </div>

        {/* Main Content */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {/* Input Section */}
          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#000',
                fontSize: '1rem',
              }}
            >
              Text you're about to send to an AI
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here to detect sensitive information..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                border: '1px solid #000',
                borderRadius: '2px',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                resize: 'vertical',
                marginBottom: '1rem',
                backgroundColor: '#FFF',
                color: '#000',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleScan}
                disabled={isLoading || !inputText.trim()}
                style={{
                  flex: '1',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isLoading ? '#ccc' : '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputText.trim()) {
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {isLoading ? 'Scanning...' : 'Scan with DAGGER'}
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #000',
                  borderRadius: '2px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div
              style={{
                backgroundColor: '#fee',
                border: '1px solid #000',
                borderRadius: '2px',
                padding: '1rem',
                marginBottom: '2rem',
                color: '#c00',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Results Section */}
          {annotatedText && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  color: '#000',
                  fontSize: '1rem',
                }}
              >
                Detected risk (inline view)
              </label>
              <div
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '1rem',
                  border: '1px solid #000',
                  borderRadius: '2px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFF',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: '#000',
                  lineHeight: '1.8',
                }}
              >
                {parseAnnotatedText(annotatedText)}
              </div>

              {/* Legend */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#333' }}>
                  <strong>Legend:</strong>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      gap: '2rem',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          textDecoration: 'underline',
                          textDecorationColor: 'red',
                          textDecorationThickness: '2px',
                        }}
                      >
                        Red underline
                      </span>{' '}
                      = High risk (payment cards, bank accounts, government IDs)
                    </div>
                    <div>
                      <span
                        style={{
                          textDecoration: 'underline',
                          textDecorationColor: 'orange',
                          textDecorationThickness: '2px',
                        }}
                      >
                        Yellow underline
                      </span>{' '}
                      = Medium risk (emails, phones, addresses, IDs)
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      color: '#666',
                    }}
                  >
                    Hover over any underlined text to see details.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div
          style={{
            maxWidth: '800px',
            margin: '3rem auto 0',
            padding: '2rem',
            borderTop: '1px solid #000',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#000',
            }}
          >
            How DAGGER Works
          </h3>
          <p
            style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: '#333',
            }}
          >
            DAGGER scans your text and highlights sensitive information inline. Red underlines indicate high-risk data
            (payment cards, bank accounts, government IDs). Yellow underlines indicate medium-risk data (emails, phone numbers,
            addresses, order IDs). Hover over any underlined segment to see what type of information was detected.
          </p>
        </div>
      </div>
    </div>
  );
}
