const MISTRAL_API_KEY = process.env.REACT_APP_MISTRAL_API_KEY || "NPeyLIrnHPQSGZlkaSHUsUKgbDF4RWFF";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function getMistralResponse(prompt, systemPrompt = "") {
  try {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt
      });
    }
    
    messages.push({
      role: "user",
      content: prompt
    });
    
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Mistral API:", error);
    throw error;
  }
}

export async function analyzeMedicalReport(reportText) {
  const systemPrompt = `You are a medical AI assistant specialized in analyzing medical reports. 
  Extract key information and provide a comprehensive analysis.`;
  
  const userPrompt = `Analyze this medical report and provide a structured response:

${reportText}

Format your response as a JSON object with the following structure:
{
  "keyFindings": ["list of specific test results, measurements, values"],
  "riskFactors": ["list of abnormal values, health concerns"],
  "recommendations": ["list of actionable medical advice"],
  "criticalValues": ["list of values requiring urgent attention"],
  "normalValues": ["list of values within normal range"],
  "summary": "brief 2-3 sentence overview",
  "reportType": "detected report type",
  "detectedDoctor": "doctor name if found",
  "detectedFacility": "facility name if found"
}`;

  try {
    const response = await getMistralResponse(userPrompt, systemPrompt);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      keyFindings: ["Text extraction completed"],
      riskFactors: ["Please consult healthcare provider for proper interpretation"],
      recommendations: ["Review with your doctor"],
      criticalValues: [],
      normalValues: [],
      summary: "Medical report processed. Please consult with a healthcare professional.",
      reportType: "Unknown",
      detectedDoctor: "",
      detectedFacility: ""
    };
  } catch (error) {
    console.error("Error analyzing medical report:", error);
    return {
      keyFindings: ["Error processing report"],
      riskFactors: ["Manual review required"],
      recommendations: ["Consult healthcare provider"],
      criticalValues: [],
      normalValues: [],
      summary: "Error analyzing report. Please consult with a healthcare professional.",
      reportType: "Unknown",
      detectedDoctor: "",
      detectedFacility: ""
    };
  }
}