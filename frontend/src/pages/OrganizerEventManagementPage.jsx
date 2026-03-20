import { useEffect, useMemo, useState } from 'react';
import { bookingApi, eventApi } from '../api/services';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  title: '',
  description: '',
  category: '',
  venue: '',
  eventDate: '',
  ticketPrice: '',
  totalSeats: '',
  isPublished: false
};

const OrganizerEventManagementPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [managedBookings, setManagedBookings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);
  const [managedLoading, setManagedLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventApi.list();
      setEvents(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      setQueueLoading(true);
      const response = await bookingApi.approvalQueue();
      setApprovals(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking approval queue');
    } finally {
      setQueueLoading(false);
    }
  };

  const fetchManagedBookings = async () => {
    try {
      setManagedLoading(true);
      const response = await bookingApi.managed();
      setManagedBookings(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load managed bookings');
    } finally {
      setManagedLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchApprovals();
    fetchManagedBookings();
  }, []);

  const myEvents = useMemo(() => events.filter((event) => user.role === 'admin' || event.organizerId === user.id), [events, user]);

  const refreshData = () => {
    fetchEvents();
    fetchApprovals();
    fetchManagedBookings();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      ticketPrice: Number(form.ticketPrice),
      totalSeats: Number(form.totalSeats),
      isPublished: Boolean(form.isPublished)
    };

    try {
      if (editingId) {
        await eventApi.update(editingId, payload);
      } else {
        await eventApi.create(payload);
      }
      setForm(initialForm);
      setEditingId('');
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      eventDate: event.eventDate.slice(0, 16),
      ticketPrice: event.ticketPrice,
      totalSeats: event.totalSeats,
      isPublished: event.isPublished
    });
  };

  const handleDelete = async (id) => {
    try {
      await eventApi.remove(id);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleApprove = async (id) => {
    try {
      await bookingApi.confirm(id);
      refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm booking');
    }
  };

  const handleReject = async (id) => {
    try {
      await bookingApi.reject(id);
      refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject booking');
    }
  };

  return (
    <section className="page-stack">
      <section className="hero-panel hero-panel--compact">
        <div className="hero-panel__content">
          <span className="section-tag">Organizer workspace</span>
          <h1>Manage event launches, approval queues, pricing, publishing, and seat strategy in one control room.</h1>
          <p>Build polished event listings, review customer booking requests, and keep operations synced across event, booking, and notification services.</p>
        </div>
        <div className="hero-panel__stats hero-panel__stats--compact">
          <div>
            <strong>{myEvents.length}</strong>
            <span>Events owned</span>
          </div>
          <div>
            <strong>{myEvents.filter((event) => event.isPublished).length}</strong>
            <span>Published</span>
          </div>
          <div>
            <strong>{approvals.length}</strong>
            <span>Pending approvals</span>
          </div>
        </div>
      </section>

      <ErrorMessage message={error} />

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <span className="section-tag">Booking workflow</span>
            <h2>Approval queue</h2>
          </div>
          <p>Review pending booking requests before they become confirmed.</p>
        </div>
        {queueLoading ? <Loader text="Loading booking approvals..." /> : (
          <div className="grid">
            {approvals.map((booking) => (
              <article className="event-card event-card--dashboard" key={booking._id}>
                <div className="event-card__eyebrow">
                  <span className="pill pill--soft">pending</span>
                  <span className="event-card__date">{booking.ticketCount} tickets</span>
                </div>
                <div className="event-card__body">
                  <h3>{booking.eventTitle}</h3>
                  <p>{booking.eventVenue} • {new Date(booking.eventDate).toLocaleString()}</p>
                </div>
                <dl className="event-card__facts">
                  <div>
                    <dt>Customer ID</dt>
                    <dd>{booking.userId}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>${booking.totalAmount}</dd>
                  </div>
                </dl>
                <div className="button-row">
                  <button type="button" className="button" onClick={() => handleApprove(booking._id)}>Confirm</button>
                  <button type="button" className="button danger-button" onClick={() => handleReject(booking._id)}>Reject</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <span className="section-tag">Booking oversight</span>
            <h2>{user.role === 'admin' ? 'All event bookings' : 'Bookings for your events'}</h2>
          </div>
          <p>{user.role === 'admin' ? 'Admin can monitor bookings across the full platform.' : 'Organizers can monitor every booking tied to their own published events.'}</p>
        </div>
        {managedLoading ? <Loader text="Loading managed bookings..." /> : (
          <div className="grid">
            {managedBookings.map((booking) => (
              <article className="event-card event-card--dashboard" key={booking._id}>
                <div className="event-card__eyebrow">
                  <span className={`pill ${booking.status === 'confirmed' ? 'pill--soft' : booking.status === 'pending' ? 'pill--soft' : 'pill--muted'}`}>{booking.status}</span>
                  <span className="event-card__date">{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="event-card__body">
                  <h3>{booking.eventTitle}</h3>
                  <p>{booking.eventVenue} • {new Date(booking.eventDate).toLocaleString()}</p>
                </div>
                <dl className="event-card__facts">
                  <div>
                    <dt>Customer ID</dt>
                    <dd>{booking.userId}</dd>
                  </div>
                  <div>
                    <dt>Tickets</dt>
                    <dd>{booking.ticketCount}</dd>
                  </div>
                  <div>
                    <dt>Total</dt>
                    <dd>${booking.totalAmount}</dd>
                  </div>
                  <div>
                    <dt>Booking ID</dt>
                    <dd>{booking._id.slice(-6)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="dashboard-layout">
        <form className="stack glass-card dashboard-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <span className="section-tag">Event editor</span>
              <h2>{editingId ? 'Update listing' : 'Create new event'}</h2>
            </div>
          </div>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="form-split">
            <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </div>
          <div className="form-split">
            <input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
            <input type="number" placeholder="Ticket Price" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} />
          </div>
          <input type="number" placeholder="Total Seats" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
          <label className="checkbox-tile">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            <span>
              <strong>Publish this event</strong>
              <small>Visible immediately to attendees in the marketplace.</small>
            </span>
          </label>
          <button type="submit">{editingId ? 'Update Event' : 'Create Event'}</button>
        </form>

        <section className="page-stack">
          <div className="section-heading">
            <div>
              <span className="section-tag">Portfolio overview</span>
              <h2>Your managed events</h2>
            </div>
          </div>
          {loading ? <Loader text="Loading organizer events..." /> : (
            <div className="grid">
              {myEvents.map((event) => (
                <article className="event-card event-card--dashboard" key={event._id}>
                  <div className="event-card__eyebrow">
                    <span className="pill pill--soft">{event.isPublished ? 'Published' : 'Draft'}</span>
                    <span className="event-card__date">{new Date(event.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="event-card__body">
                    <h3>{event.title}</h3>
                    <p>{event.venue}</p>
                  </div>
                  <dl className="event-card__facts">
                    <div>
                      <dt>Seats</dt>
                      <dd>{event.availableSeats}/{event.totalSeats}</dd>
                    </div>
                    <div>
                      <dt>Price</dt>
                      <dd>${event.ticketPrice}</dd>
                    </div>
                  </dl>
                  <div className="button-row">
                    <button type="button" className="button button--ghost" onClick={() => handleEdit(event)}>Edit</button>
                    <button type="button" className="button danger-button" onClick={() => handleDelete(event._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default OrganizerEventManagementPage;
