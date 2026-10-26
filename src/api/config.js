let cachedUrl = null;

export async function getBaseUrl() {
    if (cachedUrl) return cachedUrl;

    const port = await window.electronAPI.getBackendPort();

    cachedUrl = `http://127.0.0.1:${port}`;

    return cachedUrl;
}

export async function apiFetch(path, options = {}) {
    const baseUrl = await getBaseUrl();
    return fetch(`${baseUrl}${path}`, options);
}