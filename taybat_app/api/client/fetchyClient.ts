import axios from 'axios';

export const fetchyClient = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function setFetchyBaseURL(baseURL: string) {
  fetchyClient.defaults.baseURL = baseURL;
}
