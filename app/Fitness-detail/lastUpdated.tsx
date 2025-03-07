"use client";
//using date-fns library to format the date
import { formatDistanceToNow } from "date-fns";
interface LastUpdatedProps {
  lastUpdated: Date;
}
const LastUpdated: React.FC<LastUpdatedProps> = ({ lastUpdated }) => {
  const lastUpdatedDate = formatDistanceToNow(lastUpdated, { addSuffix: true });
  return (
    <div className="flex flex-col space-y-4 p-4  shadow rounded-lg">
      Last updated {lastUpdatedDate}
    </div>
  );
};
export default LastUpdated;
