import { useEffect, useState } from 'react';
import { bookingApi } from '../api/services';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.byUser(user.id);
      setBookings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const handleCancel = async (id) => {
    try {
      await bookingApi.cancel(id);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <Loader text="Loading booking history..." />;

  return (
    <section className="page-stack">
      <section className="section-heading">
        <div>
          <span className="section-tag">Customer dashboard</span>
          <h1>My bookings</h1>
        </div>
        <p>{bookings.length} reservation records available</p>
      </section>
      <ErrorMessage message={error} />
      <div className="grid">
        {bookings.map((booking) => (
          <article className="event-card event-card--dashboard" key={booking._id}>
            <div className="event-card__eyebrow">
              <span className={`pill ${booking.status === 'cancelled' ? 'pill--muted' : 'pill--soft'}`}>{booking.status}</span>
              <span className="event-card__date">{booking.ticketCount} tickets</span>
            </div>
            <div className="event-card__body">
              <h3>Booking #{booking._id.slice(-6)}</h3>
              <p>Event reference: {booking.eventId}</p>
            </div>
            <dl className="event-card__facts">
              <div>
                <dt>Total</dt>
                <dd>${booking.totalAmount}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{booking.status}</dd>
              </div>
            </dl>
            {booking.status !== 'cancelled' && <button onClick={() => handleCancel(booking._id)}>Cancel Booking</button>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyBookingsPage;
