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

  if (loading) return <Loader text="Loading bookings..." />;

  return (
    <section>
      <h1>My Bookings</h1>
      <ErrorMessage message={error} />
      <div className="grid">
        {bookings.map((booking) => (
          <article className="card" key={booking._id}>
            <p><strong>Booking ID:</strong> {booking._id}</p>
            <p><strong>Event ID:</strong> {booking.eventId}</p>
            <p><strong>Tickets:</strong> {booking.ticketCount}</p>
            <p><strong>Total:</strong> ${booking.totalAmount}</p>
            <p><strong>Status:</strong> {booking.status}</p>
            {booking.status !== 'cancelled' && <button onClick={() => handleCancel(booking._id)}>Cancel Booking</button>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyBookingsPage;
