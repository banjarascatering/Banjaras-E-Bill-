# 🟢 BANJARA'S E-BILL → APK  (Toddler Guide)

You will do 5 small parts. Do them in order. Do NOT skip.
Every line in a grey box = **copy it, paste it in Termux, press Enter.**

Time needed: about 20 minutes (the APK build itself takes ~8 min on GitHub).

---

## PART 1 — Make a GitHub account + empty box (5 min)

You do this in your phone **browser** (Chrome), not Termux.

1. Open **github.com** → tap **Sign up** → make an account.
   *(Already have one? Just log in.)*
2. Tap the **+** (top right) → **New repository**.
3. Repository name: `banjaras-ebill`
4. Choose **Public** (Private also works, but Public gives unlimited free builds).
5. **Do NOT** tick "Add a README". Leave everything else empty.
6. Tap **Create repository**.

✅ You now have an empty box on GitHub.

---

## PART 2 — Make a secret password key (Token) (3 min)

GitHub does not accept your normal password from Termux. It wants a **token**.

1. In browser open: **github.com/settings/tokens**
2. Tap **Generate new token** → **Generate new token (classic)**
3. Note: `termux`
4. Expiration: **90 days**
5. Tick the box **`repo`** (the first big one). Also tick **`workflow`**. ← IMPORTANT
6. Scroll down → **Generate token**
7. A long text starting with `ghp_...` appears.
   **COPY IT NOW and paste it in your Notes app.** GitHub shows it only once!

✅ You have a token.

---

## PART 3 — Get the project into Termux (5 min)

### 3A. Install Termux tools

Open Termux. Paste these **one at a time**:

```
pkg update -y
```
```
pkg install git unzip -y
```
```
termux-setup-storage
```
A popup asks for storage permission → tap **Allow**.

### 3B. Put the zip in your phone

I gave you a file called **`banjaras-apk.zip`**. Download it to your phone
so it sits in your **Download** folder.

### 3C. Unzip it in Termux

```
cd ~
```
```
unzip ~/storage/downloads/banjaras-apk.zip
```
```
cd banjaras-apk
```
```
ls -a
```
✅ You should see: `.github  android-overrides  www  scripts  package.json ...`
If you see `.github` in the list, you are perfect.

---

## PART 4 — Upload to GitHub (4 min)

### 4A. Tell git who you are

Change the name/email to yours:

```
git config --global user.name "Moin"
```
```
git config --global user.email "your-email@example.com"
```

### 4B. Upload

Replace `YOURUSERNAME` with your real GitHub username.
Paste line by line:

```
git init -b main
```
```
git add .
```
```
git commit -m "Banjara E-Bill first upload"
```
```
git remote add origin https://github.com/YOURUSERNAME/banjaras-ebill.git
```
```
git push -u origin main
```

Termux now asks two things:

| It asks | You type |
|---|---|
| `Username` | your GitHub username, Enter |
| `Password` | **paste your `ghp_...` token** (nothing shows on screen — that's normal), Enter |

✅ When you see `Branch 'main' set up to track...` the upload is DONE.

**If it says "repository not found"** → your username is spelled wrong in the
`remote add` line. Fix it with:
```
git remote set-url origin https://github.com/CORRECTNAME/banjaras-ebill.git
```
then run `git push -u origin main` again.

---

## PART 5 — Watch GitHub build your APK (10 min)

1. Browser → go to `github.com/YOURUSERNAME/banjaras-ebill`
2. Tap the **Actions** tab.
3. You will see **"Build Banjara's E-Bill APK"** with a 🟡 yellow circle = building.
   *(If Actions is asking "I understand my workflows, enable them" → tap the green button.)*
4. Wait ~8–10 minutes. Yellow 🟡 → green ✅ means success.
5. Tap the finished run (the name of your commit).
6. Scroll to the bottom → **Artifacts** → tap **`Banjaras-EBill-APK`**
   → a zip downloads.
7. Open your phone's **Files** app → Downloads → unzip **Banjaras-EBill-APK.zip**
   → you get **`app-debug.apk`**.
8. Tap `app-debug.apk` → **Install**.
   *(Phone says "blocked / unknown source"? Tap **Settings** → allow for this app → go back → Install.)*

🎉 **Open "Banjara E-Bill" — your icon is on the home screen.**

---

## 🔁 LATER: You changed the HTML? Update the APK

Put your new HTML file over `www/index.html`, then in Termux:

```
cd ~/banjaras-apk
```
```
cp ~/storage/downloads/YOUR-NEW-FILE.html www/index.html
```
```
git add .
```
```
git commit -m "update"
```
```
git push
```
GitHub rebuilds automatically. Download the new APK from Actions again.

> ⚠️ The build **rewrites** `www/index.html` on GitHub only (to make it offline).
> Your copy on your phone stays the normal original. So always edit **your own copy**
> and copy it over `www/index.html` like above. Never worry about the rewrite.

---

## 🆘 IF SOMETHING GOES WRONG

| Problem | Fix |
|---|---|
| ❌ Red X in Actions | Tap the run → tap the red step → read the last lines. Send me a screenshot. |
| `unzip: cannot find` | The zip is not in Downloads. Run `ls ~/storage/downloads` to see the real name, then use that name. |
| `Permission denied` on storage | Run `termux-setup-storage` again and tap Allow. |
| Push asks password again & again | Token missing the **`repo`** / **`workflow`** ticks. Make a new token (Part 2). |
| `.github` folder missing after unzip | Run `ls -a` (with **-a**). Hidden folders only show with `-a`. |
| APK will not install | Delete any older version of the app first, then install again. |
| Want to print on paper | Tap **Print Bill** (it downloads the physical bill), then print the JPG from Gallery. |

---

## ✅ WHAT WORKS IN YOUR APK

- Works **fully offline** (fonts + image engine are inside the APK)
- Your **new Banjaaras Catering logo** is the icon on the home screen
- **Two bill types** – choose **ELECTRONIC BILL** or **PHYSICAL BILL** *before* you tap Generate.
  The physical bill is identical, only the top-right label says **PHYSICAL BILL**.
- **Sender Name and Tagline are editable and auto-saved** – they stay even after you close the app
- **Maximum 7 slots** per bill. A bill with 1, 2, 3, 4, 5, 6 or 7 slots always comes out at the **same fixed size** (the size of a 1-slot bill)
- Every bill ends with **Regards, Syed Tanveer Hussain, Ph # 03230007773** and a round **stamp**
- A **progress bar** shows while the bill is generated and while it is downloaded
- **Download JPG** → saves into `Documents/Banjaras-Bills` on the phone
- **Print Bill** → downloads the bill and switches to the **Physical Bill**
- **WhatsApp button** → opens the real Android share sheet with the JPG invoice
- Invoice numbers, sender name, tagline, bill type & theme are remembered
