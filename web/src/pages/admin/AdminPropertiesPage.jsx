import React, { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminPropertiesPage = () => {
  const { authFetch } = useAdminAuth();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/admin/properties")
      .then((result) => setProperties(result.properties))
      .catch((loadError) => setError(loadError.message));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7">
        <p className="text-sm uppercase tracking-[0.18em] text-[#f97316]">Properties</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#182230]">
          Inventory and stay structure
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085]">
          A quick view of the properties currently powering the homestay, roomstay, and whole-house flows.
        </p>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-2">
        {properties.map((property) => (
          <article
            key={property.id}
            className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)]"
          >
            {property.imageUrl ? (
              <div
                className="h-52 bg-cover bg-center"
                style={{ backgroundImage: `url(${property.imageUrl})` }}
              />
            ) : null}
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[#f97316]">
                    {property.type.replace("_", " ")}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#182230]">
                    {property.name}
                  </h2>
                </div>
                <span className="rounded-full bg-[#fff1e5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">
                  {property.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#667085]">{property.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#344054] sm:grid-cols-4">
                <div className="rounded-[20px] bg-[#fff8f1] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Bedrooms</p>
                  <p className="mt-2 font-semibold">{property.bedrooms}</p>
                </div>
                <div className="rounded-[20px] bg-[#fff8f1] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Bathrooms</p>
                  <p className="mt-2 font-semibold">{property.bathrooms}</p>
                </div>
                <div className="rounded-[20px] bg-[#fff8f1] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Guests</p>
                  <p className="mt-2 font-semibold">{property.maxGuests}</p>
                </div>
                <div className="rounded-[20px] bg-[#fff8f1] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">Price</p>
                  <p className="mt-2 font-semibold">RM {Number(property.pricePerNight)}</p>
                </div>
              </div>

              {property.rooms?.length ? (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-[#182230]">Rooms</p>
                  <div className="mt-3 space-y-3">
                    {property.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="rounded-[22px] border border-[#ffe1ca] bg-[#fffdfb] px-4 py-4 text-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-[#182230]">{room.name}</p>
                          <p className="text-[#f97316]">RM {Number(room.pricePerNight)}</p>
                        </div>
                        <p className="mt-2 text-[#667085]">
                          {room.maxGuests} guests • {room.bedrooms} bedroom • {room.bathrooms} bathroom
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default AdminPropertiesPage;
