# Deployment Guide: IL RAVEN on Vercel

Since your main repository (`www.cmmncreators.com`) is hosted on **Wix**, you cannot "host" this custom Next.js application directly *inside* a Wix subfolder (like `/featured-project`) natively.

**The Solution:**
We will deploy this app to **Vercel** (the industry standard for Next.js) and connect it to your domain. You have two options for the URL:

---

## Option 1: Subdomain (Recommended)
*   **Result:** `https://raven.cmmncreators.com` (or `project.cmmncreators.com`)
*   **Pros:** Native performance, works perfectly on mobile, professional look.
*   **Cons:** URL is slightly different than `/featured-project`.

### Steps:

1.  **Push to GitHub**
    *   Create a repository on GitHub.
    *   Push this code to it.

2.  **Deploy on Vercel**
    *   Go to [Vercel.com](https://vercel.com) and Sign Up (free).
    *   Click **"Add New Project"** -> **"Continue with GitHub"**.
    *   Select your `il-raven-webapp` repository.
    *   Click **Deploy**.

3.  **Connect Domain (Wix DNS)**
    *   In your Vercel Project Dashboard, go to **Settings > Domains**.
    *   Enter `raven.cmmncreators.com` (or your choice).
    *   Vercel will give you a **CNAME Record** (usually pointing to `cname.vercel-dns.com`).
    *   **Go to Wix:**
        *   Go to **Domains** -> **Manage DNS Records**.
        *   Add a **CNAME** record.
        *   **Host:** `raven` (or `project`)
        *   **Value:** `cname.vercel-dns.com`
    *   Wait for propagation (usually minutes).

---

## Option 2: The "Embed" Method (Specific URL)
*   **Result:** `https://www.cmmncreators.com/featured-project`
*   **Pros:** Exact URL you requested.
*   **Cons:** The app runs inside a "window" (iframe). Mobile scrolling can sometimes be tricky.

### Steps:

1.  **Follow Steps 1 & 2 above** to get your Vercel URL (e.g., `il-raven-webapp.vercel.app`).
2.  **Go to Wix Editor**:
    *   Create a new page: `/featured-project`.
    *   Add Element -> **Embed Code** -> **Embed a Site**.
    *   Paste your Vercel URL.
    *   Stretch the element to fill the **entire screen** (width: 100%, height: 100vh).
    *   Publish Wix site.

---

## Important Note on Audio Files
Since this app uses a "Serverless Function" to read the audio files, **hosting on Vercel is required**. You cannot simply upload the files to Wix.
