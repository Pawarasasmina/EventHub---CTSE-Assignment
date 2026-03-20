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

  if (loading) return <Loader text="Loading event studio..." />;
  if (!event) return <ErrorMessage message={error || 'Event not found'} />;

  return (
    <section className="detail-layout">
      <article className="detail-hero glass-card">
        <div className="detail-hero__content">
          <span className="section-tag">{event.category}</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>
        <div className="detail-hero__meta">
          <div>
            <span>Date</span>
            <strong>{new Date(event.eventDate).toLocaleString()}</strong>
          </div>
          <div>
            <span>Venue</span>
            <strong>{event.venue}</strong>
          </div>
          <div>
            <span>Price</span>
            <strong>${event.ticketPrice}</strong>
          </div>
          <div>
            <span>Seats left</span>
            <strong>{event.availableSeats}</strong>
          </div>
        </div>
      </article>

      <div className="detail-columns">
        <article className="glass-card detail-panel">
          <div className="section-heading">
            <div>
              <span className="section-tag">Experience overview</span>
              <h2>Event snapshot</h2>
            </div>
          </div>
          <div className="detail-list">
            <div>
              <span>Ticket strategy</span>
              <strong>${event.ticketPrice} per attendee</strong>
            </div>
            <div>
              <span>Capacity</span>
              <strong>{event.availableSeats} / {event.totalSeats} seats open</strong>
            </div>
            <div>
              <span>Publishing status</span>
              <strong>{event.isPublished ? 'Live to customers' : 'Draft mode'}</strong>
            </div>
          </div>
        </article>

        <aside className="glass-card booking-panel">
          <span className="section-tag">Secure booking</span>
          <h2>Reserve your place</h2>
          <p>Choose your ticket count and confirm instantly through the booking microservice.</p>
          <ErrorMessage message={error} />
          {success && (
            <div className="notice notice--success">
              <strong>Booking confirmed.</strong>
              <span>{success}</span>
            </div>
          )}
          {user ? (
            <form className="stack" onSubmit={handleBooking}>
              <label className="field-label" htmlFor="ticketCount">Number of tickets</label>
              <input
                id="ticketCount"
                type="number"
                min="1"
                max={event.availableSeats || 1}
                value={ticketCount}
                onChange={(e) => setTicketCount(e.target.value)}
              />
              <div className="booking-summary">
                <span>Total estimate</span>
                <strong>${Number(ticketCount || 0) * Number(event.ticketPrice || 0)}</strong>
              </div>
              <button type="submit" disabled={event.availableSeats < 1}>Book Tickets</button>
            </form>
          ) : (
            <p className="state-message">Log in to book tickets and unlock personal notifications.</p>
          )}
        </aside>
      </div>
    </section>
  );
};

export default EventDetailsPage;
