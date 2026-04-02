import { AppClientPage } from "@/components/app/app-client-page";

type AppPreviewPageProps = {
  searchParams?: Promise<{ state?: "upload" | "result" | "loading" | "offline" }>;
};

export default async function AppPreviewPage({ searchParams }: AppPreviewPageProps) {
  const params = (await searchParams) ?? {};
  return <AppClientPage email="preview@colorbestie.local" previewState={params.state} />;
}
