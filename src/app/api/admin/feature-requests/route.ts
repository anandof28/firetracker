import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all feature requests for admin (including non-public ones)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Simple admin check - in a real app, you'd have proper role-based access
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || user.email !== 'lifeofram86@gmail.com') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const featureRequests = await prisma.featureRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ featureRequests });
  } catch (error) {
    console.error('Admin feature requests fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature requests' },
      { status: 500 }
    );
  }
}

// PUT - Update feature request status and other admin fields
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Simple admin check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user || user.email !== 'lifeofram86@gmail.com') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, isPublic, adminNotes, estimatedTimeline } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feature request ID is required' },
        { status: 400 }
      );
    }

    const updatedFeatureRequest = await prisma.featureRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
        ...(adminNotes && { adminNotes }),
        ...(estimatedTimeline && { estimatedTimeline }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Feature request updated successfully',
      featureRequest: updatedFeatureRequest,
    });
  } catch (error) {
    console.error('Admin feature request update error:', error);
    return NextResponse.json(
      { error: 'Failed to update feature request' },
      { status: 500 }
    );
  }
}