import { useEffect, useState } from 'react';
import { notificationApi } from '../api/services';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const MyNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationApi.byUser(user.id);
        setNotifications(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  if (loading) return <Loader text="Loading notifications..." />;

  return (
    <section>
      <h1>My Notifications</h1>
      <ErrorMessage message={error} />
      <div className="grid">
        {notifications.map((notification) => (
          <article className="card" key={notification._id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <p><strong>Type:</strong> {notification.type}</p>
            <p><strong>Status:</strong> {notification.status}</p>
            <p><strong>Created:</strong> {new Date(notification.createdAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyNotificationsPage;
