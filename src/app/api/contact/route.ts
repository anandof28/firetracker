import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const body = await request.json();
    const { name, email, subject, priority, category, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Option 1: Using Resend (Add this to your .env.local)
    // RESEND_API_KEY=your_resend_api_key
    
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Fire Tracker <onboarding@resend.dev>', // Resend's verified domain for testing
          to: [process.env.CONTACT_EMAIL || 'your-email@example.com'], // Replace with your email
          subject: `Contact Form: ${subject} [${priority.toUpperCase()}]`,
          html: `
            <h2>New Contact Form Submission</h2>
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Subject:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Priority:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">
                    <span style="padding: 4px 8px; border-radius: 4px; background-color: ${
                      priority === 'critical' ? '#ef4444' : 
                      priority === 'high' ? '#f97316' : 
                      priority === 'medium' ? '#eab308' : '#22c55e'
                    }; color: white; text-transform: uppercase; font-size: 12px;">
                      ${priority}
                    </span>
                  </td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Category:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${category}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User ID:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${userId || 'Anonymous'}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px;">
                <h3>Message:</h3>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #e0f2fe; border-radius: 5px;">
                <p style="margin: 0; font-size: 14px; color: #0369a1;">
                  <strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { 
                    timeZone: 'Asia/Kolkata',
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
          `,
          text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}
Priority: ${priority}
Category: ${category}
User ID: ${userId || 'Anonymous'}

Message:
${message}

Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          `
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend error:', error);
        throw new Error('Failed to send email via Resend');
      }
    }

    // Option 2: Using Nodemailer with Gmail/SMTP (Alternative)
    // Uncomment this section if you prefer Nodemailer
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER, // your-email@gmail.com
        pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'your-email@example.com', // Replace with your email
      subject: `Contact Form: ${subject} [${priority.toUpperCase()}]`,
      html: // Same HTML template as above
    });
    */

    // Store in database (optional)
    // You can also save the contact form submission to your database here

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}