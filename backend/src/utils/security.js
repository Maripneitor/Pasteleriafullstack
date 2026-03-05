/**
 * Security utilities for input sanitization and validation.
 */

/**
 * Sanitizes a string to prevent basic SQL injection or script injection.
 * (Sequelize handles SQL, but this is a business-level safety layer)
 */
const sanitizeInput = (str) => {
    if (typeof str !== 'string') return str;
    // Remove characters often used in SQL injection attempts if they look suspicious
    // or just trim and escape.
    return str.trim().replace(/['";\-\-\/]/g, '');
};

/**
 * Validates that an AI response doesn't contain sensitive patterns.
 */
const containsSensitiveData = (text) => {
    const patterns = [
        /sk-[a-zA-Z0-9]{32,}/, // OpenAI keys
        /password/i,
        /contraseña/i,
        /token/i,
        /[0-9]{16}/, // Credit card-like 
    ];
    return patterns.some(p => p.test(text));
};

module.exports = {
    sanitizeInput,
    containsSensitiveData
};
