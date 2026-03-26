import Link from 'next/link';
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link href="/users/1">View User 1</Link>
      <Link href="/">Home</Link>
    </div>
  );
}
