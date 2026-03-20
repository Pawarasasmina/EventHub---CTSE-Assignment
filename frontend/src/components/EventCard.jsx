import { Link } from 'react-router-dom';

const EventCard = ({ event }) => (
  <article className="card">
    <h3>{event.title}</h3>
    <p>{event.description}</p>
    <p><strong>Category:</strong> {event.category}</p>
    <p><strong>Venue:</strong> {event.venue}</p>
    <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}</p>
    <p><strong>Price:</strong> ${event.ticketPrice}</p>
    <p><strong>Available Seats:</strong> {event.availableSeats}</p>
    <Link className="button-link" to={`/events/${event._id}`}>View Details</Link>
  </article>
);

export default EventCard;
