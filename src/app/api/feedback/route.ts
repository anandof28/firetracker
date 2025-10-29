import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    const body = await request.json();
    const { 
      name, 
      email, 
      overallRating,
      easeOfUse,
      featureCompleteness,
      performance,
      design,
      wouldRecommend,
      favoriteFeatures,
      improvements,
      missingFeatures,
      bugReports,
      additionalComments
    } = body;

    // Validate required fields
    if (!name || !email || !overallRating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Fire Tracker Feedback <onboarding@resend.dev>',
          to: [process.env.CONTACT_EMAIL || 'lifeofram86@gmail.com'],
          subject: `Beta Feedback: ${name} - Overall Rating ${overallRating}/5`,
          html: `
            <h2>🎯 New Beta Feedback Submission</h2>
            <div style="font-family: Arial, sans-serif; max-width: 700px;">
              
              <!-- Contact Information -->
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #0369a1; margin: 0 0 10px 0;">Feedback From</h3>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 5px 10px; font-weight: bold; color: #374151;">Name:</td>
                    <td style="padding: 5px 10px; color: #111827;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px; font-weight: bold; color: #374151;">Email:</td>
                    <td style="padding: 5px 10px; color: #111827;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 10px; font-weight: bold; color: #374151;">User ID:</td>
                    <td style="padding: 5px 10px; color: #111827;">${userId || 'Anonymous'}</td>
                  </tr>
                </table>
              </div>

              <!-- Ratings Section -->
              <div style="background-color: #fefce8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #ca8a04; margin: 0 0 15px 0;">📊 Ratings & Scores</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #3b82f6;">
                    <strong>Overall Rating:</strong> 
                    <span style="font-size: 18px; color: #3b82f6;">${overallRating}/5 ${'⭐'.repeat(overallRating)}</span>
                  </div>
                  <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #10b981;">
                    <strong>Ease of Use:</strong> 
                    <span style="font-size: 16px; color: #10b981;">${easeOfUse}/5</span>
                  </div>
                  <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #f59e0b;">
                    <strong>Feature Completeness:</strong> 
                    <span style="font-size: 16px; color: #f59e0b;">${featureCompleteness}/5</span>
                  </div>
                  <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #ef4444;">
                    <strong>Performance:</strong> 
                    <span style="font-size: 16px; color: #ef4444;">${performance}/5</span>
                  </div>
                  <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #8b5cf6;">
                    <strong>Design:</strong> 
                    <span style="font-size: 16px; color: #8b5cf6;">${design}/5</span>
                  </div>
                  <div style="padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #06b6d4;">
                    <strong>Would Recommend:</strong> 
                    <span style="font-size: 16px; color: #06b6d4; text-transform: capitalize;">${wouldRecommend} ${wouldRecommend === 'yes' ? '👍' : wouldRecommend === 'no' ? '👎' : '🤷'}</span>
                  </div>
                </div>
              </div>

              <!-- Feedback Content -->
              <div style="space-y: 15px;">
                ${favoriteFeatures ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #059669; margin: 0 0 8px 0;">💚 Favorite Features</h4>
                    <div style="background-color: #ecfdf5; padding: 12px; border-radius: 6px; border-left: 4px solid #059669;">
                      ${favoriteFeatures.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                ` : ''}

                ${improvements ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #0369a1; margin: 0 0 8px 0;">🔧 Suggested Improvements</h4>
                    <div style="background-color: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 4px solid #0369a1;">
                      ${improvements.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                ` : ''}

                ${missingFeatures ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #7c3aed; margin: 0 0 8px 0;">✨ Missing Features</h4>
                    <div style="background-color: #faf5ff; padding: 12px; border-radius: 6px; border-left: 4px solid #7c3aed;">
                      ${missingFeatures.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                ` : ''}

                ${bugReports ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #dc2626; margin: 0 0 8px 0;">🐛 Bug Reports</h4>
                    <div style="background-color: #fef2f2; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626;">
                      ${bugReports.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                ` : ''}

                ${additionalComments ? `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #374151; margin: 0 0 8px 0;">💬 Additional Comments</h4>
                    <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; border-left: 4px solid #6b7280;">
                      ${additionalComments.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                ` : ''}
              </div>
              
              <!-- Footer -->
              <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
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
🎯 New Beta Feedback Submission

CONTACT INFORMATION:
Name: ${name}
Email: ${email}
User ID: ${userId || 'Anonymous'}

RATINGS:
Overall Rating: ${overallRating}/5
Ease of Use: ${easeOfUse}/5
Feature Completeness: ${featureCompleteness}/5
Performance: ${performance}/5
Design: ${design}/5
Would Recommend: ${wouldRecommend}

FEEDBACK:
${favoriteFeatures ? `Favorite Features:\n${favoriteFeatures}\n\n` : ''}
${improvements ? `Suggested Improvements:\n${improvements}\n\n` : ''}
${missingFeatures ? `Missing Features:\n${missingFeatures}\n\n` : ''}
${bugReports ? `Bug Reports:\n${bugReports}\n\n` : ''}
${additionalComments ? `Additional Comments:\n${additionalComments}\n\n` : ''}

Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          `
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error('Resend error:', error);
        throw new Error('Failed to send feedback email via Resend');
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent successfully' 
    });

  } catch (error) {
    console.error('Feedback form error:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    );
  }
}