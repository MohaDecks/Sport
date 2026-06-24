# 🎬 Fiidiyow Demo Script — Somali
## District Sports Management System (~6 daqiiqo)

> **Kahor duubista:** Run `bash scripts/start-demo.sh`  
> **QuickTime:** File → New Screen Recording → Full screen

---

## Qeyb 1 — Hordhac (30 sec)

**[Muuji: Desktop ama demo-video.html slide 1]**

> "Salaam. Maanta waxaan idiin tusi doonaa District Sports Management System — platform maamul ciyaaraha degmada. Wuxuu leeyahay saddex qeybood: Admin Portal, Mobile App, iyo Backend API."

---

## Qeyb 2 — Backend (30 sec)

**[Muuji tab: localhost:5001/api/health — JSON "success: true"]**

> "Backend-ku wuxuu ku shaqeeyaa port 5001. Wuxuu xogta ku kaydiyaa MongoDB. Dhammaan app-yadu API-kan ayay isticmaalaan."

---

## Qeyb 3 — Admin Login (20 sec)

**[Muuji: localhost:5173/login]**

> "Kani waa Admin Portal. Admin-ku wuxuu maamulaa dhammaan system-ka."

**Geli:**
- Email: `admin@dsms.com`
- Password: `admin123`
- Riix Sign In

---

## Qeyb 4 — Admin Dashboard (45 sec)

**[Muuji: Dashboard — stats cards]**

> "Dashboard-ka waxaad aragtaa tirada teams, players, coaches, iyo matches. Halkan admin-ku wuxuu arkaa guud ahaan degmada."

---

## Qeyb 5 — Teams & Players (1 min)

**[Sidebar → Teams]**

> "Admin wuxuu ku dari karaa kooxo cusub, wuu beddeli karaa, wuuna tirtiri karaa."

**[Sidebar → Players]**

> "Ciyaartoyda koox kasta waa la maamuli karaa — magac, position, jersey number."

**[Sidebar → Coaches]**

> "Tababarayaasha kooxaha waa la xiriiri karaa."

---

## Qeyb 6 — Matches & News (1 min)

**[Sidebar → Matches]**

> "Ciyaaraha waa la jadwaleeyaa — taariikh, waqti, stadium."

**[Sidebar → News → Add News + sawir optional]**

> "Wararka iyo sawirrada halkan ayaa laga soo xareeyaa. Mobile app-ka banners ahaan ayay u muuqdaan."

---

## Qeyb 7 — Send Notification (45 sec)

**[Sidebar → Notifications → Send Notification]**

> "Admin wuxuu u diri karaa ogeysiis coach ama team."

**Buuxi:**
- Title: `Match Today`
- Message: `District FC vs Eagles United — 3PM`
- Target: `coach`
- ✓ Push notification
- Riix Send

> "Ogeysiiskan wuxuu ku yimaadaa mobile app-ka iyo telefoonka haddii push la furo."

---

## Qeyb 8 — Mobile App (1.5 min)

**[U beddel tab: localhost:8081 ama APK telefoonka]**

> "Hadda waxaan u gudubnaa Mobile App — coach iyo team ayaa isticmaala."

**Login:**
- `ahmed@dsms.com` / `coach123`

**Muuji tabs:**
1. **Home** — "Dashboard — banners, stats, ciyaaraha maanta"
2. **Schedule** — "Jadwalka ciyaaraha"
3. **Players** — "Ciyaartoyda kooxda"
4. **Standings** — "Tabellada tartanka"
5. **Notifications** — "Ogeysiiska admin hadda diray — halkan ayuu ku yaal"
6. **Logout** — riix header-ka

---

## Qeyb 9 — Isku Xirka (30 sec)

**[Split: Admin + Mobile ama Admin kaliya]**

> "Marka admin wax cusub ku daro — team, match, ama notification — isla xilligaas coach-ku wuu arkaa mobile app-ka. Dhammaan waa hal system oo isku xiran."

---

## Qeyb 10 — Gabagabo (20 sec)

**[Muuji logo ama slide u dhexeysa]**

> "District Sports Management System — maamul buuxa ciyaaraha degmada. Android, iPhone, iyo Web. Mahadsanid!"

**[Stop QuickTime recording → Save as `District-Sports-Demo.mp4`]**

---

## Checklist Kahor Duubista

- [ ] Backend socda (`npm run dev` in backend/)
- [ ] Admin socda (`npm run dev` in admin-portal/)
- [ ] Mobile socda (`npm start` in mobile-app/)
- [ ] Browser tabs nadiif ah
- [ ] Mic test (haddii cod ku hadlayso)
- [ ] QuickTime diyaar

---

## Qaladaha Caadiga ah

| Dhibaato | Xalka |
|----------|-------|
| Admin ma furmo | http://localhost:5173 — ma aha 8081 |
| Mobile login fail | Backend socda? `.env` IP sax? |
| Notifications madhan | Admin ka dir marka hore |
| Recording ma shaqeyn | QuickTime permissions → System Settings → Privacy |
