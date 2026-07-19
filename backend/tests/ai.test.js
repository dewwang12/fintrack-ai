const { parseReceipt } = require('../src/services/ai.service');
const AppError = require('../src/utils/AppError');

describe('AI Receipt Parser Service', () => {
  it('should throw an operational error when GEMINI_API_KEY is not defined', async () => {
    // Backup key and temporarily delete
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const mockBuffer = Buffer.from('mock file data');

    await expect(parseReceipt(mockBuffer, 'image/png')).rejects.toThrow(AppError);
    await expect(parseReceipt(mockBuffer, 'image/png')).rejects.toThrow('Google Gemini API Key is missing');

    // Restore key
    process.env.GEMINI_API_KEY = originalKey;
  });
});
