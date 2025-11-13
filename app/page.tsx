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

// Risk Traffic Light Component
function RiskTrafficLight({ risk }: { risk: 'LOW' | 'MEDIUM' | 'HIGH' | null }) {
  if (!risk) return null;

  const activeColor = {
    LOW: '#10b981',
    MEDIUM: '#f59e0b',
    HIGH: '#ef4444',
  }[risk];

  return (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <svg width="32" height="60" viewBox="0 0 32 60" style={{ margin: '0 auto' }}>
        <rect x="4" y="0" width="24" height="60" fill="#000" rx="4" />
        <circle cx="16" cy="12" r="6" fill={risk === 'HIGH' ? activeColor : '#333'} />
        <circle cx="16" cy="30" r="6" fill={risk === 'MEDIUM' ? activeColor : '#333'} />
        <circle cx="16" cy="48" r="6" fill={risk === 'LOW' ? activeColor : '#333'} />
      </svg>
    </div>
  );
}

// Example data
const EXAMPLES = [
  {
    name: 'E-commerce Order',
    text: `Help me respond to this email:

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
Let me know if you need anything else!`
  },
  {
    name: 'Medical Appointment',
    text: `Appointment Confirmation

Patient: Michael Rodriguez
DOB: 05/15/1982
Patient ID: MED-78945612
SSN: 456-78-9012

Appointment Details:
Date: November 20, 2024
Time: 2:30 PM
Doctor: Dr. Emily Chen
Location: Suite 405, 789 Medical Plaza

Insurance Information:
Provider: BlueCross BlueShield
Policy #: BC-9988776655
Group #: GRP-445566

Contact:
Phone: (555) 234-5678
Email: m.rodriguez@email.com

Please arrive 15 minutes early for check-in.`
  },
  {
    name: 'Corporate Memo',
    text: `INTERNAL MEMO - CONFIDENTIAL

To: Department Managers
From: HR Department
Re: Q4 Performance Reviews

Employee Information for Review:

1. Jennifer Williams
   Employee ID: EMP-10234
   Ext: 5567
   Direct: (555) 123-9876
   Email: j.williams@company.com

2. Robert Kim
   Employee ID: EMP-10235
   Ext: 5568
   Direct: (555) 123-9877
   Email: r.kim@company.com

Payroll Account: PA-887766
Department Code: DEPT-450

Please submit completed reviews to hr-reviews@company.com by Nov 30.

Contact HR at ext. 5500 with questions.`
  },
  {
    name: 'Customer Support Ticket',
    text: `Support Ticket #TICK-887766

Customer: Amanda Peterson
Account #: CUST-445566-AA
Email: a.peterson@email.com
Phone: (555) 876-5432

Issue: Billing discrepancy

Recent Transactions:
- Invoice #INV-20241101-445
  Amount: $1,250.00
  Card: **** **** **** 8899
  
- Invoice #INV-20241108-446
  Amount: $850.00
  Card: **** **** **** 8899

Customer requests refund to account ending in 3344.
Routing #: 021000021

Priority: HIGH
Assigned to: Support Agent SA-1123

Resolution needed by: Nov 15, 2024`
  },
  {
    name: 'Chat Transcript',
    text: `Customer Chat Transcript - Session ID: CHAT-20241113-9988

[10:23 AM] Customer: Hi, I need help with my order
[10:23 AM] Agent: Hello! I'd be happy to help. Can I get your order number?
[10:24 AM] Customer: It's ORD-2024-556677
[10:24 AM] Agent: Thank you. I see that order. Can you verify your email?
[10:24 AM] Customer: Sure, it's john.smith@email.com
[10:25 AM] Agent: Perfect. And the last 4 of the card used?
[10:25 AM] Customer: 7788
[10:25 AM] Agent: Great, found it. Card ending in 7788, amount $2,450.00
[10:26 AM] Customer: Yes that's right
[10:26 AM] Agent: Your tracking number is 1Z888BB20987654321
[10:26 AM] Customer: Thanks! Can you send updates to my phone?
[10:27 AM] Agent: Of course. What's your mobile number?
[10:27 AM] Customer: (555) 999-8877
[10:27 AM] Agent: Done! You'll get SMS updates.
[10:28 AM] Customer: Perfect, thank you!

Agent ID: AGT-5567
Customer Account: ACC-778899
Session Duration: 5 minutes`
  }
];

