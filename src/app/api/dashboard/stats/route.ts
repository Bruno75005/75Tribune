import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role, SubscriptionType } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get current date and last month date
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get total subscribers
    const totalSubscribers = await prisma.user.count({
      where: {
        subscriptionType: {
          not: SubscriptionType.FREE
        }
      }
    });

    // Get last month subscribers
    const lastMonthSubscribers = await prisma.user.count({
      where: {
        subscriptionType: {
          not: SubscriptionType.FREE
        },
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      }
    });

    // Get published articles count
    const publishedArticles = await prisma.article.count({
      where: {
        status: 'PUBLISHED'
      }
    });

    // Get last month published articles
    const lastMonthPublishedArticles = await prisma.article.count({
      where: {
        status: 'PUBLISHED',
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      }
    });

    // Calculate monthly revenue (assuming premium is 9.99€ and pro is 19.99€)
    const subscriptionCounts = await prisma.user.groupBy({
      by: ['subscriptionType'],
      where: {
        subscriptionType: {
          not: SubscriptionType.FREE
        }
      },
      _count: true
    });

    let monthlyRevenue = 0;
    let lastMonthRevenue = 0;

    for (const sub of subscriptionCounts) {
      const price = sub.subscriptionType === SubscriptionType.PREMIUM ? 9.99 : 19.99;
      monthlyRevenue += price * sub._count;
    }

    // Last month revenue calculation
    const lastMonthSubs = await prisma.user.groupBy({
      by: ['subscriptionType'],
      where: {
        subscriptionType: {
          not: SubscriptionType.FREE
        },
        createdAt: {
          lt: now,
          gte: lastMonth
        }
      },
      _count: true
    });

    for (const sub of lastMonthSubs) {
      const price = sub.subscriptionType === SubscriptionType.PREMIUM ? 9.99 : 19.99;
      lastMonthRevenue += price * sub._count;
    }

    // Calculate percentages
    const subscriberGrowth = totalSubscribers > 0 
      ? ((totalSubscribers - lastMonthSubscribers) / totalSubscribers) * 100 
      : 0;
    
    const articleGrowth = publishedArticles > 0 
      ? ((publishedArticles - lastMonthPublishedArticles) / publishedArticles) * 100 
      : 0;

    const revenueGrowth = monthlyRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / monthlyRevenue) * 100 
      : 0;

    // Get total views (you might need to implement a view tracking system)
    const totalViews = 0; // Implement view tracking
    const lastMonthViews = 0; // Implement view tracking
    const viewsGrowth = 0;

    return NextResponse.json({
      subscribers: {
        total: totalSubscribers,
        growth: subscriberGrowth.toFixed(1)
      },
      articles: {
        total: publishedArticles,
        growth: articleGrowth.toFixed(1)
      },
      views: {
        total: totalViews,
        growth: viewsGrowth.toFixed(1)
      },
      revenue: {
        total: monthlyRevenue.toFixed(2),
        growth: revenueGrowth.toFixed(1)
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
