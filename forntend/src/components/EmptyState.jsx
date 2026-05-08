
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = '🛍️',
  title = 'Nothing here yet',
  description = '',
  actionLabel = 'Continue Shopping',
  actionTo = '/',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center text-5xl shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
      {actionLabel && (
        <Link
          to={actionTo}
          className="mt-2 px-6 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-sm transition-all hover:shadow-md hover:shadow-yellow-200"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
