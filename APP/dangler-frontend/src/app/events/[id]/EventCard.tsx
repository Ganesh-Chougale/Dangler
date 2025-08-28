type EventCardProps = {
  title: string;
  description: string;
  date: string;
  media_url?: string;
};

export default function EventCard({ title, description, date, media_url }: EventCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800">
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-gray-500">{date}</p>
      <p className="mt-2">{description}</p>

      {media_url && (
        <div className="mt-3">
          {media_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
            <img src={media_url} alt={title} className="max-h-60 w-auto rounded-md mx-auto" />
          ) : media_url.match(/\.(mp4|webm)$/i) ? (
            <video src={media_url} controls className="max-h-60 mx-auto rounded-md" />
          ) : (
            <a href={media_url} target="_blank" className="text-blue-600 underline">
              View Media
            </a>
          )}
        </div>
      )}
    </div>
  );
}
