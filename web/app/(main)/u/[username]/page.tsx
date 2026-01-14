import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  // Redirect to trips tab by default
  redirect(`/u/${username}/trips`);
}
