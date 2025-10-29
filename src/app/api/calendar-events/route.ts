import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const category = url.searchParams.get('category');

    let whereClause: any = { userId };

    // Filter by date range if provided
    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Filter by category if provided
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      title,
      description,
      startDate,
      endDate,
      allDay = false,
      priority = 'medium',
      category = 'general',
      accountId,
      fdId,
      mutualFundId,
      goldId,
      reminderEnabled = true,
      reminderTime = 15,
    } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allDay,
        priority,
        category,
        accountId,
        fdId,
        mutualFundId,
        goldId,
        reminderEnabled,
        reminderTime,
      },
    });

    return NextResponse.json(event);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}