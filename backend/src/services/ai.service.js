const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../utils/AppError');

// Schema constraint passed to Gemini to enforce structured JSON output
const transactionSchema = {
  type: 'OBJECT',
  properties: {
    amount: {
      type: 'NUMBER',
      description: 'Total transaction amount. Must be a positive float.',
    },
    type: {
      type: 'STRING',
      enum: ['income', 'expense'],
      description: 'Transaction type. Receipts are usually expenses.',
    },
    category: {
      type: 'STRING',
      enum: [
        'Food & Dining',
        'Housing & Rent',
        'Utilities',
        'Salary & Income',
        'Transport & Taxi',
        'Entertainment & Leisure',
        'Healthcare',
        'Shopping',
        'Investments',
        'Others',
      ],
      description: 'Matching expense/income category.',
    },
    date: {
      type: 'STRING',
      description: 'Transaction date in YYYY-MM-DD format. Fallback to today if missing.',
    },
    description: {
      type: 'STRING',
      description: 'Merchant/Vendor name or a summary of items.',
    },
  },
  required: ['amount', 'type', 'category', 'date', 'description'],
};

// Convert Multer file buffer to base64 generative part representation
const fileToGenerativePart = (buffer, mimeType) => {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
};

// Main service to extract receipt data using Gemini multimodal vision
const parseReceipt = async (fileBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new AppError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in your env.', 400);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the 3.5 flash model with structured JSON schema parameters
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: transactionSchema,
      },
    });

    const imagePart = fileToGenerativePart(fileBuffer, mimeType);
    const prompt = 'Read the attached receipt/invoice. Extract the amount, category, date, transaction type, and merchant/description according to the schema.';

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    return JSON.parse(responseText);
  } catch (error) {
    throw new AppError(`AI receipt scanning failed: ${error.message}`, 500);
  }
};

module.exports = {
  parseReceipt,
};
