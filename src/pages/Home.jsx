import { Link } from "react-router-dom";
import {
  Search,
  Package,
  CheckCircle,
  ArrowRight,
  Leaf,
  MapPin
} from "lucide-react";

import items from "../data/items";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const recentItems = [...items]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const lostCount = items.filter(
    (item) => item.status === "Lost"
  ).length;

  const foundCount = items.filter(
    (item) => item.status === "Found"
  ).length;

  return (
    <main className="bg-[#F7F5EC] min-h-screen text-[#343A35]">

      {/* HERO SECTION */}
      <section className="bg-[#244B3C] text-[#F7F5EC]">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 bg-[#DCE6D8] text-[#244B3C] px-4 py-2 rounded-full text-sm font-semibold mb-8">
              <Leaf size={16} />
              M.A.R.S Campus Community
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Lost Something?
              <br />
              <span className="text-[#C5D6BD]">
                Let's Bring It Back.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#E1E8DE] leading-relaxed mb-10 max-w-2xl">
              M.A.R.S makes it easier for students to report
              lost belongings, share found items, and reconnect
              people with the things they value.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">

              <Link
                to="/items"
                className="bg-[#DCE6D8] text-[#244B3C] px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-white transition"
              >
                <Search size={20} />
                Explore Item List
              </Link>

              <Link
                to="/report"
                className="border border-[#DCE6D8] text-[#F7F5EC] px-8 py-4 rounded-lg font-bold text-center hover:bg-[#315C49] transition"
              >
                + Report an Item
              </Link>

            </div>

          </div>
        </div>
      </section>


      {/* STATISTICS */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#E6E5D9] flex items-center gap-5">
            <div className="bg-[#DCE6D8] text-[#244B3C] p-4 rounded-xl">
              <Package size={28} />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-[#244B3C]">
                {items.length}
              </h2>
              <p className="text-[#747A70]">Total Reports</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#E6E5D9] flex items-center gap-5">
            <div className="bg-[#F3E3D8] text-[#A65E43] p-4 rounded-xl">
              <Search size={28} />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-[#244B3C]">
                {lostCount}
              </h2>
              <p className="text-[#747A70]">Lost Items</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#E6E5D9] flex items-center gap-5">
            <div className="bg-[#DCE6D8] text-[#47745A] p-4 rounded-xl">
              <CheckCircle size={28} />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-[#244B3C]">
                {foundCount}
              </h2>
              <p className="text-[#747A70]">Found Items</p>
            </div>
          </div>

        </div>
      </section>


      {/* RECENT REPORTS */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10">

          <div>
            <p className="text-[#718B70] font-semibold uppercase tracking-widest text-sm mb-3">
              Stay Connected
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-[#244B3C]">
              Recent Reports
            </h2>

            <p className="text-[#747A70] mt-3">
              Discover the latest lost and found items on campus.
            </p>
          </div>

          <Link
            to="/items"
            className="text-[#244B3C] font-bold flex items-center gap-2 hover:gap-3 transition-all"
          >
            View All Items
            <ArrowRight size={18} />
          </Link>

        </div>

        {recentItems.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}

          </div>

        ) : (

          <div className="bg-white rounded-2xl p-12 text-center border border-[#E6E5D9]">
            <Package size={40} className="mx-auto text-[#718B70] mb-4" />

            <h3 className="text-xl font-bold text-[#244B3C] mb-2">
              No Reports Yet
            </h3>

            <p className="text-[#747A70]">
              New lost and found reports will appear here.
            </p>
          </div>

        )}

      </section>


      {/* CALL TO ACTION */}
      <section className="bg-[#DCE6D8] py-20 px-6">

        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center justify-center bg-[#244B3C] text-white p-4 rounded-full mb-6">
            <MapPin size={28} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#244B3C] mb-5">
            Found Something on Campus?
          </h2>

          <p className="text-[#526456] text-lg mb-8 max-w-2xl mx-auto">
            A small action can make someone's day.
            Report a found item and help it reach its owner.
          </p>

          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-[#244B3C] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#315C49] transition"
          >
            Report a Found Item
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </main>
  );
}