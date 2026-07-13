import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <Card className={cn("border-2 border-dashed py-16", className)}>
            <CardContent className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/5 rounded-full p-4">
                    <Icon className="text-primary size-8" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-muted-foreground max-w-sm text-sm">
                        {description}
                    </p>
                </div>
                {action && (
                    <Button
                        onClick={action.onClick}
                        className="flex items-center gap-2"
                    >
                        {action.icon && <action.icon className="size-4" />}
                        {action.label}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
