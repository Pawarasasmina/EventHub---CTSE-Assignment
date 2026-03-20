import { useEffect, useMemo, useState } from 'react';
import { eventApi } from '../api/services';
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
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const myEvents = useMemo(() => events.filter((event) => user.role === 'admin' || event.organizerId === user.id), [events, user]);

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

  return (
    <section>
      <h1>Organizer Event Management</h1>
      <ErrorMessage message={error} />
      <form className="stack card" onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        <input type="datetime-local" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
        <input type="number" placeholder="Ticket Price" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} />
        <input type="number" placeholder="Total Seats" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} />
        <label className="checkbox-row">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          Publish event
        </label>
        <button type="submit">{editingId ? 'Update Event' : 'Create Event'}</button>
      </form>
      {loading ? <Loader text="Loading organizer events..." /> : (
        <div className="grid">
          {myEvents.map((event) => (
            <article className="card" key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.venue}</p>
              <p>{new Date(event.eventDate).toLocaleString()}</p>
              <p>Seats: {event.availableSeats}/{event.totalSeats}</p>
              <p>Status: {event.isPublished ? 'Published' : 'Draft'}</p>
              <div className="button-row">
                <button onClick={() => handleEdit(event)}>Edit</button>
                <button className="danger-button" onClick={() => handleDelete(event._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrganizerEventManagementPage;
