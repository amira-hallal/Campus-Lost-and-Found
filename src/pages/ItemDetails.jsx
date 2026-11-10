import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  Pencil,
  Trash2
} from "lucide-react";

import { useItems } from "../context/ItemsContext";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { items, deleteItem } = useItems();

  const item = items.find((item) => item.id === Number(id));

  if (!item) {
    return (
      <main className="min-h-screen bg-[#F7F5EC] flex flex-col items-center justify-center px-6">
        <Package size={50} className="text-[#718B70] mb-4" />

        <h2 className="text-2xl font-bold text-[#244B3C] mb-3">
          Item Not Found
        </h2>

        <p className="text-[#68796C] mb-6">
          This item may have been deleted or does not exist.
        </p>

        <Link
          to="/items"
          className="bg-[#244B3C] text-white px-6 py-3 rounded-lg"
        >
          Back to Items
        </Link>
      </main>
    );
  }

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (confirmed) {
      deleteItem(item.id);
      navigate("/items");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5EC] px-6 py-12">

      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <Link
          to="/items"
          className="inline-flex items-center gap-2 text-[#52765F] font-semibold mb-8 hover:text-[#244B3C]"
        >
          <ArrowLeft size={20} />
          Back to Items
        </Link>

        {/* Details Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#DCE6D8]">

          {/* Image */}
          <div className="h-72 md:h-96 bg-[#DCE6D8]">

            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
                className="w-full h-full object-cover"
              />
            ) : null}

            <div
              style={{ display: item.image ? "none" : "flex" }}
              className="w-full h-full flex-col items-center justify-center text-[#68796C]"
            >
              <Package size={65} strokeWidth={1.2} />
              <p className="mt-3">No image available</p>
            </div>

          </div>

          {/* Information */}
          <div className="p-6 md:p-10">

            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">

              <div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${
                    item.status === "Lost"
                      ? "bg-[#F8E2DF] text-[#A33F35]"
                      : "bg-[#DCE6D8] text-[#244B3C]"
                  }`}
                >
                  {item.status}
                </span>

                <h1 className="text-3xl md:text-4xl font-bold text-[#244B3C]">
                  {item.name}
                </h1>
              </div>

              <span className="bg-[#F7F5EC] text-[#68796C] px-4 py-2 rounded-full text-sm">
                {item.category}
              </span>

            </div>

            <div className="border-t border-[#E6E5D9] pt-6">

              <h2 className="text-xl font-bold text-[#244B3C] mb-3">
                Description
              </h2>

              <p className="text-[#68796C] leading-relaxed mb-8">
                {item.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="flex items-start gap-3">
                  <MapPin className="text-[#52765F]" size={22} />

                  <div>
                    <p className="font-semibold text-[#244B3C]">
                      Building
                    </p>
                    <p className="text-[#68796C]">
                      {item.building}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="text-[#52765F]" size={22} />

                  <div>
                    <p className="font-semibold text-[#244B3C]">
                      Date
                    </p>
                    <p className="text-[#68796C]">
                      {item.date}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6 border-t border-[#E6E5D9]">

              <Link
                to={`/edit/${item.id}`}
                className="flex-1 bg-[#244B3C] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#315C49] transition"
              >
                <Pencil size={18} />
                Edit Item
              </Link>

              <button
                onClick={handleDelete}
                className="flex-1 bg-[#F8E2DF] text-[#A33F35] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#F2D1CC] transition"
              >
                <Trash2 size={18} />
                Delete Item
              </button>

            </div>

          </div>
        </div>

      </div>
    </main>
  );
}