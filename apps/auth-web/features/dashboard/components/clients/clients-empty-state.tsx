import { KeyRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientsEmptyStateProps {
    onRegister: () => void;
}

export function ClientsEmptyState({ onRegister }: ClientsEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 py-20 text-center">
            <div className="bg-primary/5 mb-4 rounded-full p-4">
                <KeyRound className="text-primary size-8" />
            </div>
            <h3 className="text-base font-semibold">No clients registered</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                Register your first application to start integrating OAuth&nbsp;/&nbsp;OpenID
                Connect authorization flows.
            </p>
            <Button onClick={onRegister} className="mt-5 flex items-center gap-2">
                <Plus className="size-4" />
                Register your first client
            </Button>
        </div>
    );
}
