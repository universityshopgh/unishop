# UniShop Hub Deployment Guide

Follow these steps when you are ready to take your local hub live to "real hosting" (e.g., Vercel).

## 1. Hosting on Vercel
Vercel is highly recommended for Next.js applications.

1. **GitHub Connection**: Once your code is on GitHub, go to [Vercel.com](https://vercel.com) and click **"Add New Project"**.
2. **Import**: Select your `unishop` repository.
3. **Environment Variables**: This is the most important step. You must copy/paste all variables from your `.env.local` into the **Environment Variables** section in the Vercel dashboard.
4. **Deploy**: Click "Deploy". Vercel will give you a live URL.

## 2. Firebase Production Setup

### Firestore Rules
Ensure your `firestore.rules` are deployed. Use the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### Authentication Domain
In the Firebase Console:
1. Go to **Authentication** > **Settings** > **Authorized Domains**.
2. Add your Vercel deployment URL (e.g., `unishop-king.vercel.app`) to the whitelist.

## 3. Paystack Webhooks
Once you have a live URL, update your Paystack settings so it can talk to your hub:
1. Go to **Paystack Dashboard** > **Settings** > **API Keys & Webhooks**.
2. Set the **Webhook URL** to `https://your-domain.com/api/webhooks/paystack`.

---

## 🛠️ Making Changes
You can change your code anytime locally!
1. Make your edits in VS Code.
2. Save the files.
3. Run these commands to update GitHub:
   ```bash
   git add .
   git commit -m "Describe your change here"
   git push
   ```

## 🗑️ Deleting the Repository
If you want to remove it from GitHub:
1. Go to your repository on GitHub.
2. Click **Settings** (top tab).
3. Scroll to the bottom ("Danger Zone").
4. Click **"Delete this repository"**.
