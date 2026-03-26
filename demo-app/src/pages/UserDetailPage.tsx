import { useParams, Link } from 'react-router-dom';

const USERS: Record<string, { name: string; email: string; role: string; joined: string }> = {
  '1': { name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineering Lead', joined: 'Jan 2024' },
  '2': { name: 'Bob Smith', email: 'bob@example.com', role: 'Product Designer', joined: 'Mar 2024' },
  '3': { name: 'Charlie Brown', email: 'charlie@example.com', role: 'Backend Engineer', joined: 'Jun 2024' },
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = id ? USERS[id] : null;

  if (!user) {
    return (
      <div>
        <h2>User Not Found</h2>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>User Profile</h2>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
      <div className="card user-detail">
        <div className="user-detail-avatar">{user.name[0]}</div>
        <h3>{user.name}</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Role</span>
            <span>{user.role}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Joined</span>
            <span>{user.joined}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
