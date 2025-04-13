import React, { useEffect, useState } from "react";
import axios from "axios";

const StoreDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const store_id = 1; // you can make this dynamic later

  useEffect(() => {
    const fetchInventory = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/inventory?store_id=${store_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    };
    fetchInventory();
  }, []);

  return (
    <div>
      <h2>Store Inventory</h2>
      <ul>
        {inventory.map(i => (
          <li key={i.product_id}>
            {i.product_name} | Qty: {i.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoreDashboard;
