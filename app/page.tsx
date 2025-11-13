'use client';

import React, { useState } from 'react';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface CloakResponse {
  sanitizedText: string;
  stats?: Record<string, number>;
  riskLevel?: RiskLevel;
  error?: string;
}

// Very dumb risk calculator as a fallback if the API doesn't send riskLevel
function computeRiskFromStats(stats?: Record<string, number>): RiskLevel {
  if (!stats) return 'LOW';

  const highKeys = ['payment_cards', 'payment_card', 'bank_accounts', 'bank_account', 'government_ids', 'ssn', 'token', 'api_keys'];
  const mediumKeys = ['emails', 'email', 'phones', 'phone', 'addresses', 'address', 'order_ids', 'order_id', 'invoice_ids', 'invoice_id'];

  let high = 0;
  let medium = 0;

  for (const [k, v] of Object.entries(stats)) {
    if (highKeys.includes(k)) high += v;
    else if (mediumKeys.includes(k)) medium += v;
  }

  if (high > 0 || medium >= 6) return 'HIGH';
  if (medium >= 2) return 'MEDIUM';
  return 'LOW';
}

function TrafficLightIcon({ risk }: { risk: RiskLevel | null }) {
  const redOn = risk === 'HIGH';
  const yellowOn = risk === 'MEDIUM';
  const greenOn = risk === 'LOW' || risk === null;

  const circleStyleBase: React.CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: '999px',
    border: '1px solid #000',
    backgroundColor: '#f5f5f5',
  };

  return (
    <div
      style={{
        border: '1px solid #000',
        borderRadius: 999,
        padding: '4px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginRight: '12px',
      }}
    >
      <span
        style={{
          ...circleStyleBase,
          backgroundColor: redOn ? '#ef4444' : '#f5f5f5',
        }}
      />
      <span
        style={{
          ...circleStyleBase,
          backgroundColor: yellowOn ? '#facc15' : '#f5f5f5',
        }}
      />
      <span
        style={{
          ...circleStyleBase,
          backgroundColor: greenOn ? '#22c55e' : '#f5f5f5',
        }}
      />
    </div>
  );
}

const examples: { label: string; text: string }[] = [
  {
    label: 'E-commerce order support',
    text: `Help me reply to this customer politely:

Hi,

My name is Sarah Lopez. I placed an order last week but haven’t received a shipping update. Here are the details:

Order ID: 4829-ALPHA-2291
Tracking number: 1Z 999 AA1 01 2345 6784
Amount charged: $249.99
Card used: 4242 4242 4242 4242
Billing email: sarah.lopez@example.com
Shipping address:
123 Market Street, Apt 4B
San Diego, CA 92101

Can you let me know when this will arrive?

Thanks,
Sarah`,
  },
  {
    label: 'Internal HR email',
    text: `Summarize this internal HR email for our leadership team:

Team,

We completed performance reviews for the following employees:

- Emily Richards (Employee ID: ER-1037, emily.richards@acme-corp.com)
- Marcus Lee (Employee ID: ML-1189, marcus.lee@acme-corp.com)
- Priya Patel (Employee ID: PP-1244, priya.patel@acme-corp.com)

Their new salary bands are:
- Emily: $115,000
- Marcus: $130,000
- Priya: $142,000

These changes will be reflected in payroll starting with the July 31st pay period and should be kept confidential.

Regards,
Anna
HR Director`,
  },
  {
    label: 'Legal – client email',
    text: `I am a lawyer. Help me summarize this client email for my internal notes, but DO NOT change any of the legal meaning:

Client: Michael Torres
Matter: Torres v. Horizon Logistics, Inc.
Case No.: 37-2025-00048291-CU-OE-CTL

Email from client:

"Hi,

I just wanted to update you before our meeting. My supervisor, Karen Blake, called me into her office on 10/03/2025 and told me that 'corporate is tired of the complaints' and that my performance improvement plan will be used as a basis to terminate me if I don't 'get back in line.'

She also mentioned that HR (specifically Daniel Cho) already has a file on me that includes my prior complaint about unpaid overtime from February 2024. She said, 'Once this goes upstairs, they're not going to care about your so-called wage issues.'

This all happened at the Horizon Logistics warehouse located at 8921 Fulton Industrial Blvd, Suite 200, San Diego, CA 92121.

Let me know what else you need from me before the deposition.

Thanks,
Michael
michael.torres@example.com
(555) 392-8844
"`,
  },
];

