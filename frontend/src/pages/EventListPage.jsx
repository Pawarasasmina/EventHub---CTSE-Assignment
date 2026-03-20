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
  const featuredCount = events.filter((event) => event.availableSeats > 0).length;

  return (
    <section className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__content">
          <span className="section-tag">Live event marketplace</span>
          <h1>Design, launch, and fill standout events from one premium event workspace.</h1>
          <p>
            Discover published experiences, monitor live availability, and move from interest to confirmed booking
            with a cleaner, more professional attendee journey.
          </p>
          <div className="hero-panel__stats">
            <div>
              <strong>{events.length}</strong>
              <span>Published events</span>
            </div>
            <div>
              <strong>{featuredCount}</strong>
              <span>Ready to book</span>
            </div>
            <div>
              <strong>{categories.length || 1}</strong>
              <span>Active categories</span>
            </div>
          </div>
        </div>
        <div className="hero-panel__side glass-card">
          <p className="eyebrow">Audience pulse</p>
          <h2>Plan around demand, timing, and seat health.</h2>
          <p>Filter by category, compare availability instantly, and open detailed event pages before you commit.</p>
          <label className="field-label" htmlFor="category-filter">Category view</label>
          <select id="category-filter" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <ErrorMessage message={error} />

      {loading ? (
        <Loader text="Loading event collection..." />
      ) : (
        <section className="page-stack">
          <div className="section-heading">
            <div>
              <span className="section-tag">Browse experiences</span>
              <h2>Upcoming events</h2>
            </div>
            <p>{category ? `Showing ${category} events` : 'Showing all published events'}</p>
          </div>
          <div className="grid">{events.map((event) => <EventCard key={event._id} event={event} />)}</div>
        </section>
      )}
    </section>
  );
};

export default EventListPage;
