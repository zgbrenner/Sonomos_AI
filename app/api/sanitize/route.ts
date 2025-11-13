import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Type definitions for the response
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

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: text field is required' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      );
    }

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct the prompt for structured JSON response
    const systemPrompt = `You are Sonomos AI, a privacy and data-loss-prevention assistant. Your job is to detect sensitive data in text and "cloak" it with placeholders.

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no extra text. Just pure JSON.

SENSITIVE DATA CATEGORIES TO DETECT:
- Email addresses
- Phone numbers (any format)
- Physical addresses (street addresses with numbers)
- URLs with tokens, query strings, or sensitive IDs
- Order IDs, invoice numbers, tracking numbers, confirmation numbers
- Customer IDs, account numbers, membership IDs
- Credit card numbers and payment card details
- Bank account numbers and routing numbers
- Government IDs (SSNs, EINs, tax IDs, passport numbers, etc.)
- Transaction IDs and unique identifiers linked to persons/accounts
- Personal names when appearing with sensitive data

OBFUSCATION RULES:
1. Email addresses → {{EMAIL_1}}, {{EMAIL_2}}, etc.
2. Phone numbers → {{PHONE_1}}, {{PHONE_2}}, etc.
3. Physical addresses → {{ADDRESS_1}}, {{ADDRESS_2}}, etc.
4. Order IDs → {{ORDER_ID_1}}, {{ORDER_ID_2}}, etc.
5. Invoice numbers → {{INVOICE_ID_1}}, {{INVOICE_ID_2}}, etc.
6. Account/Customer IDs → {{ACCOUNT_ID_1}}, {{CUSTOMER_ID_1}}, etc.
7. Credit cards → Mask all but last 4: "**** **** **** 4242"
8. Bank accounts → {{BANK_ACCOUNT_1}}, etc.
9. Routing numbers → {{ROUTING_NUMBER_1}}, etc.
10. SSNs/Tax IDs → {{SSN_1}}, {{TAX_ID_1}}, etc.
11. Generic unique IDs → {{ID_1}}, {{ID_2}}, etc.
12. Tracking numbers → {{TRACKING_1}}, etc.
13. Transaction IDs → {{TRANSACTION_ID_1}}, etc.

IMPORTANT GUIDELINES:
- Preserve text structure, grammar, and context
- Only obfuscate sensitive pieces
- Use consistent numbering within the same category
- Preserve currency amounts and dates unless they identify someone
- If uncertain, err on the side of obfuscating
- NEVER introduce real or fabricated sensitive data

RISK LEVEL DETERMINATION:
- LOW: 0-1 items detected, no financial/government IDs
- MEDIUM: 2-5 items detected, but no payment cards, bank accounts, or government IDs
- HIGH: Payment cards, bank accounts, SSNs, tax IDs, or 6+ items detected

You MUST respond with this exact JSON structure (no markdown, no extra text):

{
  "sanitized_text": "the cloaked version of the input text",
  "risk_level": "LOW" or "MEDIUM" or "HIGH",
  "stats": {
    "emails": 0,
    "phone_numbers": 0,
    "addresses": 0,
    "payment_cards": 0,
    "bank_accounts": 0,
    "order_ids": 0,
    "invoice_ids": 0,
    "generic_ids": 0
  }
}

CRITICAL: Your response must be ONLY the JSON object above. Do NOT wrap it in markdown code blocks. Do NOT add any explanatory text before or after.`;

    const userPrompt = `Analyze and cloak sensitive data in this text:

${text}

Remember: Respond with ONLY the JSON object. No markdown formatting, no code blocks, no explanations.`;

    // Call Gemini API - FIXED VERSION
    const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);

    const response = await result.response;
    let responseText = response.text();

    // Clean up response - remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    let sanitizeResponse: SanitizeResponse;
    try {
      sanitizeResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!sanitizeResponse.sanitized_text || !sanitizeResponse.risk_level || !sanitizeResponse.stats) {
      console.error('Invalid response structure:', sanitizeResponse);
      return NextResponse.json(
        { error: 'Invalid AI response structure. Please try again.' },
        { status: 500 }
      );
    }

    // Return structured response
    return NextResponse.json(sanitizeResponse);

  } catch (error: any) {
    console.error('Error sanitizing text:', error);
    
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cloak text. Please try again.' },
      { status: 500 }
    );
  }
}
