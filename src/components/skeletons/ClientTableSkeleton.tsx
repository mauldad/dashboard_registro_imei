import { Calendar, CreditCard, User } from "lucide-react";

const SkeletonRow = () => (
  <div className="grid grid-cols-[auto,auto,1fr,auto,auto,auto,auto,auto,auto] gap-4 py-2">
    <div className="bg-gray-200 rounded w-16 h-4 animate-pulse"></div>
    <div className="bg-gray-200 rounded w-16 h-4 animate-pulse"></div>
    <div className="flex items-center gap-2">
      <User className="w-4 h-4 text-gray-400" />
      <div className="bg-gray-200 rounded w-24 h-4 animate-pulse"></div>
    </div>
    <div className="bg-gray-200 rounded w-20 h-4 animate-pulse"></div>
    <div className="bg-gray-200 rounded w-20 h-4 animate-pulse"></div>
    <div className="bg-gray-200 rounded w-24 h-4 animate-pulse"></div>
    <div className="bg-gray-200 rounded w-24 h-4 animate-pulse"></div>
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-400" />
      <div className="bg-gray-200 rounded w-16 h-4 animate-pulse"></div>
    </div>
    <div className="flex items-center gap-1">
      <CreditCard className="w-4 h-4 text-gray-400" />
      <div className="bg-gray-200 rounded w-16 h-4 animate-pulse"></div>
    </div>
  </div>
);

const ClientsTableSkeleton = ({ rows = 10 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, index) => (
      <SkeletonRow key={index} />
    ))}
  </div>
);

export default ClientsTableSkeleton;
