"use client";

interface EventTimelineProps {
  events: any[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  return (
    <div>
      {events.map(event => (
        <div key={event.id} className="mb-4 border-b pb-2">
          <h3 className="font-semibold">{event.title}</h3>
          <p>{event.description}</p>
          {event.media && event.media.endsWith(".mp4") ? (
            <video src={`${process.env.NEXT_PUBLIC_API_URL}${event.media}`} controls className="mt-2 max-w-full" />
          ) : (
            event.media && <img src={`${process.env.NEXT_PUBLIC_API_URL}${event.media}`} alt={event.title} className="mt-2 max-w-full" />
          )}
        </div>
      ))}
    </div>
  );
}
