import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { Button } from "../components/Button";
import axios from "axios";
import { toast } from "react-toastify";
import TD from "./TD";
import { jwtDecode } from "jwt-decode";
import "./Home.css"; // Import CSS

export const Home = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    transactionType: "Expense",
    date: new Date().toISOString().split("T")[0],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in");
      navigate("/signin", { replace: true });
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken) {
        setUserFirstName(decodedToken.firstName || "User");
      }
    } catch (error) {
      toast.error("Invalid session, please sign in again");
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to view transactions");
      navigate("/signin");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/transactions/getTransactions",
        { type: "all" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setExpenses(response.data.transactions);
      } else {
        toast.error(response.data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      navigate("/signin");
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not authenticated");
        navigate("/signin");
        return;
      }

      const payload = { ...newExpense, amount: parseFloat(newExpense.amount) };

      const response = await axios.post(
        "http://localhost:3000/api/v1/transactions/addTransaction",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Expense added successfully!");
        fetchTransactions();
        setShowForm(false);
        setNewExpense({
          title: "",
          amount: "",
          category: "",
          description: "",
          transactionType: "Expense",
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        toast.error(response.data.message || "Failed to add expense");
      }
    } catch (error) {
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin", { replace: true });
    toast.success("Logged out successfully!");
  };

  return (
    <div className="dashboard-container">
      <Appbar userFirstName={userFirstName} onLogout={handleLogout} />

      <div className="add-transaction-btn">
        <Button label="Add New Transaction" onClick={() => setShowForm(true)} className="add-button" />
      </div>

      {showForm && (
        <div className="overlay">
          <div className="form-container">
            <h2 className="form-title">Add Expense</h2>

            <input
              type="text"
              placeholder="Title"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              className="input-field"
            />

            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="input-field"
            />

            <select
              value={newExpense.transactionType}
              onChange={(e) => setNewExpense({ ...newExpense, transactionType: e.target.value })}
              className="input-field"
            >
              <option value="Expense">Expense</option>
              <option value="Credit">Credit</option>
            </select>

            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              className="input-field"
            />

            <select
              name="category"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="input-field"
            >
              <option value="">Select Category</option>
              <option value="Groceries">Groceries</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Salary</option>
              <option value="Tip">Tip</option>
              <option value="Food">Food</option>
              <option value="Medical">Medical</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="input-field"
            />

            <div className="form-actions">
              <Button label="Cancel" onClick={() => setShowForm(false)} className="cancel-button" />
              <Button
                label={loading ? "Adding..." : "Add Expense"}
                onClick={handleAddExpense}
                disabled={loading}
                className="submit-button"
              />
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        {expenses.length > 0 ? (
          <TD data={expenses} onRefresh={fetchTransactions} />
        ) : (
          <p className="loading-text">Loading transactions...</p>
        )}
      </div>
    </div>
  );
}