import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/lib/services/subscription-service";

export async function GET() {
  try {
    // Get plans for both intervals to debug
    const monthlyPlans = await subscriptionService.getSubscriptionPlans('monthly');
    const yearlyPlans = await subscriptionService.getSubscriptionPlans('yearly');
    
    return NextResponse.json({
      monthlyPlans,
      yearlyPlans,
      success: true
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ 
      error: "Failed to fetch plans", 
      details: (error as Error).message,
      success: false 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const interval = body.interval || 'monthly';
    
    const plans = await subscriptionService.getSubscriptionPlans(interval);
    
    return NextResponse.json({
      plans,
      interval,
      success: true
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ 
      error: "Failed to fetch plans", 
      details: (error as Error).message,
      success: false 
    }, { status: 500 });
  }
}
