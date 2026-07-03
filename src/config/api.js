const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://apt-backend-cb60223ac599.herokuapp.com';

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const requestJson = async (path, options) => {
    const url = apiUrl(path);
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (!contentType.includes('application/json')) {
        const preview = responseText.trim().slice(0, 120);
        throw new Error(
            `Expected JSON from ${url}, but received ${contentType || 'an unknown content type'}. ` +
                `This usually means the frontend is pointed at the wrong backend or the backend route is not deployed. ` +
                `Response preview: ${preview}`
        );
    }

    const data = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
        throw new Error(data?.error || `Request failed with status ${response.status}.`);
    }

    return data;
};
