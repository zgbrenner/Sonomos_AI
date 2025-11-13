'use client';

import { useState } from 'react';

// Type definitions
interface SanitizeResponse {
  sanitized_text: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  stats: {
    emails: number;
    phone_numbers: number;
    addresses: number;
    payment_cards: number;
    bank_accounts: number;
    order_ids: number;
    invoice_ids: number;
    generic_ids: number;
  };
}

// Traffic Light Component
function TrafficLight({ risk }: { risk: 'LOW' | 'MEDIUM' | 'HIGH' | null }) {
  if (!risk) return null;

  const colors = {
    LOW: '#10b981',    // green
    MEDIUM: '#f59e0b', // yellow/amber
    HIGH: '#ef4444',   // red
  };

  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: colors[risk],
          margin: '0 auto',
          boxShadow: `0 0 12px ${colors[risk]}40`,
          border: '3px solid white',
          outline: `2px solid ${colors[risk]}`,
        }}
      />
    </div>
  );
}

// Example data for demo
const EXAMPLE_TEXT = `Help me respond to this email:

Hi Sarah, here are the details for your recent order:

Order ID: ORD-2024-789456
Invoice: INV-445566
Tracking: 1Z999AA10123456784

Payment processed:
Card ending in 4242
Amount: $3,482.55
Transaction ID: TXN-20241113-ABCD

Shipping to:
Sarah Johnson
123 Oak Avenue, Apt 4B
San Francisco, CA 94102

Contact info:
Email: sarah.j@company.com
Phone: (415) 555-0123

Your account number is ACC-998877.
Let me know if you need anything else!`;

export default function Home() {
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState<SanitizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    setCopySuccess(false);

    if (!originalText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/sanitize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: originalText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cloak text');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while cloaking the text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.sanitized_text) {
      await navigator.clipboard.writeText(result.sanitized_text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleLoadExample = () => {
    setOriginalText(EXAMPLE_TEXT);
    setResult(null);
    setError('');
  };

  const handleClear = () => {
    setOriginalText('');
    setResult(null);
    setError('');
    setCopySuccess(false);
  };

  const getRiskMessage = (level: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (level) {
      case 'LOW':
        return 'Your text contains minimal identifiable information.';
      case 'MEDIUM':
        return 'Some sensitive details were detected and have been cloaked.';
      case 'HIGH':
        return 'High-risk data was detected. You should avoid sending the original text to any AI system.';
    }
  };

  const totalRedacted = result
    ? Object.values(result.stats).reduce((sum, val) => sum + val, 0)
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: 'white',
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}>
            🛡️ Sonomos AI
          </h1>
          <p style={{
            fontSize: '1.25rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            opacity: 0.95,
          }}>
            Cloak your data before the AI sees it.
          </p>
          <p style={{
            fontSize: '1rem',
            opacity: 0.85,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Automatically detect and hide sensitive information before sending to ChatGPT, Gemini, or any AI system.
          </p>
        </header>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Left Panel - Original Text */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#333',
              fontSize: '1.1rem',
            }}>
              Original text
              <span style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '400',
                color: '#666',
                marginTop: '0.25rem',
              }}>
                (what you were going to paste into ChatGPT / Gemini / etc.)
              </span>
            </label>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Hi, here are the order details:&#10;Order ID: 123-456-789&#10;Card: 4242 4242 4242 4242&#10;Email: customer@email.com&#10;..."
              style={{
                width: '100%',
                minHeight: '320px',
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                resize: 'vertical',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !originalText.trim()}
                style={{
                  flex: '1',
                  minWidth: '140px',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: isLoading ? '#9ca3af' : '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && originalText.trim()) {
                    e.currentTarget.style.backgroundColor = '#6d28d9';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isLoading ? '#9ca3af' : '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? '🔍 Analyzing...' : '🔒 Analyze & Cloak'}
              </button>
              <button
                onClick={handleLoadExample}
                disabled={isLoading}
                style={{
                  padding: '0.875rem 1.25rem',
                  backgroundColor: 'white',
                  color: '#7c3aed',
                  border: '2px solid #7c3aed',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📝 Load Example
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading}
                style={{
                  padding: '0.875rem 1.25rem',
                  backgroundColor: 'white',
                  color: '#666',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Panel - Cloaked Text & Risk Summary */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#333',
              fontSize: '1.1rem',
            }}>
              Cloaked text
              <span style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '400',
                color: '#666',
                marginTop: '0.25rem',
              }}>
                (safe to paste into your AI)
              </span>
            </label>
            <div
              style={{
                width: '100%',
                minHeight: '320px',
                padding: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                backgroundColor: '#f9fafb',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                marginBottom: '1rem',
                overflow: 'auto',
              }}
            >
              {result?.sanitized_text || (isLoading ? 'Analyzing and cloaking sensitive data...' : 'Your cloaked text will appear here')}
            </div>
            {result && (
              <button
                onClick={handleCopy}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: copySuccess ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '1.5rem',
                }}
              >
                {copySuccess ? '✓ Copied!' : '📋 Copy Cloaked Text'}
              </button>
            )}

            {/* Risk Summary Panel */}
            {result && (
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '1.5rem',
                border: '2px solid #e2e8f0',
              }}>
                <TrafficLight risk={result.risk_level} />
                
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: '#333',
                  textAlign: 'center',
                }}>
                  Risk Summary
                </h3>
                
                <p style={{
                  fontSize: '0.95rem',
                  color: '#555',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}>
                  {getRiskMessage(result.risk_level)}
                </p>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                  }}>
                    <div><strong>Emails redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.emails}</div>
                    
                    <div><strong>Phone numbers redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.phone_numbers}</div>
                    
                    <div><strong>Addresses redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.addresses}</div>
                    
                    <div><strong>Payment cards redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.payment_cards}</div>
                    
                    <div><strong>Bank accounts redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.bank_accounts}</div>
                    
                    <div><strong>Order IDs redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.order_ids}</div>
                    
                    <div><strong>Invoice IDs redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.invoice_ids}</div>
                    
                    <div><strong>Generic IDs redacted:</strong></div>
                    <div style={{ fontWeight: '600', color: '#7c3aed' }}>{result.stats.generic_ids}</div>
                    
                    <div style={{ 
                      borderTop: '2px solid #e5e7eb',
                      paddingTop: '0.75rem',
                      marginTop: '0.5rem',
                      fontWeight: '700',
                    }}>
                      Total items cloaked:
                    </div>
                    <div style={{
                      borderTop: '2px solid #e5e7eb',
                      paddingTop: '0.75rem',
                      marginTop: '0.5rem',
                      fontWeight: '700',
                      color: '#7c3aed',
                      fontSize: '1.1rem',
                    }}>
                      {totalRedacted}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                }}>
                  🔒 Sonomos AI does not store or transmit your original input. Sanitization happens server-side only.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#991b1b',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Footer Info */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
          }}>
            How It Works
          </h3>
          <p style={{
            fontSize: '0.95rem',
            lineHeight: '1.6',
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            Sonomos AI uses advanced AI to detect emails, phone numbers, payment details, IDs, and other sensitive data in your text. 
            It replaces them with placeholders or masks them before you send to ChatGPT, Gemini, or any AI system. 
            <strong> We only show counts and placeholders—never store or show your raw data.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}