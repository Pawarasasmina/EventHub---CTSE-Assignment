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
  const confirmedBookings = useMemo(() => managedBookings.filter((booking) => booking.status === 'confirmed').length, [managedBookings]);
  const pendingBookings = approvals.length;
  const totalRevenue = useMemo(() => managedBookings.filter((booking) => booking.status === 'confirmed').reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0), [managedBookings]);

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
    <section className="page-stack control-room-page">
      <section className="control-room-header glass-card">
        <div className="control-room-header__intro">
          <span className="section-tag">{user.role === 'admin' ? 'Admin control room' : 'Organizer workspace'}</span>
          <h1>{user.role === 'admin' ? 'Oversee platform bookings, alerts, and event performance from one command surface.' : 'Run your events with a clearer booking, approval, and publishing workspace.'}</h1>
          <p>
            {user.role === 'admin'
              ? 'Track every event, monitor pending requests, review all booking activity, and keep the platform aligned across services.'
              : 'Review incoming booking requests, monitor confirmed revenue, and manage your own event portfolio without leaving the control room.'}
          </p>
        </div>
        <div className="control-room-metrics">
          <article className="metric-card">
            <span>Events</span>
            <strong>{myEvents.length}</strong>
            <small>Managed event listings</small>
          </article>
          <article className="metric-card">
            <span>Pending</span>
            <strong>{pendingBookings}</strong>
            <small>Approval decisions waiting</small>
          </article>
          <article className="metric-card">
            <span>Confirmed</span>
            <strong>{confirmedBookings}</strong>
            <small>Confirmed bookings in view</small>
          </article>
          <article className="metric-card">
            <span>Revenue</span>
            <strong>${totalRevenue}</strong>
            <small>Confirmed booking value</small>
          </article>
        </div>
      </section>

      <ErrorMessage message={error} />

      <section className="control-room-grid">
        <section className="page-stack">
          <article className="section-panel glass-card">
            <div className="section-panel__header">
              <div>
                <span className="section-tag">Approval workflow</span>
                <h2>Booking approval queue</h2>
              </div>
              <p>Approve or reject only the requests that still need action.</p>
            </div>
            {queueLoading ? (
              <Loader text="Loading booking approvals..." />
            ) : approvals.length ? (
              <div className="page-stack compact-list">
                {approvals.map((booking) => (
                  <article className="workflow-card" key={booking._id}>
                    <div className="workflow-card__top">
                      <div>
                        <span className="pill pill--soft">Pending review</span>
                        <h3>{booking.eventTitle}</h3>
                      </div>
                      <strong>{booking.ticketCount} tickets</strong>
                    </div>
                    <div className="workflow-card__meta">
                      <span>{booking.eventVenue}</span>
                      <span>{new Date(booking.eventDate).toLocaleString()}</span>
                      <span>Customer: {booking.customerName || booking.userId}</span>
                      <span>Total: ${booking.totalAmount}</span>
                    </div>
                    <div className="button-row">
                      <button type="button" className="button" onClick={() => handleApprove(booking._id)}>Confirm</button>
                      <button type="button" className="button danger-button" onClick={() => handleReject(booking._id)}>Reject</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <strong>No pending approvals</strong>
                <p>New booking requests for your scope will appear here automatically.</p>
              </div>
            )}
          </article>

          <article className="section-panel glass-card">
            <div className="section-panel__header">
              <div>
                <span className="section-tag">Booking oversight</span>
                <h2>{user.role === 'admin' ? 'All managed bookings' : 'Bookings for your events'}</h2>
              </div>
              <p>{user.role === 'admin' ? 'Global booking visibility for every event on the platform.' : 'Every booking tied to your own event portfolio.'}</p>
            </div>
            {managedLoading ? (
              <Loader text="Loading managed bookings..." />
            ) : managedBookings.length ? (
              <div className="page-stack compact-list">
                {managedBookings.map((booking) => (
                  <article className="workflow-card workflow-card--soft" key={booking._id}>
                    <div className="workflow-card__top">
                      <div>
                        <span className={`pill ${booking.status === 'cancelled' || booking.status === 'rejected' ? 'pill--muted' : 'pill--soft'}`}>{booking.status}</span>
                        <h3>{booking.eventTitle}</h3>
                      </div>
                      <strong>${booking.totalAmount}</strong>
                    </div>
                    <div className="workflow-card__meta workflow-card__meta--grid">
                      <span>Customer: {booking.customerName || booking.userId}</span>
                      <span>Tickets: {booking.ticketCount}</span>
                      <span>Event date: {new Date(booking.eventDate).toLocaleString()}</span>
                      <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <strong>No bookings yet</strong>
                <p>Once customers start requesting tickets, their records will appear here for monitoring.</p>
              </div>
            )}
          </article>
        </section>

        <section className="page-stack control-room-sidebar">
          <article className="section-panel glass-card">
            <div className="section-panel__header">
              <div>
                <span className="section-tag">Event editor</span>
                <h2>{editingId ? 'Update event' : 'Create event'}</h2>
              </div>
              <p>{editingId ? 'You are editing an existing event listing.' : 'Publish a new event into the shared marketplace.'}</p>
            </div>
            <form className="stack" onSubmit={handleSubmit}>
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
          </article>

          <article className="section-panel glass-card">
            <div className="section-panel__header">
              <div>
                <span className="section-tag">Portfolio</span>
                <h2>{user.role === 'admin' ? 'Platform events' : 'Your event list'}</h2>
              </div>
              <p>{user.role === 'admin' ? 'Admin can review every event listing across the system.' : 'Quickly edit or remove the events you are responsible for.'}</p>
            </div>
            {loading ? (
              <Loader text="Loading organizer events..." />
            ) : myEvents.length ? (
              <div className="page-stack compact-list">
                {myEvents.map((event) => (
                  <article className="workflow-card workflow-card--soft" key={event._id}>
                    <div className="workflow-card__top">
                      <div>
                        <span className="pill pill--soft">{event.isPublished ? 'Published' : 'Draft'}</span>
                        <h3>{event.title}</h3>
                      </div>
                      <strong>${event.ticketPrice}</strong>
                    </div>
                    <div className="workflow-card__meta workflow-card__meta--grid">
                      <span>{event.venue}</span>
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      <span>Seats: {event.availableSeats}/{event.totalSeats}</span>
                      <span>Category: {event.category}</span>
                    </div>
                    <div className="button-row">
                      <button type="button" className="button button--ghost" onClick={() => handleEdit(event)}>Edit</button>
                      <button type="button" className="button danger-button" onClick={() => handleDelete(event._id)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-panel">
                <strong>No events yet</strong>
                <p>Create your first event to start managing tickets, approvals, and alerts from this control room.</p>
              </div>
            )}
          </article>
        </section>
      </section>
    </section>
  );
};

export default OrganizerEventManagementPage;
