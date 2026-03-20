import { useEffect, useMemo, useState } from 'react';
import { eventApi } from '../api/services';
import EventCard from '../components/EventCard';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventApi.list({ published: true, category: category || undefined });
        setEvents(response.data.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [category]);

  const categories = useMemo(() => [...new Set(events.map((event) => event.category))], [events]);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Upcoming Events</h1>
          <p>Browse published events and reserve your tickets.</p>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <ErrorMessage message={error} />
      {loading ? <Loader text="Loading events..." /> : <div className="grid">{events.map((event) => <EventCard key={event._id} event={event} />)}</div>}
    </section>
  );
};

export default EventListPage;
