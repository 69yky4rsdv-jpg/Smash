import { NextResponse } from "next/server";
import { subscriptionPlans, getUsers } from "@/lib/data";
import { getAuthUserId } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = (await getAuthUserId()).trim();

  if (!userId) {
    return NextResponse.json(
      {
        isLoggedIn: false,
        hasSubscription: false
      },
      { status: 200 }
    );
  }

  let user = getUsers().find((u) => u.id === userId);

  // Default admin id always has access even if not in users.json (e.g. fresh deploy / other instance)
  if (!user && userId === "admin") {
    user = {
      id: "admin",
      email: "admin@velvetstream.test",
      password: "",
      role: "admin" as const,
      subscriptionPlanId: "yearly"
    };
  }

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

