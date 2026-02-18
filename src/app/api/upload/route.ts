import { NextRequest, NextResponse } from "next/server";

// Environment variables for OAuth
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// MeridianLink endpoints
const TOKEN_ENDPOINT = "https://secure.mortgage.meridianlink.com/oauth/token";
const LOAN_ENDPOINT = "https://edocs.mortgage.meridianlink.com/los/webservice/Loan.asmx";

// Cache for OAuth token
let cachedToken: { accessToken: string; expiry: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer before expiry)
  if (cachedToken && Date.now() < cachedToken.expiry - 300000) {
    return cachedToken.accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing CLIENT_ID or CLIENT_SECRET environment variables");
  }

  // Get OAuth token - pass all params as urlencoded form data in body
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OAuth token request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Cache the token (expires_in is in seconds, default to 4 hours if not provided)
  const expiresIn = data.expires_in || 14400;
  cachedToken = {
    accessToken: data.access_token,
    expiry: Date.now() + (expiresIn * 1000),
  };

  return data.access_token;
}

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.xmlContent) {
      return NextResponse.json(
        { success: false, error: "XML content is required" },
        { status: 400 }
      );
    }

    // Get OAuth access token (with auto-refresh)
    const accessToken = await getAccessToken();

    // Per API Admin Guide: pass "Bearer {token}" to sTicket parameter
    const bearerTicket = `Bearer ${accessToken}`;

    // Build LOXmlFormat for MISMO 3.4 (Format=12)
    const loXmlFormat = `<LOXmlFormat><field id="IsLead">False</field><field id="Format">12</field><field id="ImportFileContent"><![CDATA[${body.xmlContent}]]></field></LOXmlFormat>`;

    // Escape for embedding in SOAP
    const escapedTicket = escapeXml(bearerTicket);
    const escapedOptions = escapeXml(loXmlFormat);

    // Build SOAP envelope
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CreateWithOptions xmlns="http://www.lendersoffice.com/los/webservices/">
      <sTicket>${escapedTicket}</sTicket>
      <optionsXml>${escapedOptions}</optionsXml>
    </CreateWithOptions>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(LOAN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "\"http://www.lendersoffice.com/los/webservices/CreateWithOptions\"",
      },
      body: soapEnvelope,
    });

    const responseText = await response.text();

    // Check for SOAP fault
    const faultMatch = responseText.match(/<faultstring>(.*?)<\/faultstring>/s);
    if (faultMatch) {
      return NextResponse.json({
        success: false,
        error: `MeridianLink error: ${faultMatch[1]}`,
        rawResponse: responseText,
      });
    }

    // Decode the escaped response
    const decodedResponse = responseText
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"");

    // Extract loan number from sLNm field
    const loanNumberMatch = decodedResponse.match(/<field id="sLNm">(.*?)<\/field>/s);
    const extractedLoanNumber = loanNumberMatch ? loanNumberMatch[1] : null;

    // Check for error in result
    const errorMatch = decodedResponse.match(/<Error>(.*?)<\/Error>/s);
    if (errorMatch && !extractedLoanNumber) {
      return NextResponse.json({
        success: false,
        error: `MeridianLink: ${errorMatch[1]}`,
        rawResponse: decodedResponse,
      });
    }

    return NextResponse.json({
      success: !!extractedLoanNumber,
      result: extractedLoanNumber ? `Loan created: ${extractedLoanNumber}` : "Request processed",
      loanNumber: extractedLoanNumber,
      rawResponse: decodedResponse,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
