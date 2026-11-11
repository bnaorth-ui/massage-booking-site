# ตัวห่อแอปสำหรับ Google Play และ App Store (แอปผู้ใช้งาน)

แอปในร้านค้าเปิดเว็บ `https://massage-customer-bna.pages.dev/` เหมือนเดิม แก้หน้าเว็บเมื่อไร แอปในเครื่องผู้ใช้เปลี่ยนตามทันที ไม่ต้องส่งแอปใหม่
ส่งแอปใหม่เฉพาะเมื่อเปลี่ยนไอคอน ชื่อแอป ข้อความขออนุญาต หรือเพิ่มความสามารถของตัวแอป (เช่น แจ้งเตือนแบบแอปจริงบน iPhone)

- ชื่อแอป: จองคิวนวด
- รหัสประจำแอป (เปลี่ยนไม่ได้หลังสร้างในร้านค้า): `th.or.bna.massage`
- หน้าเว็บรู้ว่าเปิดอยู่ในแอปจากร้านค้า (ฟังก์ชัน `storeApp()` ใน `customer/index.html`) แล้วซ่อนแถบผู้ยังไม่ล็อกอิน ปุ่มติดตั้งแอป และส่วนแนะนำเว็บ
  - iPhone: ตัวห่อเติม `BNAMassageApp/ios` ต่อท้าย user agent (ตั้งใน `ios-customer/capacitor.config.json`)
  - Android: เปิดหน้าแรกเป็น `/?src=twa` (ตั้งใน PWABuilder)
- ลิงก์ที่ต้องกรอกในร้านค้า
  - นโยบายความเป็นส่วนตัว: `https://massage-customer-bna.pages.dev/privacy/`
  - วิธีลบบัญชี (Google Play บังคับ): `https://massage-customer-bna.pages.dev/delete-account/`
  - สองหน้านี้สร้างจาก `tools/gen-legal.js` แก้นโยบายในแอปแล้วรัน `node tools/gen-legal.js` (ข้อสอบ `t_legal_pages.js` เตือนถ้าลืม)

ห้ามเก็บรหัสผ่าน กุญแจเซ็นแอป (.keystore, .p8, .p12) หรือรหัสลับใดๆ ในที่เก็บโค้ดนี้ ให้เก็บไว้กับสมาคมเอง

---

## Android (Google Play) ด้วย PWABuilder

ไม่ต้องติดตั้งโปรแกรม ทำในเว็บเบราว์เซอร์

1. เปิด https://www.pwabuilder.com ใส่ `https://massage-customer-bna.pages.dev/` กด Start
2. กด Package for stores > Android > Generate Package แล้วกด Options ตั้งค่า
   - Package ID: `th.or.bna.massage`
   - App name: `จองคิวนวด` / Launcher name: `จองคิวนวด`
   - Start URL: `/?src=twa`
   - Display mode: Standalone
   - Notification delegation: เปิด (ให้แจ้งเตือนของเว็บทำงานในแอป)
   - Location delegation: เปิด
   - Signing key: Create new (PWABuilder สร้างกุญแจให้)
3. ดาวน์โหลดไฟล์ zip ได้ไฟล์ `.aab` (อัปโหลดขึ้น Play Console) ไฟล์กุญแจ `.keystore` และไฟล์ `signing-key-info.txt`
   - **เก็บไฟล์กุญแจและรหัสผ่านไว้ให้ดี** ต้องใช้ทุกครั้งที่ส่งแอปรุ่นใหม่ ห้ามใส่ในที่เก็บโค้ดนี้
4. ใน Play Console สร้างแอป อัปโหลด `.aab` ในช่องทดสอบ (Internal testing) ก่อน
5. Play Console > ตั้งค่า > App signing คัดลอก **SHA-256 certificate fingerprint** ส่งให้ Claude
   - Claude จะสร้างไฟล์ `customer/.well-known/assetlinks.json` (ยืนยันว่าแอปกับเว็บเป็นเจ้าของเดียวกัน แอปจะเปิดเต็มจอ ไม่มีแถบที่อยู่เว็บ)
   - รหัสนี้ไม่ใช่ข้อมูลลับ
