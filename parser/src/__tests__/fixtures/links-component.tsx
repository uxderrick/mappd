import { Link, useNavigate, Form } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/settings');
  };

  return (
    <div>
      <Link to="/profile">Profile</Link>
      <Link to="/users/42">User Detail</Link>
      <a href="/about">About</a>

      <button onClick={handleClick}>Go to Settings</button>

      <Form method="post" action="/admin">
        <button name="intent" value="update">Update</button>
        <button name="intent" value="delete">Delete</button>
      </Form>
    </div>
  );
}
