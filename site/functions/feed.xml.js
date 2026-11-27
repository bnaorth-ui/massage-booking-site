// RSS ทุกเรื่อง (ข่าว บทความ ผลงาน) สำหรับเว็บอื่นดึงไปแสดง ดู shared/feed.js
import { feedResponse } from '../shared/feed.js';
export async function onRequestGet({ request }) { return feedResponse(request, ''); }