6. กรอกข้อมูลร้านค้า: ความปลอดภัยของข้อมูล การจัดเรตเนื้อหา กลุ่มเป้าหมาย ลิงก์นโยบาย ลิงก์ลบบัญชี บัญชีทดลองสำหรับผู้ตรวจ

## iPhone (App Store) ด้วย Codemagic (ไม่ต้องมี Mac)

ไฟล์ที่ใช้: `ios-customer/` (ตั้งค่าตัวห่อแอป) และ `codemagic.yaml` ที่รากของที่เก็บโค้ด

1. สมัคร Apple Developer Program (ในนามสมาคม ใช้เลข D-U-N-S)
2. App Store Connect > Apps > + สร้างแอปใหม่ เลือก Bundle ID `th.or.bna.massage` (สร้างที่ Certificates, Identifiers & Profiles > Identifiers ก่อน)
   - จดเลข Apple ID ของแอป (ตัวเลข อยู่ที่ App Information) แล้วแก้ `APP_STORE_APPLE_ID` ใน `codemagic.yaml` (ให้ Claude แก้ให้ได้)
3. App Store Connect > Users and Access > Integrations > App Store Connect API สร้างกุญแจสิทธิ์ App Manager ดาวน์โหลดไฟล์ `.p8` (ดาวน์โหลดได้ครั้งเดียว เก็บไว้ให้ดี)
4. สมัคร https://codemagic.io ด้วยบัญชี GitHub แล้วเพิ่มที่เก็บโค้ด `bnaorth-ui/massage-booking-site`
5. Codemagic > Team settings > Integrations > Developer Portal > Connect ใส่ Issuer ID, Key ID และไฟล์ `.p8` ตั้งชื่อ `bna_asc`
6. Codemagic > Code signing identities > iOS certificates: ให้ Codemagic สร้างใบรับรองแบบ Apple Distribution ให้ (ใช้กุญแจจากข้อ 5)
7. กด Start new build เลือก workflow "แอปผู้ใช้งาน iPhone (TestFlight)"
   - ครั้งแรกอาจต้องปรับไฟล์ตั้งค่าเล็กน้อยตามข้อความแจ้งข้อผิดพลาด ส่งข้อความนั้นให้ Claude ดูได้
8. สร้างเสร็จ แอปขึ้น TestFlight ติดตั้งแอป TestFlight บน iPhone แล้วลองใช้ด้วย VoiceOver ก่อนส่งให้ Apple ตรวจ

### สิ่งที่อยู่ใน ios-customer/
- `capacitor.config.json` รหัสประจำแอป ชื่อแอป เว็บที่เปิด และตัวบอกว่าเป็นแอป iPhone
- `ios-info.json` ข้อความขออนุญาตตำแหน่งที่ตั้ง กล้อง รูปภาพ (ภาษาไทย) ใส่ลง Info.plist ตอนสร้าง
- `assets/icon-only.png` ไอคอน 1024x1024 (ขยายจากโลโก้ 512 ถ้ามีไฟล์โลโก้ต้นฉบับที่คมกว่า ให้แทนที่ไฟล์นี้)
- `www/index.html` หน้า "ไม่มีอินเทอร์เน็ต" ในตัวแอป ใช้เมื่อเปิดเว็บหลักไม่ได้
- `package.json` รายการเครื่องมือ Capacitor (Codemagic ติดตั้งให้)

### ยังไม่ได้ทำ (รอบถัดไป)
- แจ้งเตือนแบบแอปจริงบน iPhone (APNs): ต้องมีบัญชี Apple และกุญแจแจ้งเตือน `.p8` ก่อน ต้องแก้ฐานข้อมูลและ `send-push`
- ไฟล์ `assetlinks.json` สำหรับ Android: รอรหัส SHA-256 จาก Play Console
