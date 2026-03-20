import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bookingApi, eventApi } from '../api/services';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const EventDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventApi.detail(id);
        setEvent(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await bookingApi.create({ eventId: id, ticketCount: Number(ticketCount) });
      setSuccess('Booking completed successfully. Check My Bookings and My Notifications.');
      const refreshed = await eventApi.detail(id);
      setEvent(refreshed.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <Loader text="Loading event..." />;
  if (!event) return <ErrorMessage message={error || 'Event not found'} />;

  return (
    <section className="detail-card">
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p><strong>Category:</strong> {event.category}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}</p>
      <p><strong>Ticket Price:</strong> ${event.ticketPrice}</p>
      <p><strong>Available Seats:</strong> {event.availableSeats}</p>
      <ErrorMessage message={error} />
      {success && <p className="success-message">{success}</p>}
      {user ? (
        <form className="form-inline" onSubmit={handleBooking}>
          <input type="number" min="1" max={event.availableSeats || 1} value={ticketCount} onChange={(e) => setTicketCount(e.target.value)} />
          <button type="submit" disabled={event.availableSeats < 1}>Book Tickets</button>
        </form>
      ) : (
        <p className="state-message">Log in to book tickets.</p>
      )}
    </section>
  );
};

export default EventDetailsPage;
