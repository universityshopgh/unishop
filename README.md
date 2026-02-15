# University Shop Hub (AAMUSTED Edition)

A premium, high-performance E-commerce & Branding hub built for the AAMUSTED community. This platform integrates real-time product synchronization, ambassador coupon tracking, and multi-channel notifications.

## 🚀 Key Features

- **Dynamic Shop**: Real-time product catalog synced with Firestore.
- **Ambassador Program**: Dashboard for tracking coupon usage and referral impact.
- **Admin Intelligence**: Centralized dashboard for orders, users, and product management.
- **Secure Checkout**: Paystack integration for seamless transactions.
- **Notification Hub**: OTP verification and order alerts via Email.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Styling**: Vanilla CSS & Tailwind CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Payments**: [Paystack](https://paystack.com/)

## ⚙️ Environment Configuration

To run this project, you will need to add the following variables to your `.env.local` file:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}

# Payments & Notifications
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_pk
PAYSTACK_SECRET_KEY=your_paystack_sk
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=universityshop845@gmail.com
```

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## 📄 License

Private - All rights reserved.

