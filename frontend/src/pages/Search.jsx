import { useState } from "react";
import api from "../api";
import ProfileCard from "../components/ProfileCard";
import { btn, btnOutline, card, field, gridCards, label, wrap } from "../ui";

const empty = { name: "", lastName: "", locality: "", company: "" };

const inputs = [
  { name: "name", label: "Name", placeholder: "First name" },
  { name: "lastName", label: "Last name", placeholder: "Last name" },
  { name: "locality", label: "Locality", placeholder: "e.g. Karol Bagh" },
  { name: "company", label: "Company", placeholder: "Company name" },
];

export default function Search() {
  const [form, setForm] = useState(empty);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get("/users/search", { params: form });
      setResults(res.data.users);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const onClear = () => {
    setForm(empty);
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="bg-soft py-10">
      <div className={wrap}>
        <h1 className="mb-6 text-3xl font-bold sm:text-4xl">Search the community</h1>

        <form className={`${card} grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4`} onSubmit={onSubmit}>
          {inputs.map((i) => (
            <div key={i.name}>
              <label className={label}>{i.label}</label>
              <input className={field} name={i.name} value={form[i.name]} onChange={onChange} placeholder={i.placeholder} />
            </div>
          ))}
          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
            <button className={`${btn} mt-4`} disabled={loading}>{loading ? "Searching..." : "Search"}</button>
            <button type="button" className={`${btnOutline} mt-4`} onClick={onClear}>Clear</button>
          </div>
        </form>

        {searched && (
          <>
            <p className="mb-3.5 mt-5 text-muted">
              {results.length} {results.length === 1 ? "person" : "people"} found
            </p>
            {results.length === 0 ? (
              <p className="py-12 text-center text-muted">No one matches your search. Try fewer filters.</p>
            ) : (
              <div className={gridCards}>
                {results.map((p) => (
                  <ProfileCard key={p._id} person={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
