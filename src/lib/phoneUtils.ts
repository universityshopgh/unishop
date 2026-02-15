
/**
 * Formats a phone number to E.164 format, defaulting to Ghana (+233) if no country code is present.
 * 
 * Logic:
 * 1. Remove all non-numeric characters (except leading +).
 * 2. If it starts with '+', assume it's already international.
 * 3. If it starts with '0', strip the '0' and prepend '+233'.
 * 4. otherwise, prepend '+233'.
 * 
 * @param phone The raw input phone number
 * @returns The formatted phone number
 */
export const formatGhanaPhoneNumber = (phone: string): string => {
    // 1. Clean spaces, dashes, parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");

    // 2. Check if already international (starts with +)
    if (cleaned.startsWith("+")) {
        return cleaned;
    }

    // 3. Handle local format (starts with 0)
    if (cleaned.startsWith("0")) {
        // Remove leading 0 and add +233
        return `+233${cleaned.slice(1)}`;
    }

    // 4. Handle number without prefix (e.g. 541234567) -> add +233
    return `+233${cleaned}`;
};

/**
 * Validates a formatted phone number (basic length check).
 * Ghana numbers (excluding +233) are 9 digits. Total length with +233 is 13 characters.
 */
export const isValidGhanaPhoneNumber = (phone: string): boolean => {
    // Simple check: starts with + and has reasonable length (e.g. > 10 digits)
    return phone.startsWith("+") && phone.length >= 10;
};
