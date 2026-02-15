/**
 * SMS & WhatsApp Bridge (Infobip Removed)
 * Placeholder for future SMS integration.
 */

export interface SMSResult {
    success: boolean;
    messageId?: string;
    to?: string;
    error?: string;
}

/**
 * Send a generic SMS message
 */
export const sendSMS = async (phone: string, message: string): Promise<SMSResult> => {
    console.warn('⚠️ [SMS] Service disabled (Infobip removed). Content:', message);
    return { success: false, error: 'SMS service not configured' };
};

/**
 * Send a generic WhatsApp message
 */
export const sendWhatsApp = async (phone: string, message: string): Promise<SMSResult> => {
    console.warn('⚠️ [WhatsApp] Service disabled (Infobip removed). Content:', message);
    return { success: false, error: 'WhatsApp service not configured' };
};


