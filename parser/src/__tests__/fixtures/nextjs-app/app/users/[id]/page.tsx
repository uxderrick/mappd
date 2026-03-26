import Link from 'next/link';
export default function UserPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>User {params.id}</h1>
      <Link href="/dashboard">Back to Dashboard</Link>
    </div>
  );
}
