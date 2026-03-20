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

  if (loading) return <Loader text="Loading notification center..." />;

  return (
    <section className="page-stack">
      <section className="section-heading">
        <div>
          <span className="section-tag">Notification center</span>
          <h1>My notifications</h1>
        </div>
        <p>{notifications.length} messages synced from the notification microservice</p>
      </section>
      <ErrorMessage message={error} />
      <div className="grid">
        {notifications.map((notification) => (
          <article className="event-card event-card--dashboard" key={notification._id}>
            <div className="event-card__eyebrow">
              <span className="pill pill--soft">{notification.type}</span>
              <span className="event-card__date">{new Date(notification.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="event-card__body">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
            </div>
            <dl className="event-card__facts">
              <div>
                <dt>Status</dt>
                <dd>{notification.status}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{new Date(notification.createdAt).toLocaleTimeString()}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyNotificationsPage;
