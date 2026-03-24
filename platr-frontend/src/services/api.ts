import createClient from 'openapi-fetch'
import type { paths } from '../types/api'

const client = createClient<paths>({ baseUrl: 'http://localhost:9023' });

export default client;