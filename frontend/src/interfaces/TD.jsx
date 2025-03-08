import React, { useEffect, useState } from "react";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import axios from "axios";
import { toast } from "react-toastify";
import "./TD.css"; // Import the CSS file

const TD = ({ data, onRefresh }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currId, setCurrId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  useEffect(() => {
    if (data) {
      setTransactions(data);
    }
  }, [data]);

  const handleEditClick = (itemKey) => {
    const editTran = transactions.find((item) => item._id === itemKey);
    if (editTran) {
      setCurrId(itemKey);
      setValues({
        title: editTran.title,
        amount: editTran.amount,
        description: editTran.description || "",
        category: editTran.category,
        date: moment(editTran.date).format("YYYY-MM-DD"),
        transactionType: editTran.transactionType,
      });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!values.title || !values.amount || !values.category) {
      toast.error("Please fill in all required fields", toastOptions);
      return;
    }
    try {
      setLoading(true);
      const updatedData = {
        ...values,
        amount: parseFloat(values.amount),
      };
      const response = await axios.put(
        `http://localhost:3000/api/v1/transactions/updateTransaction/${currId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (response.data.success) {
        toast.success("Transaction updated successfully!", toastOptions);

        // Update the local transactions state
        const updatedTransaction = {
          ...updatedData,
          _id: currId,
          date: new Date(values.date), // Preserve date as a Date object
        };
        setTransactions((prevTransactions) =>
          prevTransactions.map((item) =>
            item._id === currId ? updatedTransaction : item
          )
        );

        // Reset form and close modal
        setValues({
          title: "",
          amount: "",
          description: "",
          category: "",
          date: "",
          transactionType: "",
        });
        setCurrId(null);
        setShowEditModal(false);

        // Optional: Call onRefresh to sync with server
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data.message || "Failed to update transaction", toastOptions);
      }
    } catch (error) {
      console.error("Edit error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update transaction", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (itemKey) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:3000/api/v1/transactions/deleteTransaction/${itemKey}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (response.data.success) {
        toast.success("Transaction deleted successfully!", toastOptions);

        // Update local state by removing the deleted transaction
        setTransactions((prevTransactions) =>
          prevTransactions.filter((item) => item._id !== itemKey)
        );

        // Optional: Call onRefresh to sync with server
        if (onRefresh) onRefresh();
      } else {
        toast.error(response.data.message || "Failed to delete transaction", toastOptions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete transaction", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setShowEditModal(false);
    setValues({
      title: "",
      amount: "",
      description: "",
      category: "",
      date: "",
      transactionType: "",
    });
    setCurrId(null);
  };

  return (
    <>
      <div className="table-container">
        
        <table className="transaction-table">
          <thead className="table-header">
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id} className="table-row">
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>${item.amount}</td>
                <td>{item.transactionType}</td>
                <td>{item.category}</td>
                <td className="action-cell">
                  <EditNoteIcon className="edit-icon" onClick={() => handleEditClick(item._id)} />
                  <DeleteForeverIcon className="delete-icon" onClick={() => handleDeleteClick(item._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h2>Edit Transaction</h2>
              <button className="close-modal-btn" onClick={handleCancel}>✖</button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={values.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" name="amount" value={values.amount} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={values.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" name="date" value={values.date} onChange={handleChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Saving..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TD;