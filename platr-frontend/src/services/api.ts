import axios from 'axios';

// Backend runs on port 9023 as per README
export const API_BASE_URL = 'http://localhost:9023/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export default api;
