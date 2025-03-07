"use client";
import { PurchaseHistory } from "@prisma/client";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface Item {
  id: string;
  imageSrc2: string;
  title: string;
  category: string;

  // Add more properties as required by your application
}

interface History {
  item: Item;
  purchaseDate: Date;
  totalPrice: number;
  // Add more properties as required by your application
}

interface HistoryElementProps {
  history: History;
  sno: number;
}

const HistoryElement: React.FC<HistoryElementProps> = ({ history, sno }) => {
  const formattedDate = formatDistanceToNow(history.purchaseDate, {
    addSuffix: true,
  });

  return (
    <tr className="hover">
      <th>{sno}</th>
      <th>
        {" "}
        <a href={`/item/${history.item.id}`}>
          <Image
            alt="Image ssrc2"
            width="50"
            height="50"
            src={history.item.imageSrc2}
            style={{ maxHeight: "50px", maxWidth: "50px" }}
          />{" "}
        </a>
      </th>
      <td>{history.item.title}</td>
      <td>{formattedDate}</td>
      <td>{history.item.category}</td>
      <td>₹{history.totalPrice}</td>
    </tr>
  );
};

export default HistoryElement;
