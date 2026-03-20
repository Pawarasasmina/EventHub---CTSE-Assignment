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

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((current) => current.map((notification) => (
        notification._id === id
          ? { ...notification, isRead: true, readAt: notification.readAt || new Date().toISOString() }
          : notification
      )));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark notification as read');
    }
  };

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
              <span className={`pill ${notification.isRead ? 'pill--muted' : 'pill--soft'}`}>{notification.type}</span>
              <span className="event-card__date">{new Date(notification.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="event-card__body">
              <h3>{notification.title}</h3>
              <p>{notification.message}</p>
            </div>
            <dl className="event-card__facts">
              <div>
                <dt>Delivery</dt>
                <dd>{notification.status}</dd>
              </div>
              <div>
                <dt>Read state</dt>
                <dd>{notification.isRead ? 'Read' : 'Unread'}</dd>
              </div>
            </dl>
            {!notification.isRead && (
              <button type="button" className="button button--ghost" onClick={() => handleMarkAsRead(notification._id)}>
                Mark as read
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyNotificationsPage;
