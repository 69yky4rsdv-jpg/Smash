import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { subscriptionPlans, users } from "@/lib/data";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("vs_userId")?.value;

  if (!userId) {
    return NextResponse.json(
      {
        isLoggedIn: false,
        hasSubscription: false
      },
      { status: 200 }
    );
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json(
      {
        isLoggedIn: false,
        hasSubscription: false
      },
      { status: 200 }
    );
  }

  const plan = user.subscriptionPlanId
    ? subscriptionPlans.find((p) => p.id === user.subscriptionPlanId)
    : undefined;

  const hasSubscription = !!user.subscriptionPlanId || user.role === "admin";

  return NextResponse.json(
    {
      isLoggedIn: true,
      hasSubscription,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      subscriptionPlan: plan
        ? {
            id: plan.id,
            name: plan.name
          }
        : null
    },
    { status: 200 }
  );
}

