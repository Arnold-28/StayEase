// QR Code generation and verification utilities
import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from './config.js';

export interface QRPayload {
  bookingId: string;
  paymentIntentId?: string;
  expiryDate: string;
  generatedAt: string;
}

export const generateQRSignature = (payload: QRPayload): string => {
  const data = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', config.qr.signingSecret)
    .update(data)
    .digest('hex');
};

export const verifyQRSignature = (payload: QRPayload, signature: string): boolean => {
  const expectedSignature = generateQRSignature(payload);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

export const generateQR = async (payload: QRPayload): Promise<{ qrString: string; imageUrl: string }> => {
  const signature = generateQRSignature(payload);
  const qrData = {
    ...payload,
    signature,
  };

  const qrString = JSON.stringify(qrData);
  
  try {
    const imageUrl = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: { dark: '#000', light: '#fff' },
    });

    return { qrString, imageUrl };
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

export const parseAndVerifyQR = (qrString: string): { valid: boolean; data?: QRPayload } => {
  try {
    const parsed = JSON.parse(qrString);
    const { signature, ...payload } = parsed;

    if (!verifyQRSignature(payload, signature)) {
      return { valid: false };
    }

    // Check expiry
    const expiryDate = new Date(payload.expiryDate);
    if (expiryDate < new Date()) {
      return { valid: false };
    }

    return { valid: true, data: payload };
  } catch {
    return { valid: false };
  }
};