export default function CloakPage() {
  const [inputText, setInputText] = useState('');
  const [sanitizedText, setSanitizedText] = useState('');
  const [stats, setStats] = useState<Record<string, number> | undefined>(
    undefined
  );
  const [risk, setRisk] = useState<RiskLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExampleClick = (text: string) => {
    setInputText(text);
    setSanitizedText('');
    setError(null);
    setStats(undefined);
    setRisk(null);
  };

  const handleClear = () => {
    setInputText('');
    setSanitizedText('');
    setError(null);
    setStats(undefined);
    setRisk(null);
  };

  const handleCloak = async () => {
    setError(null);
    setSanitizedText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/cloak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data: CloakResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process text');
      }

      setSanitizedText(data.sanitizedText || '');
      setStats(data.stats);

      const riskLevel =
        data.riskLevel ?? computeRiskFromStats(data.stats ?? {});
      setRisk(riskLevel);
    } catch (e: any) {
      setError(e.message ?? 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalRedacted =
    stats != null
      ? Object.values(stats).reduce((sum, val) => sum + (val || 0), 0)
      : 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
            <TrafficLightIcon risk={risk} />
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                margin: 0,
                color: '#000',
                letterSpacing: '0.05em',
              }}
            >
              SONOMOS AI
            </h1>
          </div>

          {/* Nav */}
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
                color: '#000',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                borderBottom: '2px solid #000',
                paddingBottom: '2px',
              }}
            >
              CLOAK
            </a>
            <a
              href="/dagger"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              DAGGER
            </a>
          </nav>
        </header>

        {/* Title + blurb */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: '#000',
            }}
          >
            CLOAK – Obfuscate Sensitive Data Before the AI Sees It
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#666',
              maxWidth: 700,
              margin: '0 auto',
            }}
          >
            Paste your prompt here. CLOAK will replace high-risk details with
            placeholders so you can still get useful output without oversharing.
          </p>
        </div>

        {/* Main layout: left input / right output + risk */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '2rem',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {/* Left: Input + examples */}
          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.75rem',
                color: '#000',
                fontSize: '1rem',
              }}
            >
              Original text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Help me respond to this email... (you can safely paste the original text here, CLOAK will obfuscate sensitive pieces before they ever hit the AI).`}
              style={{
                width: '100%',
                minHeight: '220px',
                padding: '1rem',
                border: '1px solid #000',
                borderRadius: 2,
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                resize: 'vertical',
                marginBottom: '1rem',
                backgroundColor: '#FFF',
                color: '#000',
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <button
                onClick={handleCloak}
                disabled={isLoading || !inputText.trim()}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isLoading ? '#ccc' : '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {isLoading ? 'CLOAKING…' : 'CLOAK THIS PROMPT'}
              </button>
              <button
                onClick={handleClear}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: '1px solid #000',
                  borderRadius: 2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Clear
              </button>
            </div>

            {/* Examples */}
            <div
              style={{
                border: '1px solid #000',
                padding: '0.75rem',
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                }}
              >
                Try an example:
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                {examples.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => handleExampleClick(ex.text)}
                    style={{
                      padding: '0.35rem 0.7rem',
                      border: '1px solid #000',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Output + risk */}
          <div>
            {/* Risk panel */}
            <div
              style={{
                border: '1px solid #000',
                borderRadius: 2,
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}
                >
                  Risk summary
                </span>
                <TrafficLightIcon risk={risk} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#333' }}>
                {risk === null && (
                  <span>Run CLOAK to see a risk summary for this prompt.</span>
                )}
                {risk === 'LOW' && (
                  <span>
                    <strong>Low overall risk.</strong> Minor identifiers only or everything already looks fairly clean.
                  </span>
                )}
                {risk === 'MEDIUM' && (
                  <span>
                    <strong>Medium overall risk.</strong> Contains several
                    personal identifiers (emails, phone numbers, addresses or IDs).
                    CLOAK helps, but review before sending.
                  </span>
                )}
                {risk === 'HIGH' && (
                  <span>
                    <strong>High overall risk.</strong> Contains financial or
                    highly sensitive identifiers (payment cards, bank accounts,
                    government IDs, tokens). Strongly consider trimming the
                    source text.
                  </span>
                )}
              </div>
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  color: '#555',
                }}
              >
                Total items replaced: <strong>{totalRedacted}</strong>
              </div>
            </div>

            {/* Sanitized output */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: '#000',
                  fontSize: '1rem',
                }}
              >
                Cloaked text
              </label>
              <div
                style={{
                  width: '100%',
                  minHeight: '220px',
                  padding: '1rem',
                  border: '1px solid #000',
                  borderRadius: 2,
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#FFF',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: '#000',
                }}
              >
                {error && (
                  <span style={{ color: '#c00' }}>
                    <strong>Error:</strong> {error}
                  </span>
                )}
                {!error && !sanitizedText && (
                  <span style={{ color: '#666' }}>
                    CLOAK output will appear here. You can copy and paste this
                    into your favorite AI tool.
                  </span>
                )}
                {!error && sanitizedText && <>{sanitizedText}</>}
              </div>
            </div>
          </div>
        </div>

        {/* Tiny footer/explanation */}
        <div
          style={{
            maxWidth: 800,
            margin: '3rem auto 0',
            padding: '2rem 0 1rem',
            borderTop: '1px solid #000',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#444',
          }}
        >
          CLOAK is a prototype: it obfuscates obvious high-risk fields before your
          prompt ever reaches a model, so you can keep using powerful AI systems
          without giving them raw client, employee, or financial details.
        </div>
      </div>
    </div>
  );
}
