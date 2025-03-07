import { PurchaseHistory } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

interface HistoryPageProps {
  data?: PurchaseHistory;
}
const HistoryPageById: React.FC<HistoryPageProps> = ({ data }) => {
  //   console.log(data);

  if (data == null) {
    return <div>You never purchased It</div>;
  }
  const formattedDate = formatDistanceToNow(data.purchaseDate, {
    addSuffix: true,
  });
  return <div>Ordered {formattedDate}</div>;
};

export default HistoryPageById;
