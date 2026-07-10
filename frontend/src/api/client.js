import axios from 'axios'
import { resolveApiBaseUrl } from '../lib/apiBaseUrl'

const client = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
})

export default client
