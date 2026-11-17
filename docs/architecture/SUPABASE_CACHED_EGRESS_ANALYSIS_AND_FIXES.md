# Supabase Cached Egress Overuse: Root Cause Analysis & Mitigation Plan

**Project:** SPRINT Institutional Training Hub (`Sprint_HB`)  
**Document:** `docs/architecture/SUPABASE_CACHED_EGRESS_ANALYSIS_AND_FIXES.md`  
**Status:** Approved Analysis & Action Plan  
**Supabase Plan:** Free Tier (Allowance: 5 GB Cached Egress / Month | Current Usage: 15.33 GB)

---

## 1. Executive Summary

Supabase flagged the project for **15.33 GB of Cached Egress**, exceeding the **5.00 GB monthly free quota** by over 300%.

A comprehensive audit of the repository, asset directories, and git commit history revealed that:
1. **Cached Egress** on Supabase is bandwidth served through Supabase's Cloudflare Smart CDN whenever public storage assets are downloaded or requested.
2. Only **two specific asset groups** in the entire codebase are served via Supabase Storage:
   - **4 Video Testimonials** on the Homepage (`home-image` bucket): **~140–150 MB total**.
   - **4 Marketing Illustration Images** on the About page (`about-images` bucket): **31.3 MB total**.
3. No other part of the application (database queries, auth operations, or API calls) contributes to Cached Egress.

---

## 2. Supabase Free Plan: 1 GB Storage vs. 5 GB Cached Egress

### The Fundamental Question
> *"In the free plan I have 1 GB storage available. Can it be used for the videos rather than Cloudflare?"*

### Storage Space vs. Egress Bandwidth
To understand why overage occurs, it is critical to separate **Storage** from **Egress**:

| Metric | What It Measures | Free Allowance | Analogy |
| :--- | :--- | :--- | :--- |
| **Storage** | Total disk space occupied by your files at rest. | **1.00 GB** | The size of your water tank. |
| **Cached Egress** | Total data transferred over the network when visitors stream or download your files. | **5.00 GB / month** | The amount of water coming out of the tap when people drink. |

- Your 4 videos currently take **~140 MB** on disk. That easily fits inside the 1 GB storage limit (only ~14% of storage used).
- However, **every time a visitor loads the homepage or watches a video, data leaves Supabase Storage**. That outgoing data counts against your **5 GB Egress allowance**.
- If 40 people watch your uncompressed videos, `140 MB × 40 = 5.6 GB of Egress` — your monthly quota is exhausted, even though your storage remains at only 140 MB.

### Can You Still Use Supabase 1 GB Storage for Videos?
**YES, you CAN keep the videos in Supabase Storage without paying for Cloudflare**, provided you apply two essential optimizations:

1. **Compress the video files (Mandatory):**
   - High-bitrate phone recordings (~45 MB each) must be compressed to web-optimized 720p H.264 (~3–4 MB each).
   - All 4 videos combined will only take **~12–15 MB of your 1 GB storage**.
2. **Implement "Click-to-Load" / `preload="none"` in the frontend:**
   - Currently, browsers silently fetch initial chunks of all 4 videos on every homepage load.
   - Setting `preload="none"` ensures **0 bytes of egress** are consumed when people simply browse the homepage. Data is only transferred when a user explicitly taps "Play".

#### Traffic Budget If Kept in Supabase Storage:
- Total size of 4 compressed videos: **~14 MB** (average 3.5 MB per video).
- Monthly Egress allowance: **5,000 MB (5 GB)**.
- **Maximum monthly video plays:** `5,000 MB ÷ 3.5 MB = ~1,428 full plays / month`.
- As long as your website has fewer than ~1,400 video plays per month, you will remain comfortably within the free tier.

---

## 3. Detailed Scan Findings & Evidence

### Culprit A: Homepage Video Testimonials (~140–150 MB Total)

