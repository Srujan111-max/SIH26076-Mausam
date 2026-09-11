import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame, PrimaryButton } from "@/components/mausam/shell";
import { RoleCard, ALL_ROLES } from "@/components/mausam/pieces";
import { mausam, useMausam } from "@/lib/mausam/store";
import { prefRoleQueue } from "@/lib/mausam/flow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mausam — Weather personalised for how you live" },
      {
        name: "description",
        content:
          "Choose what matters to you — farming, travel, commute or running — and get a weather view built around it.",
      },
      { property: "og:title", content: "Mausam — Weather personalised for how you live" },
      {
        property: "og:description",
        content: "Pick your interests and get rainfall, alerts and daily guidance made for you.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { roles } = useMausam();
  const navigate = useNavigate();

  const go = () => {
    mausam.complete();
    const queue = prefRoleQueue(roles);
    if (queue.length) navigate({ to: "/preferences/$role", params: { role: queue[0]! } });
    else navigate({ to: "/dashboard" });
  };

  const skip = () => {
    mausam.complete();
    navigate({ to: "/dashboard" });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Mausam</p>
        <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-ink">
          How can Mausam help you?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Choose what matters most to you. We&apos;ll personalise your weather experience — pick as
          many as you like.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3.5">
          {ALL_ROLES.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              selected={roles.includes(role.id)}
              onToggle={() => mausam.toggleRole(role.id)}
            />
          ))}
        </div>

        <div className="mt-8">
          <PrimaryButton onClick={go} disabled={roles.length === 0}>
            Continue
          </PrimaryButton>
          <button
            type="button"
            onClick={skip}
            className="mt-3 w-full py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            Skip for now
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
