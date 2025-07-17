export const RAW_CODE = `
type Event = {
  id: string;
  name: string;
  city: string;
  date: string;
};

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/events')
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(data => setEvents(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h2>{event.name}</h2>
          <p>{event.city}</p>
          <p>{event.date}</p>
        </div>
      ))}
    </div>
  );
};

export default EventList;

`;

export const DOC_CODE = `
/**
 * Fetches and displays a list of events.
 * Manages loading and error states.
 *
 * @component
 */
const EventList: React.FC = () => {
  /** List of fetched events */
  const [events, setEvents] = useState<Event[]>([]);
  /** Loading indicator */
  const [loading, setLoading] = useState<boolean>(true);
  /** Error message, if any */
  const [error, setError] = useState<string | null>(null);

  /**
   * On component mount, request events from the API.
   * Updates the states.
   */
  useEffect(() => {
    fetch('/api/events')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network error');
        }
        return res.json();
      })
      .then((data: Event[]) => {
        setEvents(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Show loading message
  if (loading) {
    return <div>Loading events...</div>;
  }

  // Show error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render list of events
  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>
          <h2>{event.name}</h2>
          <p>{event.city}</p>
          <p>{event.date}</p>
        </div>
      ))}
    </div>
  );
};

export default EventList;

`;
