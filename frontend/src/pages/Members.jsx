import { useEffect, useState } from "react";
import api from "../api";
import ProfileCard from "../components/ProfileCard";
import { btnOutline, card, field, gridCards, label, wrap } from "../ui";

const start = { company: "", locality: "", hasLinkedin: "", sort: "newest" };

export default function Members() {
  const [filters, setFilters] = useState({ companies: [], localities: [], professions: [] });
  const [selected, setSelected] = useState(start);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // dropdown options
  useEffect(() => {
    api.get("/users/filters").then((res) => setFilters(res.data));
  }, []);

  // reload the list whenever a filter changes
  useEffect(() => {
    setLoading(true);
    api
      .get("/users", { params: selected })
      .then((res) => setMembers(res.data.users))
      .finally(() => setLoading(false));
  }, [selected]);

  const onChange = (e) => setSelected({ ...selected, [e.target.name]: e.target.value });

  const selects = [
    { name: "company", label: "Company", all: "All companies", items: filters.companies },
    { name: "locality", label: "Locality", all: "All localities", items: filters.localities },
  ];

  return (
    <div className="bg-soft py-10">
      <div className={wrap}>
        <h1 className="mb-6 text-3xl font-bold sm:text-4xl">All members</h1>

        <div className={`${card} grid items-end gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]`}>
          {selects.map((s) => (
            <div key={s.name}>
              <label className={label}>{s.label}</label>
              <select className={field} name={s.name} value={selected[s.name]} onChange={onChange}>
                <option value="">{s.all}</option>
                {s.items.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className={label}>LinkedIn</label>
            <select className={field} name="hasLinkedin" value={selected.hasLinkedin} onChange={onChange}>
              <option value="">Any</option>
              <option value="1">LinkedIn added</option>
            </select>
          </div>
          <div>
            <label className={label}>Sort by</label>
            <select className={field} name="sort" value={selected.sort} onChange={onChange}>
              <option value="newest">Newest first</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
          <button type="button" className={`${btnOutline} mt-3`} onClick={() => setSelected(start)}>Reset</button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-muted">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="py-12 text-center text-muted">No members match these filters.</p>
        ) : (
          <>
            <p className="mb-3.5 mt-5 text-muted">{members.length} members</p>
            <div className={gridCards}>
              {members.map((m) => <ProfileCard key={m._id} person={m} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
