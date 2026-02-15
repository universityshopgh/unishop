
/**
 * UniShop Email Templates
 * Premium HTML designs for Hub notifications.
 */

const LOGO_MARKUP = `
    <h1 style="color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; font-weight: 900; font-size: 28px; margin-bottom: 4px;">
        University <span style="color: #ef4444;">Shop</span>
    </h1>
    <p style="color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 32px;">
        Official Campus Hub
    </p>
`;

export const otpTemplate = (code: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0e; padding: 40px; border-radius: 32px; color: #ffffff; border: 1px solid #1f1f23;">
        ${LOGO_MARKUP}
        
        <div style="background-color: #16161a; padding: 32px; border-radius: 20px; border: 1px solid #27272a; text-align: center;">
            <p style="color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px; margin-bottom: 20px;">Verification Access Protocol</p>
            <h2 style="color: #ffffff; font-size: 56px; font-weight: 900; letter-spacing: 0.2em; margin: 0; font-family: monospace;">${code}</h2>
        </div>
        
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 32px; font-weight: 500;">
            This security code is active for 10 minutes. If you did not initiate this handshake, please ignore this transmission.
        </p>
        
        <div style="margin-top: 40px; padding-top: 24px; border-t: 1px solid #1f1f23; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 0.1em;">
            SECURE ACCESS PROTOCOL // GS-V3 ACTIVE
        </div>
    </div>
`;

export const welcomeTemplate = (name: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0e; padding: 40px; border-radius: 32px; color: #ffffff; border: 1px solid #1f1f23;">
        <h1 style="color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; font-weight: 900; font-size: 28px; margin-bottom: 4px;">
            University <span style="color: #ef4444;">Shop</span>
        </h1>
        <p style="color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 48px;">Identity Secured</p>
        
        <h2 style="font-size: 32px; font-weight: 900; text-transform: uppercase; font-style: italic; margin-bottom: 20px; line-height: 1.1;">Welcome to <br/><span style="color: #ef4444;">The Grid</span>, ${name}</h2>
        
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin-bottom: 40px; font-weight: 500;">
            Your profile has been successfully integrated into the University Shop ecosystem. You now have full access to high-performance lifestyle and tech essentials.
        </p>
        
        <div style="background-color: #16161a; padding: 32px; border-radius: 20px; border: 1px solid #27272a; margin-bottom: 40px;">
            <p style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Active Privileges</p>
            <ul style="color: #ffffff; font-size: 13px; font-weight: 600; padding-left: 18px; line-height: 2;">
                <li>Premium Campus Drops Access</li>
                <li>Exclusive Member Discounts</li>
                <li>Unified Order Tracking</li>
            </ul>
        </div>
        
        <a href="https://universityshop845.com" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 18px 40px; border-radius: 16px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Initiate Exploration</a>
        
        <div style="margin-top: 48px; border-top: 1px solid #1f1f23; padding-top: 24px; text-align: center;">
            <p style="color: #52525b; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em;">
                © 2026 UNIVERSITY SHOP. ALL RIGHTS RESERVED.
            </p>
        </div>
    </div>
`;

export const orderAdminTemplate = (orderId: string, total: string, name: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0e; padding: 40px; border-radius: 32px; color: #ffffff; border: 1px solid #ef4444;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px;">
            <div>
                <h1 style="color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; font-weight: 900; font-size: 24px; margin-bottom: 4px;">
                    UniShop <span style="color: #ef4444;">HQ</span>
                </h1>
                <p style="color: #ef4444; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; font-size: 10px;">Critical Order Alert</p>
            </div>
        </div>
        
        <div style="background-color: #16161a; padding: 32px; border-radius: 20px; border: 1px solid #27272a; margin-bottom: 32px;">
            <p style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Transaction Details</p>
            <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Order ID:</span>
                <span style="color: #ffffff; font-weight: 800; margin-left: 8px;">#${orderId.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Customer:</span>
                <span style="color: #ffffff; font-weight: 800; margin-left: 8px;">${name}</span>
            </div>
            <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Total Amount:</span>
                <span style="color: #10b981; font-weight: 900; margin-left: 8px;">₵${total}</span>
            </div>
        </div>

        <a href="https://universityshop845.com/admin/orders" style="display: block; text-align: center; background-color: #ef4444; color: #ffffff; padding: 18px; border-radius: 16px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Fulfill Order</a>
    </div>
`;

export const orderCustomerTemplate = (name: string, orderId: string, total: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 32px; color: #0f172a; border: 1px solid #e2e8f0;">
        <h1 style="color: #0f172a; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; font-weight: 900; font-size: 28px; margin-bottom: 4px;">
            University <span style="color: #ef4444;">Shop</span>
        </h1>
        <p style="color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 48px;">Order Confirmed</p>
        
        <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; margin-bottom: 16px;">Order Dispatched, ${name}!</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
            We've received your order and our campus hub team is already preparing it for delivery.
        </p>
        
        <div style="background-color: #f8fafc; padding: 32px; border-radius: 20px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Order Number</span>
                <span style="color: #0f172a; font-weight: 800;">#${orderId.slice(0, 8).toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Total Paid</span>
                <span style="color: #0f172a; font-weight: 800;">₵${total}</span>
            </div>
        </div>

        <p style="color: #64748b; font-size: 12px; margin-top: 32px; font-weight: 500;">
            You can track your package status directly from your profile dashboard.
        </p>

        <a href="https://universityshop845.com/profile/orders" style="display: inline-block; margin-top: 24px; background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px;">Track Package</a>
    </div>
`;

export const referralAlertTemplate = (name: string, couponCode: string, earnings: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0e; padding: 40px; border-radius: 32px; color: #ffffff; border: 1px solid #1f1f23;">
        <h1 style="color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: -0.05em; font-weight: 900; font-size: 28px; margin-bottom: 4px;">
            University <span style="color: #ef4444;">Shop</span>
        </h1>
        <p style="color: #10b981; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 48px;">Earnings Alert</p>
        
        <h2 style="font-size: 32px; font-weight: 900; text-transform: uppercase; font-style: italic; margin-bottom: 20px; line-height: 1.1;">
            New <span style="color: #10b981;">Commission</span><br/>Secured, ${name}
        </h2>
        
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin-bottom: 40px; font-weight: 500;">
            Excellent work, Ambassador. Your unique identifier has successfully converted a new sale.
        </p>
        
        <div style="background-color: #16161a; padding: 32px; border-radius: 20px; border: 1px solid #27272a; margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Code Used</span>
                <span style="color: #ffffff; font-weight: 900; letter-spacing: 0.05em;">${couponCode}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Estimated Earnings</span>
                <span style="color: #10b981; font-size: 24px; font-weight: 900; letter-spacing: -0.05em;">+ ₵${earnings}</span>
            </div>
        </div>
        
        <a href="https://universityshop845.com/profile/ambassador" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 18px 40px; border-radius: 16px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">View Performance</a>
        
        <div style="margin-top: 48px; border-top: 1px solid #1f1f23; padding-top: 24px; text-align: center;">
            <p style="color: #52525b; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em;">
                EARNINGS SUBJECT TO FINAL VERIFICATION
            </p>
        </div>
    </div>
`;

export const resetPasswordTemplate = (link: string) => `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0c0e; padding: 40px; border-radius: 32px; color: #ffffff; border: 1px solid #1f1f23;">
        ${LOGO_MARKUP}
        
        <p style="color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 10px; margin-bottom: 48px;">Security Alert</p>
        
        <h2 style="font-size: 32px; font-weight: 900; text-transform: uppercase; font-style: italic; margin-bottom: 20px; line-height: 1.1;">
            Password <span style="color: #ef4444;">Reset</span><br/>Request
        </h2>
        
        <p style="color: #94a3b8; font-size: 15px; line-height: 1.7; margin-bottom: 40px; font-weight: 500;">
            We received a request to reset the password for your University Shop account. If you didn't request this, you can safely ignore this email.
        </p>
        
        <div style="background-color: #16161a; padding: 32px; border-radius: 20px; border: 1px solid #27272a; margin-bottom: 40px;">
            <p style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Action Required</p>
            <a href="${link}" style="display: inline-block; background-color: #ffffff; color: #000000; padding: 18px 40px; border-radius: 16px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Reset Password</a>
        </div>

        <p style="color: #52525b; font-size: 13px; margin-top: 32px;">
            Or copy and paste this link into your browser:<br/>
            <span style="color: #ef4444; word-break: break-all;">${link}</span>
        </p>
        
        <div style="margin-top: 48px; border-top: 1px solid #1f1f23; padding-top: 24px; text-align: center;">
            <p style="color: #52525b; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em;">
                SECURE LINK • EXPIRES IN 1 HOUR
            </p>
             <p style="color: #52525b; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3em; margin-top: 8px;">
                © 2026 UNIVERSITY SHOP. ALL RIGHTS RESERVED.
            </p>
        </div>
    </div>
`;
