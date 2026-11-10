import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { useItems } from "../context/ItemsContext";
import ItemCard from "../components/ItemCard";

export default function LostItems() {
  const { items } = useItems();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [building, setBuilding] = useState("All");
  const [sort, setSort] = useState("Newest");

  // FILTER ITEMS
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      status === "All" || item.status === status;

    const matchesCategory =
      category === "All" || item.category === category;

    const matchesBuilding =
      building === "All" || item.building === building;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesBuilding
    );
  });

  // SORT ITEMS
  const sortedItems = [...filteredItems].sort((a, b) => {
    return sort === "Newest"
      ? new Date(b.date) - new Date(a.date)
      : new Date(a.date) - new Date(b.date);
  });

  // CLEAR FILTERS
  function clearFilters() {
    setSearch("");
    setStatus("All");
    setCategory("All");
    setBuilding("All");
    setSort("Newest");
  }

  // INPUT STYLE
  const selectStyle =
    "w-full border border-[#DCE6D8] rounded-lg p-3 bg-[#F7F5EC] text-[#343A35] outline-none focus:ring-2 focus:ring-[#244B3C] focus:border-[#244B3C] transition";

  return (
    <main className="min-h-screen bg-[#F7F5EC] text-[#343A35]">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* HEADER */}
        <div className="mb-10">
          <span className="inline-block bg-[#DCE6D8] text-[#244B3C] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            M.A.R.S Campus Community
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-[#244B3C] mb-3">
            Item List
          </h1>

          <p className="text-[#68796C] text-lg">
            Search and explore lost and found belongings across campus.
          </p>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#DCE6D8] mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68796C]"
              size={21}
            />

            <input
              type="text"
              placeholder="Search by item name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#DCE6D8] rounded-lg py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#244B3C] text-[#343A35] placeholder:text-[#9AA69A]"
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#DCE6D8] mb-10">

          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="text-[#244B3C]" size={21} />

            <h2 className="font-bold text-[#244B3C] text-lg">
              Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* STATUS */}
            <div>
              <label className="block font-semibold text-[#343A35] mb-2">
                Item Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectStyle}
              >
                <option value="All">All Statuses</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block font-semibold text-[#343A35] mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectStyle}
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Bags">Bags</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* BUILDING */}
            <div>
              <label className="block font-semibold text-[#343A35] mb-2">
                Building
              </label>

              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className={selectStyle}
              >
                <option value="All">All Buildings</option>
                <option value="Adnan Kassar School of Business">Adnan Kassar School of Business</option>
                <option value="Gezairi Building">Gezairi Building</option>
                <option value="Irwin Hall">Irwin Hall</option>
                <option value="Nicol Hall">Nicol Hall</option>
                <option value="Orme-Gray">Orme-Gray</option>
                <option value="Riyad Nassar Library">Riyad Nassar Library</option>
                <option value="Safadi Fine Arts">Safadi Fine Arts</option>
                <option value="Sage Hall">Sage Hall</option>
                <option value="Wadad Sabbagh Khoury Student Center">Wadad Sabbagh Khoury Student Center</option>
                <option value="Joseph G. Jabbra Gymnasium">Joseph G. Jabbra Gymnasium</option>
                <option value="Beirut Underground Parking">Beirut Underground Parking</option>
              </select>
            </div>

            {/* DATE SORTING */}
            <div>
              <label className="block font-semibold text-[#343A35] mb-2">
                Sort by Date
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className={selectStyle}
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
              </select>
            </div>

          </div>

          {/* RESULTS */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-7 pt-5 border-t border-[#DCE6D8]">

            <p className="text-[#68796C]">
              <span className="font-bold text-[#244B3C]">
                {sortedItems.length}
              </span>{" "}
              items found
            </p>

            <button
              onClick={clearFilters}
              className="text-[#244B3C] font-semibold hover:text-[#52765F] hover:underline transition"
            >
              Clear All Filters
            </button>

          </div>
        </div>

        {/* ITEMS */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {sortedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-16 text-center border border-[#DCE6D8]">
            <Search
              size={45}
              className="mx-auto text-[#9AAE9A] mb-4"
            />

            <h2 className="text-2xl font-bold text-[#244B3C] mb-2">
              No Items Found
            </h2>

            <p className="text-[#68796C] mb-6">
              We couldn't find any items matching your search.
            </p>

            <button
              onClick={clearFilters}
              className="bg-[#244B3C] text-white px-6 py-3 rounded-lg hover:bg-[#315C49] transition"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </main>
  );
}