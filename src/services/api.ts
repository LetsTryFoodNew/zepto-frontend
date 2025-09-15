import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.24:8000', // Change to your actual API base
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
