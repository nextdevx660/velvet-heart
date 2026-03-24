import { Crown, Gauge } from "lucide-react";

// This component shows the daily usage state for free users only.
export default function UsageBanner({ plan, used, limit = 20 }) {
  if (plan === "pro") {
    return (
      <div className="flex items-center gap-3 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <Crown className="h-4 w-4" />
        Pro plan active. Unlimited messages and memory are enabled.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
      <Gauge className="h-4 w-4" />
      You have used {used}/{limit} messages today.
    </div>
  );
}
