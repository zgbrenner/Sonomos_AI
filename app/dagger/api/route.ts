import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct the DAGGER-specific prompt
    const systemPrompt = `You are a data-loss-prevention assistant for a tool called SONOMOS DAGGER. Your job is to scan the user's text and mark any sensitive or high-risk data inline by wrapping each sensitive span in XML-like tags.

IMPORTANT: Do NOT change, redact, or modify the actual text content. Only add annotation tags around sensitive spans.

SENSITIVE DATA TYPES TO DETECT:
- email: Email addresses
- phone: Phone numbers (any format)
- address: Physical addresses (street addresses with numbers)
- payment_card: Credit card numbers and payment card details
- bank_account: Bank account numbers
- routing_number: Bank routing numbers
- government_id: SSNs, EINs, tax IDs, passport numbers
- account_id: Account numbers, customer IDs, membership IDs
- order_id: Order numbers, purchase order IDs
- invoice_id: Invoice numbers
- tracking_id: Tracking numbers, shipment IDs
- transaction_id: Transaction IDs
- generic_id: Other unique identifiers
- url: URLs with tokens or sensitive query parameters
- token: API keys, access tokens, auth tokens

RISK LEVEL RULES:
- HIGH risk: payment_card, bank_account, routing_number, government_id, token, api_key
- MEDIUM risk: email, phone, address, account_id, order_id, invoice_id, tracking_id, transaction_id, generic_id, url

OUTPUT FORMAT:
Wrap each sensitive span like this:
<SENSITIVE type="TYPE" risk="RISK_LEVEL">actual text</SENSITIVE>

Example:
Input: "Hi john@email.com, your card 4242-4242-4242-4242 was charged."
Output: Hi <SENSITIVE type="email" risk="medium">john@email.com</SENSITIVE>, your card <SENSITIVE type="payment_card" risk="high">4242-4242-4242-4242</SENSITIVE> was charged.

CRITICAL RULES:
1. Do NOT modify the text content itself
2. Only wrap sensitive spans with tags
3. Use exact text from input (do not change spacing, punctuation, or formatting)
4. Return ONLY the annotated text with tags
5. Do NOT add explanations or commentary
6. If no sensitive data is found, return the original text unchanged`;

    const userPrompt = `Annotate sensitive data in this text with <SENSITIVE> tags:

${text}

Remember: Return ONLY the annotated text. Do not change the actual content, only add tags around sensitive spans.`;

    // Call Gemini API
    const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);

    const response = await result.response;
    let annotatedText = response.text();

    // Clean up any markdown formatting if Gemini adds it
    annotatedText = annotatedText.replace(/```xml\n?/g, '').replace(/```\n?/g, '').trim();

    // Return the annotated text
    return NextResponse.json({ annotatedText });

  } catch (error: any) {
    console.error('Error scanning text with DAGGER:', error);
    
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to scan text. Please try again.' },
      { status: 500 }
    );
  }
}