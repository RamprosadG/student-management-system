"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/buttons/Button";
import { HiRefresh } from "react-icons/hi";

export function ResultsRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary-outline"
      size="md"
      icon={<HiRefresh className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />}
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
    >
      Refresh Ledger
    </Button>
  );
}