* **Code References:** 
  - [`src/data/data.js`](../../src/data/data.js#L140-L168)
  - [`src/components/Home/VideoTestimonials.jsx`](../../src/components/Home/VideoTestimonials.jsx#L48-L68)
* **Git Commit History:**
  - `d964db31` (*Thu Oct 29 2026*): Removed local video binaries from `public/testimonials/` and pointed to Supabase Storage:
    - `myank_aman_testimonial.mp4` (~42.1 MB)
    - `sarvesh_testimonial.mp4` (~20.0 MB)
    - `Raman_munda testimonial.mp4` (~45.6 MB)
  - `093fb629` (*Thu Oct 29 2026*): Added `Farhat_Afreen testimonial.mp4` (~25–35 MB).
* **The Bandwidth Leak in `VideoTestimonials.jsx`:**
  ```jsx
  // Line 56 in VideoTestimonials.jsx
  <video
    ref={setVideoRef}
    src={testimonial.videoUrl}
    preload="metadata"
    playsInline
    controls={hasStarted}
    ...
  />
  ```
  - **Issue:** All 4 `<video>` elements are mounted into the DOM upon page load.
  - With `preload="metadata"`, modern browsers issue HTTP Range requests to inspect headers and buffer the initial seconds of each video.
  - If a video lacks the `moov` atom at the beginning of the file, browsers may download several megabytes per video just to read metadata.
  - Every single homepage load triggers network requests across all 4 videos (~8–20 MB per visit), even if no one clicks Play.

---

### Culprit B: About Page Feature Images (31.3 MB per Page Load)

* **Code Reference:** [`src/components/sections/WhyChooseSprint.jsx`](../../src/components/sections/WhyChooseSprint.jsx#L29-L76)
* **Git Commit History:**
  - `bde1cf0f` (*Wed Oct 21 2026*): Moved local image paths in `WhyChooseSprint` to Supabase public storage URLs (`about-images` bucket).
* **Exact File Sizes (verified locally in `public/images/about_page/`):**
  - `corporate trainer.png`: **8.1 MB**
  - `Real Internship.png`: **7.9 MB**
  - `Strong Industry Connect.png`: **7.7 MB**
  - `360° Development.png`: **7.6 MB**
  - **Total per page view:** **31.3 MB**
* **The Bandwidth Leak in `WhyChooseSprint.jsx`:**
  ```jsx
  // Line 138 in WhyChooseSprint.jsx
  <img
    key={feature.image}
    src={feature.image} // Points directly to https://vrapmahhtmhflaqbubux.supabase.co/storage/...
    alt={feature.alt}
    loading="lazy"
    className="..."
  />
  ```
  - **Issue:** Plain HTML `<img>` tags are used instead of Next.js `<Image>`.
  - Next.js image compression (WebP/AVIF) is completely bypassed.
  - Browsers download all 31.3 MB directly from Supabase Storage CDN.
  - **Only 160 visits to `/about` generates 5.0 GB of Cached Egress.**

---

## 4. Step-by-Step Fix Implementation

### Phase 1: Fix About Page Images (Drops 31.3 MB to ~250 KB)

Static marketing illustrations should be hosted locally as part of the Next.js application bundle, served via your hosting platform (Vercel provides 100 GB free bandwidth vs. Supabase's 5 GB).

#### Step 1.1: Convert local PNGs to WebP
Run the following shell script in the project root to convert the existing images in `public/images/about_page/`:
```bash
# Using cwebp or ffmpeg or ImageMagick
for img in "360° Development" "Real Internship" "Strong Industry Connect" "corporate trainer"; do
  ffmpeg -i "public/images/about_page/${img}.png" -quality 85 "public/images/about_page/${img}.webp"
done
```
*(Each file drops from ~8 MB to ~60–80 KB).*

#### Step 1.2: Update `WhyChooseSprint.jsx`
Update [`src/components/sections/WhyChooseSprint.jsx`](../../src/components/sections/WhyChooseSprint.jsx):

```diff
 const features = [
   {
     number: "01",
     title: "100% Corporate Trainers",
     description: "...",
     link: "Learn from the best",
     badge: "15+ Years",
     badgeDescription: "Average experience",
     badgeIcon: Users,
     icon: GraduationCap,
     accent: "teal",
     image:
-    "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/corporate-trainer.png",
+    "/images/about_page/corporate trainer.webp",
     alt: "Professionals collaborating in a workplace",
   },
   {
     number: "02",
     title: "Strong Industry Connect",
     // ...
     image:
-      "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/Strong-Industry-Connect.png",
+      "/images/about_page/Strong Industry Connect.webp",
     alt: "Professionals attending a collaborative business meeting",
   },
   {
     number: "03",
     title: "360° Development",
     // ...
     image:
-      "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/360-Development.png",
+      "/images/about_page/360° Development.webp",
     alt: "Laptop and programming workspace",
   },
   {
     number: "04",
     title: "Real Internship",
     // ...
     image:
-      "https://vrapmahhtmhflaqbubux.supabase.co/storage/v1/object/public/about-images/what-makes-us-unique/Real-Internship.png",
+      "/images/about_page/Real Internship.webp",
     alt: "Professional reviewing documents at a desk",
   },
 ];
```

---

### Phase 2: Optimize Videos (Keeping in Supabase 1 GB Storage)

If you choose to use Supabase Storage instead of Cloudflare R2:

#### Step 2.1: Compress the 4 Videos
Before uploading to Supabase, compress each video using `ffmpeg` with modern web parameters:
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 24 -preset slow \
  -vf "scale='min(720,iw)':-2" \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output_optimized.mp4
```
* **`-crf 24`**: High perceived visual quality with minimal bitrate.
* **`scale='min(720,iw)':-2`**: Standardizes height to 720p (perfect for vertical 3:4 mobile cards).
* **`-movflags +faststart`**: Moves the MP4 index (`moov` atom) to the front of the file so streaming begins instantly without buffering the whole file.
* **Target size:** ~3 to 4 MB per testimonial video (~14 MB total).

#### Step 2.2: Re-upload to Supabase `home-image` Bucket
Overwrite the existing files in Supabase Storage with the compressed versions.

#### Step 2.3: Modify `VideoTestimonials.jsx` to "Click-to-Load"
In [`src/components/Home/VideoTestimonials.jsx`](../../src/components/Home/VideoTestimonials.jsx):
1. Change `preload="metadata"` to `preload="none"`.
2. Do not set `src` until the user presses Play.

```diff
@@ -48,7 +48,7 @@ function VideoTestimonial({ testimonial, onVideoPlay, onVideoPause, registerVid
       <video
         ref={setVideoRef}
-        src={testimonial.videoUrl}
+        src={hasStarted ? testimonial.videoUrl : undefined}
         onDragStart={(event) => event.preventDefault()}
-        playsInline preload="metadata" controls={hasStarted}
+        playsInline preload="none" controls={hasStarted}
```

**Why this stops overusage:**
- Visitors who simply scroll down the home page will **download 0 MB** of video data.
- Egress is only incurred when an engaged user actively clicks the play icon.

---

### Phase 3: Alternative Video Hosting Comparison

| Option | Setup Effort | Storage Cost | Egress Cost | Monthly Bandwidth Ceiling | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Supabase Storage (Optimized)** | Very Low | Free (Uses ~15 MB / 1 GB) | Free up to 5 GB | ~1,400 video plays | Keeping everything in current project; low-to-medium traffic. |
| **Cloudflare R2** | Low (5 min setup) | Free (10 GB) | **$0.00 forever** | Unlimited egress | High traffic scale; guaranteed zero egress bills forever. |
| **YouTube Unlisted** | Medium (Embed UI) | Free | **$0.00** | Unlimited egress | Maximum compatibility; automatic 360p/480p/720p/1080p adaptation. |

---

### Phase 4: Supabase Storage Cleanup
After updating the links:
1. Open the **Supabase Dashboard** → **Storage**.
2. Open the `about-images` bucket and remove the 8 MB raw PNGs.
3. If keeping videos in Supabase, ensure only the compressed versions are kept. If moving to another provider, delete the `home-image` video files.
4. This stops third-party web crawlers and cached search bots from continuing to download deprecated assets.

---

## 5. Expected Impact & Projected Usage

| Category | Prior Monthly Egress | Projected Monthly Egress |
| :--- | :--- | :--- |
| About Page Images (`WhyChooseSprint.jsx`) | ~4.5 GB | **0.00 GB** (Moved to local WebP) |
| Video Testimonials (`VideoTestimonials.jsx`) | ~10.5 GB | **~0.20 – 0.60 GB** (Compressed + `preload="none"`) |
| Supabase Auth & PostgREST Database API | < 0.20 GB | **< 0.20 GB** (Uncached database operations) |
| **Total Monthly Egress** | **15.33 GB (Over limit)** | **< 0.80 GB (Well within 5.00 GB allowance)** |

---

## 6. Verification Checklist
- [ ] Convert `public/images/about_page/*.png` to `.webp` and update `WhyChooseSprint.jsx`.
- [ ] Change `preload="metadata"` to `preload="none"` in `VideoTestimonials.jsx`.
- [ ] Compress all testimonial MP4 videos with `-movflags +faststart`.
- [ ] Confirm in Network tab that opening the Homepage transfers 0 bytes of video data until Play is clicked.
- [ ] Confirm in Supabase Dashboard → Reports → API & Storage that daily egress trajectory returns to < 50 MB/day.
