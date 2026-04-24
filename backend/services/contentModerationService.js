const axios = require('axios');

const SIGHTENGINE_API_URL = 'https://api.sightengine.com/1.0/check.json';

const isEnabled = () => process.env.SIGHTENGINE_MODERATION_ENABLED === 'true';

const getThreshold = () => {
    const parsed = parseFloat(process.env.SIGHTENGINE_BLOCK_THRESHOLD || '0.3');
    if (Number.isNaN(parsed)) {
        return 0.3;
    }
    return parsed;
};

const getApiCredentials = () => ({
    apiUser: process.env.SIGHTENGINE_API_USER,
    apiSecret: process.env.SIGHTENGINE_API_SECRET,
});

const hasValidCredentials = (creds) => creds.apiUser && creds.apiSecret;

const getNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

const maxByPaths = (obj, paths) => {
    let max = 0;

    for (const path of paths) {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (!current || typeof current !== 'object') {
                current = undefined;
                break;
            }
            current = current[key];
        }

        max = Math.max(max, getNumber(current));
    }

    return max;
};

const NUDITY_RISK_PATHS = [
    'nudity.raw',
    'nudity.partial',
    'nudity.full',
    'nudity.sexual_activity',
    'nudity.sexual_display',
    'nudity.erotica',
    'nudity.very_suggestive',
    'nudity.suggestive',
];

const WAD_RISK_PATHS = [
    'wad.weapon',
    'wad.alcohol',
    'wad.drugs',
];

const OFFENSIVE_RISK_PATHS = [
    'offensive.prob',
    'offensive',
];

const shouldBlock = (result, threshold) => {
    // Only evaluate risk-bearing fields to avoid false positives from fields like "none".
    const nudityScore = maxByPaths(result, NUDITY_RISK_PATHS);
    const wadScore = maxByPaths(result, WAD_RISK_PATHS);
    const offensiveScore = maxByPaths(result, OFFENSIVE_RISK_PATHS);

    return {
        blocked: nudityScore >= threshold || wadScore >= threshold || offensiveScore >= threshold,
        scores: {
            nudity: nudityScore,
            wad: wadScore,
            offensive: offensiveScore,
        },
        threshold,
    };
};

const moderateImageBuffer = async (buffer) => {
    if (!isEnabled()) {
        return {
            enabled: false,
            blocked: false,
            scores: {},
            threshold: getThreshold(),
        };
    }

    const credentials = getApiCredentials();
    if (!hasValidCredentials(credentials)) {
        const err = new Error('Sightengine API credentials not configured');
        err.code = 'MODERATION_CONFIG_ERROR';
        err.httpStatus = 503;
        throw err;
    }

    try {
        const formData = new FormData();
        formData.append('media', new Blob([buffer]), 'image');
        formData.append('models', 'nudity,wad,offensive');
        formData.append('api_user', credentials.apiUser);
        formData.append('api_secret', credentials.apiSecret);

        const response = await axios.post(SIGHTENGINE_API_URL, formData, {
            headers: formData.getHeaders?.() || {},
            timeout: 30000,
        });

        if (response.data.status !== 'success') {
            throw new Error(`Sightengine API error: ${response.data.error || 'unknown'}`);
        }

        const threshold = parseFloat(getThreshold());
        const moderationResult = shouldBlock(response.data, threshold);

        return {
            enabled: true,
            ...moderationResult,
        };
    } catch (error) {
        if (error.response?.status === 403) {
            const err = new Error('Sightengine API authentication failed - invalid credentials');
            err.code = 'MODERATION_AUTH_ERROR';
            err.httpStatus = 403;
            throw err;
        }

        if (error.response?.status === 429) {
            const err = new Error('Sightengine API rate limit exceeded');
            err.code = 'MODERATION_RATE_LIMIT';
            err.httpStatus = 429;
            throw err;
        }

        const wrappedError = new Error(
            `Content moderation service error: ${error.message}`
        );
        wrappedError.code = 'MODERATION_SERVICE_ERROR';
        wrappedError.httpStatus = 503;
        wrappedError.cause = error;
        throw wrappedError;
    }
};

module.exports = {
    moderateImageBuffer,
};
