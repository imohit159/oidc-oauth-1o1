import { Suspense } from "react";
import { ConsentView } from "@/features/oauth/components/consent-view";
import { Loader2 } from "lucide-react";

export default function ConsentPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[440px]">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <ConsentView />
        </Suspense>
      </div>
    </div>
  );
}
