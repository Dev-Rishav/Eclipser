import { useState } from "react";
import axios from "axios";

export default function CodeSubmitForm() {
  const [code, setCode] = useState('print("Hello")');
  const [language, setLanguage] = useState("python");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3001/api/contest/submit", {
      contestId: "686271a4adfb8d473d4ca20c", 
      userId: "user_22222",
      code,
      language,
    });
    alert("Job submitted! ID: " + res.data.jobId);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <textarea
        className="w-full h-40 p-2 border rounded"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border p-2 rounded">
        <option value="python">Python</option>
        {/* Add JS, C++ if supported */}
      </select>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
        Submit Code
      </button>
    </form>
  );
}
