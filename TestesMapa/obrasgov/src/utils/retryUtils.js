const axios = require('axios');

async function fetchWithRetry(url, retries = 5) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return response.data;
            }

            if (response.status === 429 || response.status === 503) {
                const retryAfter = response.headers["retry-after"];
                const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000;
                console.log(`Rate limited. Retrying after ${delay / 1000} seconds.`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`Request failed with status ${response.status}`);
            }
        } catch (error) {
            console.error(`Erro na tentativa ${attempt + 1}:`, error.message || error.toString());
            if (attempt === retries - 1) {
                throw new Error("Max retries exceeded"); // Lança o erro "Max retries exceeded"
            }
        }
    }
}

module.exports = {
    fetchWithRetry,
};