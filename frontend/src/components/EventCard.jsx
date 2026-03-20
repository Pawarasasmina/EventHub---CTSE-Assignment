import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const availableRatio = event.totalSeats ? Math.max(0, Math.round((event.availableSeats / event.totalSeats) * 100)) : 0;

  return (
    <article className="event-card">
      <div className="event-card__eyebrow">
        <span className="pill pill--soft">{event.category}</span>
        <span className="event-card__date">{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
      <div className="event-card__body">
        <h3>{event.title}</h3>
        <p>{event.description}</p>
      </div>
      <dl className="event-card__facts">
        <div>
          <dt>Venue</dt>
          <dd>{event.venue}</dd>
        </div>
        <div>
          <dt>Starts</dt>
          <dd>{new Date(event.eventDate).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>${event.ticketPrice}</dd>
        </div>
        <div>
          <dt>Open Seats</dt>
          <dd>{event.availableSeats}</dd>
        </div>
      </dl>
      <div className="capacity-meter">
        <div>
          <span>Capacity health</span>
          <strong>{availableRatio}% seats available</strong>
        </div>
        <div className="capacity-meter__track">
          <span style={{ width: `${availableRatio}%` }} />
        </div>
      </div>
      <Link className="button-link" to={`/events/${event._id}`}>Open event</Link>
    </article>
  );
};

export default EventCard;
