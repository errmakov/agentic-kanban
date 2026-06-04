export interface SpeakerCardProps {
  name: string;
  role: string;
  bio: string;
  up: number;
  down: number;
  onVote: (vote: 'up' | 'down') => void;
}

export function SpeakerCard({ name, role, bio, up, down, onVote }: SpeakerCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
      <p className="flex-1 text-sm text-gray-700">{bio}</p>
      <div className="flex gap-3">
        <button
          onClick={() => onVote('up')}
          className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 active:scale-95 transition-transform"
          aria-label={`Thumbs up for ${name}`}
        >
          👍 <span className="tabular-nums">{up}</span>
        </button>
        <button
          onClick={() => onVote('down')}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 active:scale-95 transition-transform"
          aria-label={`Thumbs down for ${name}`}
        >
          👎 <span className="tabular-nums">{down}</span>
        </button>
      </div>
    </article>
  );
}
