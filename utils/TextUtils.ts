/**
 * Utility to clean text strings from legacy formatting codes (e.g., Minecraft style &c, &l)
 */
export const cleanText = (text: string | undefined | null): string => {
    if (!text) return "";
    // Regex to remove "&" followed by any alphanumeric character
    return text.replace(/&[0-9a-zA-Z]/g, '');
};
