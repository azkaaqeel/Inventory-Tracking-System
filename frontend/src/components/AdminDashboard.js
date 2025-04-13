import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    const fetchMovements = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/stock-movements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovements(res.data);
    };
    fetchMovements();
  }, []);

  return (
    <div>
      <h2>Stock Movements</h2>
      <ul>
        {movements.map(m => (
          <li key={m.id}>
            {m.store_id} | {m.product_id} | {m.type} | {m.quantity} | {m.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
