import { useState } from "react";
import axios from "axios";

function LeadForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    linkedin: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/leads", form);
    alert("Lead Saved!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} /><br/>
      <input name="email" placeholder="Email" onChange={handleChange} /><br/>
      <input name="company" placeholder="Company" onChange={handleChange} /><br/>
      <input name="linkedin" placeholder="LinkedIn URL" onChange={handleChange} /><br/>
      <button type="submit">Submit</button>
    </form>
  );
}

export default LeadForm;