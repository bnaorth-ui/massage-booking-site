// RSS เฉพาะผลงานบริการ ดู shared/feed.js
import { feedResponse } from '../shared/feed.js';
export async function onRequestGet({ request }) { return feedResponse(request, 'work'); }
