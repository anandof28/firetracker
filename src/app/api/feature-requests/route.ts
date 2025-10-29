import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET - Fetch all public feature requests
export async function GET() {
  try {
    const featureRequests = await prisma.featureRequest.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          status: 'asc',
        },
        {
          votes: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    return NextResponse.json({ featureRequests });
  } catch (error) {
    console.error('Feature requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature requests' },
      { status: 500 }
    );
  }
}

// POST - Create new feature request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category, priority } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Get user details for the email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // Create feature request
    const featureRequest = await prisma.featureRequest.create({
      data: {
        title,
        description,
        category,
        priority: priority || 'medium',
        userId,
        status: 'submitted',
        isPublic: false, // Will be made public after admin approval
      },
    });

    // Send email notification to admin
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🚀 New Feature Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fire Tracker - Admin Notification</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">📝 Request Details</h2>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Title:</strong>
                <p style="margin: 5px 0; color: #1e293b; font-size: 16px;">${title}</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #475569;">Description:</strong>
                <p style="margin: 5px 0; color: #1e293b; line-height: 1.6;">${description}</p>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                  <strong style="color: #475569;">Category:</strong>
                  <span style="display: inline-block; background: #e0f2fe; color: #0277bd; padding: 4px 8px; border-radius: 4px; margin-left: 8px; font-size: 12px; text-transform: uppercase;">${category}</span>
                </div>
                <div>
                  <strong style="color: #475569;">Priority:</strong>
                  <span style="display: inline-block; background: ${
                    priority === 'high' ? '#ffebee; color: #c62828' :
                    priority === 'medium' ? '#fff3e0; color: #ef6c00' :
                    '#e8f5e8; color: #2e7d32'
                  }; padding: 4px 8px; border-radius: 4px; margin-left: 8px; font-size: 12px; text-transform: uppercase;">${priority}</span>
                </div>
              </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">👤 Submitted By</h3>
              <p style="margin: 5px 0; color: #475569;">
                <strong>Name:</strong> ${user?.name || 'Anonymous'}<br>
                <strong>Email:</strong> ${user?.email}
              </p>
            </div>
            
            <div style="background: #1e293b; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="color: white; margin: 0 0 15px 0; font-size: 16px;">📋 Admin Actions Required</p>
              <p style="color: #94a3b8; margin: 0; font-size: 14px; line-height: 1.5;">
                Please review this feature request and update its status in the admin panel.<br>
                Once approved, it will be visible to all users on the feature requests page.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                🔥 Fire Tracker | Financial Management System
              </p>
            </div>
          </div>
        </div>
      `;

      const resendResponse = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['lifeofram86@gmail.com'],
        subject: `🚀 New Feature Request: ${title}`,
        html: emailHtml,
      });

      if (!resendResponse.data) {
        const error = await resendResponse.error;
        console.error('Resend error:', error);
      }
    } catch (emailError) {
      console.error('Feature request email error:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Feature request submitted successfully',
      featureRequest,
    });
  } catch (error) {
    console.error('Feature request creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create feature request' },
      { status: 500 }
    );
  }
}