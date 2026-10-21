"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/buttons/Button";
import { HiRefresh } from "react-icons/hi";

interface StudentMarksheetRefreshButtonProps {
  isLoading?: boolean;
}

export default function StudentMarksheetRefreshButton({
  isLoading = false,
}: StudentMarksheetRefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isRefreshing = isLoading || isPending;

  return (
    <Button
      variant="secondary-outline"
      size="md"
      icon={<HiRefresh className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />}
      onClick={() => startTransition(() => router.refresh())}
      disabled={isRefreshing}
    >
      Refresh Marksheet
    </Button>
  );
}
