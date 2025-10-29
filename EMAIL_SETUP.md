# Email Setup Guide for Contact Form

You now have a complete email system set up! Here's how to configure it to receive emails when users submit the contact form:

## 🚀 Quick Setup Options

### Option 1: Resend (Recommended - Easiest)

1. **Sign up for Resend**: Go to https://resend.com and create a free account
2. **Get API Key**: In your dashboard, create an API key
3. **Add to environment**: Add to your `.env.local` file:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
4. **Update email addresses** in `/src/app/api/contact/route.ts`:
   - Change `'your-email@example.com'` to your actual email
   - Change `'yourfire-tracker-domain.com'` to your actual domain

### Option 2: Gmail/SMTP (Alternative)

1. **Enable 2FA**: Enable 2-factor authentication on your Gmail account
2. **Create App Password**:
   - Go to Google Account settings → Security → 2-Step Verification → App passwords
   - Generate an app password for "Mail"
3. **Add to environment**: Add to your `.env.local` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your_16_character_app_password
   ```
4. **Uncomment Nodemailer code** in `/src/app/api/contact/route.ts` (lines marked with comments)

## 📧 What You'll Receive

When someone submits the contact form, you'll get a beautifully formatted email with:

- **Contact Details**: Name, email, subject
- **Priority Level**: Visual priority indicator with colors
- **Category**: Type of inquiry
- **Full Message**: The user's message
- **User Information**: User ID (if logged in)
- **Timestamp**: When the message was sent
- **Priority-based Subject**: `Contact Form: Subject [PRIORITY]`

## 🎨 Email Features

- **HTML Formatting**: Professional table layout with colors
- **Priority Colors**: 
  - 🔴 Critical (Red)
  - 🟠 High (Orange) 
  - 🟡 Medium (Yellow)
  - 🟢 Low (Green)
- **Responsive Design**: Looks great on all devices
- **Plain Text Fallback**: For email clients that don't support HTML

## 🛠 Testing

1. Go to `/support/contact` on your site
2. Fill out and submit the form
3. Check your email inbox (and spam folder initially)
4. Verify the email formatting and information

## 🔧 Customization

### Change Email Template
Edit the HTML in `/src/app/api/contact/route.ts` around line 30-80

### Add More Recipients
Change the `to` field in the API route:
```javascript
to: ['admin@yoursite.com', 'support@yoursite.com']
```

### Modify Subject Line
Update the subject format around line 25 in the API route

## 🔒 Security Features

- **User Authentication**: Only authenticated users can submit (optional)
- **Rate Limiting**: Built-in API protection
- **Input Validation**: Server-side validation of all fields
- **Error Handling**: Graceful error handling and user feedback

## 📱 Mobile Ready

The email template is fully responsive and looks great on:
- Desktop email clients
- Mobile apps (Gmail, Outlook, Apple Mail)
- Web-based email clients

## 💡 Pro Tips

1. **Test Both Options**: Try Resend first (easier), fallback to Gmail if needed
2. **Check Spam**: First emails might go to spam folder
3. **Domain Setup**: For production, use a custom domain with Resend
4. **Backup Method**: Set up both email methods for redundancy
5. **Monitor Usage**: Both services have free tiers with limits

## 🚨 Troubleshooting

- **No emails received**: Check spam folder and verify API keys
- **API errors**: Check console logs and environment variables
- **Gmail issues**: Ensure app password is correct (not regular password)
- **Resend issues**: Verify domain configuration and API key

Your contact form is now fully functional and will send you professional emails for every submission! 🎉