export default function Home() {
  const [originalText, setOriginalText] = useState('');
  const [result, setResult] = useState<SanitizeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

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

  const handleLoadExample = (example: typeof EXAMPLES[0]) => {
    setOriginalText(example.text);
    setResult(null);
    setError('');
    setShowExamples(false);
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <header style={{
          textAlign: 'center',
          marginBottom: '3rem',
          borderBottom: '1px solid #000',
          paddingBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}>
            <TrafficLightIcon />
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: 0,
              color: '#000',
              letterSpacing: '0.05em',
            }}>
              SONOMOS AI
            </h1>
          </div>

          {/* Navigation */}
          <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '1.5rem',
            marginBottom: '1rem',
          }}>
            
              href="/"
              style={{
                color: '#000',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '700',
                borderBottom: '2px solid #000',
                paddingBottom: '2px',
              }}
            >
              CLOAK
            </a>
            
              href="/dagger"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              DAGGER
            </a>
          </nav>

          <p style={{
            fontSize: '1.1rem',
            color: '#333',
            margin: '0.5rem auto 0',
            maxWidth: '600px',
          }}>
            Cloak your data before the AI sees it.
          </p>
          <p style={{
            fontSize: '0.95rem',
            color: '#666',
            margin: '0.5rem auto 0',
            maxWidth: '700px',
          }}>
            Automatically detect and hide sensitive information before sending to ChatGPT, Gemini, or any AI system.
          </p>
        </header>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}>
          {/* Left Panel - Original Text */}
          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#000',
              fontSize: '1rem',
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
              placeholder="Paste your text here..."
              style={{
                width: '100%',
                minHeight: '320px',
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !originalText.trim()}
                style={{
                  flex: '1',
                  minWidth: '140px',
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
                  if (!isLoading && originalText.trim()) {
                    e.currentTarget.style.opacity = '0.8';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {isLoading ? 'Analyzing...' : 'Analyze & Cloak'}
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

            {/* Examples Section */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExamples(!showExamples)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #000',
                  borderRadius: '2px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Load Example</span>
                <span>{showExamples ? '▲' : '▼'}</span>
              </button>
              
              {showExamples && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #000',
                  borderTop: 'none',
                  zIndex: 10,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {EXAMPLES.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleLoadExample(example)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#fff',
                        color: '#000',
                        border: 'none',
                        borderBottom: index < EXAMPLES.length - 1 ? '1px solid #ddd' : 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }}
                    >
                      <strong>{example.name}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Cloaked Text & Risk Summary */}
          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#000',
              fontSize: '1rem',
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
                border: '1px solid #000',
                borderRadius: '2px',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                marginBottom: '1rem',
                overflow: 'auto',
                color: '#000',
              }}
            >
              {result?.sanitized_text || (isLoading ? 'Analyzing and cloaking sensitive data...' : 'Your cloaked text will appear here')}
            </div>
            {result && (
              <button
                onClick={handleCopy}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: copySuccess ? '#10b981' : '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                }}
              >
                {copySuccess ? '✓ Copied!' : 'Copy Cloaked Text'}
              </button>
            )}

            {/* Risk Summary Panel */}
            {result && (
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '2px',
                padding: '1.5rem',
                border: '1px solid #000',
              }}>
                <RiskTrafficLight risk={result.risk_level} />
                
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  marginBottom: '0.75rem',
                  color: '#000',
                  textAlign: 'center',
                }}>
                  Risk Summary
                </h3>
                
                <p style={{
                  fontSize: '0.95rem',
                  color: '#333',
                  marginBottom: '1.25rem',
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}>
                  {getRiskMessage(result.risk_level)}
                </p>

                <div style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: '2px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                  }}>
                    <div>Emails redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.emails}</div>
                    
                    <div>Phone numbers redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.phone_numbers}</div>
                    
                    <div>Addresses redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.addresses}</div>
                    
                    <div>Payment cards redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.payment_cards}</div>
                    
                    <div>Bank accounts redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.bank_accounts}</div>
                    
                    <div>Order IDs redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.order_ids}</div>
                    
                    <div>Invoice IDs redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.invoice_ids}</div>
                    
                    <div>Generic IDs redacted:</div>
                    <div style={{ fontWeight: '600' }}>{result.stats.generic_ids}</div>
                    
                    <div style={{ 
                      borderTop: '1px solid #000',
                      paddingTop: '0.75rem',
                      marginTop: '0.5rem',
                      fontWeight: '700',
                    }}>
                      Total items cloaked:
                    </div>
                    <div style={{
                      borderTop: '1px solid #000',
                      paddingTop: '0.75rem',
                      marginTop: '0.5rem',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                    }}>
                      {totalRedacted}
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.8rem',
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: '1.4',
                }}>
                  Sonomos AI does not store or transmit your original input. Sanitization happens server-side only.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #000',
            borderRadius: '2px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#c00',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* How It Works Section */}
        <div style={{
          maxWidth: '800px',
          margin: '3rem auto 0',
          padding: '2rem',
          borderTop: '1px solid #000',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#000',
          }}>
            How It Works
          </h3>
          <p style={{
            fontSize: '0.95rem',
            lineHeight: '1.6',
            color: '#333',
          }}>
            Sonomos AI uses advanced AI to detect emails, phone numbers, payment details, IDs, and other sensitive data in your text. 
            It replaces them with placeholders or masks them before you send to ChatGPT, Gemini, or any AI system. 
            We only show counts and placeholders—never store or show your raw data.
          </p>
        </div>
      </div>
    </div>
  );
}