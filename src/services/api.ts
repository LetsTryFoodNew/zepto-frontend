import axios from 'axios';


const api = axios.create({
  // baseURL: 'http://zepto-edi-integration-env-1.eba-wmmtjd4e.eu-north-1.elasticbeanstalk.com', // Change to your actual API base
  baseURL: 'https://edi.letstryfoods.com/', // Change to your actual API base
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
