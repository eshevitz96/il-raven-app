# FINAL DEPLOYMENT STEPS

Your app is built and ready for production. Since we are creating a **Subdomain** (`raven.cmmncreators.com`), follow these exact steps:

### Phase 1: Vercel (Hosting)
1.  **Push Code:**
    *   Since you might not have GitHub connected visually, run these commands in your terminal if you have a repo:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/il-raven-webapp.git
        git push -u origin main
        ```
    *   *Alternatively*, if you don't use GitHub, you can use the Vercel CLI tool I can run for you, or drag-and-drop the folder `il-raven-webapp` into the [Vercel Dashboard](https://vercel.com/new).

2.  **Deploy:**
    *   Once on Vercel, the project defaults are correct. Click **Deploy**.

### Phase 2: Wix (The Subdomain)
1.  Log into **Wix.com**.
2.  Go to **Domains** > **Manage DNS Records**.
3.  Look for your domain `cmmncreators.com`.
4.  Click **+ Add Record**.
5.  Enter these EXACT details:

| Type | Host Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | **raven** | **cname.vercel-dns.com** | **1 Hour** |

6.  Save.

### Phase 3: Finish
1.  Go back to your **Vercel Dashboard**.
2.  Settings -> Domains.
3.  Add: `raven.cmmncreators.com`.
4.  Vercel will verify the connection (it might take 5-10 minutes).

**Your site will be live at:** [https://raven.cmmncreators.com](https://raven.cmmncreators.com)
