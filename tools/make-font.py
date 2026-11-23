# สร้างไฟล์ฟอนต์ที่ทั้ง 4 แอปใช้ (fonts/noto-sans-thai-vN.woff2) จาก Noto Sans Thai ที่ดาวน์โหลดจาก Google Fonts
# ใช้:  python3 tools/make-font.py <โฟลเดอร์ที่แตก zip แล้ว> <ไฟล์ปลายทาง.woff2>
# ต้องมี fontTools และ brotli (pip install fonttools brotli)
# ทำอะไร: ล็อกความกว้างเป็นปกติ (wdth 100) เก็บน้ำหนัก 400-700 ไว้ในไฟล์เดียว ตัดเหลืออักษรไทย อังกฤษ เครื่องหมายทั่วไป
# แล้วคัดลอกไปไว้ที่ <แอป>/fonts/ ทั้ง 4 แอป (ไฟล์ต้องเหมือนกัน ข้อสอบ t_fontload.js ตรวจ) ถ้าเนื้อไฟล์เปลี่ยน ให้เพิ่มเลข v ในชื่อ
# และแก้ชื่อใน index.html ทั้ง 4 แอป (เบราว์เซอร์แคชไฟล์ไว้ 1 ปีตาม _headers)
import sys, os, tempfile
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
src, dst = sys.argv[1], sys.argv[2]
U = "U+0020-007E,U+00A0-00FF,U+0E00-0E7F,U+2000-206F,U+20AC,U+2190-2193,U+2212,U+25CC"
v = TTFont(os.path.join(src, 'NotoSansThai-VariableFont_wdth,wght.ttf'), lazy=False)
v = instancer.instantiateVariableFont(v, {"wdth": 100, "wght": (400, 700)})
tmp = os.path.join(tempfile.mkdtemp(), 'v.ttf'); v.save(tmp)
o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']; o.name_IDs = ['*']; o.notdef_outline = True; o.hinting = False
f = TTFont(tmp); s = subset.Subsetter(o); s.populate(unicodes=subset.parse_unicodes(U)); s.subset(f); subset.save_font(f, dst, o)
print(dst, os.path.getsize(dst), 'bytes')
