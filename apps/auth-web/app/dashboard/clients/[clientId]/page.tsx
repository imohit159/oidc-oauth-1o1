import { EditClientForm } from "@/features/dashboard/components/clients";

interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function EditClientPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EditClientForm clientId={resolvedParams.clientId} />;
}
