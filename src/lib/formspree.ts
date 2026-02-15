/**
 * Formspree Email Service
 * Uses Formspree Submission API to send notifications/emails.
 */

const FORM_ID = process.env.FORMSPREE_FORM_ID || 'maqdopgg';

export interface FormspreeResult {
    success: boolean;
    error?: string;
}

/**
 * Sends an email notification via Formspree.
 * Since Formspree is a form processing service, this function "submits" a form
 * which then triggers an email to the configured recipient in Formspree.
 */
export const sendFormspreeEmail = async (to: string, subject: string, html: string): Promise<FormspreeResult> => {
    if (!FORM_ID) {
        console.error('❌ Formspree Form ID missing');
        return { success: false, error: 'Formspree not configured' };
    }

    try {
        const url = `https://formspree.io/f/${FORM_ID}`;

        // We send the data as JSON to Formspree API
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: subject,
                recipient: to,
                message: html, // Formspree treats this field as the main body
                _replyto: to
            })
        });

        if (response.ok) {
            console.log(`✅ [Formspree] Notification submitted for ${to}`);
            return { success: true };
        } else {
            const data = await response.json();
            console.error('[Formspree] Submission failed:', data);
            return { success: false, error: data.error || 'Failed to submit to Formspree' };
        }
    } catch (error: any) {
        console.error('[Formspree] Network error:', error);
        return { success: false, error: error.message || 'Network error' };
    }
};
