import React from "react";
import { Navigate, Route } from "react-router-dom";
import Layout from "@/layout/Layout";
import AvailabilityPage from "@/pages/public/AvailabilityPage";
import BookingPage from "@/pages/public/BookingPage";
import BookingSuccessPage from "@/pages/public/BookingSuccessPage";
import ContactPage from "@/pages/public/ContactPage";
import FacilitiesPage from "@/pages/public/FacilitiesPage";
import GalleryPage from "@/pages/public/GalleryPage";
import HomePage from "@/pages/public/HomePage";
import HomestayPage from "@/pages/public/HomestayPage";
import HowItWorksPage from "@/pages/public/HowItWorksPage";
import ReviewsPage from "@/pages/public/ReviewsPage";
import RoomstayPage from "@/pages/public/RoomstayPage";
import StaysPage from "@/pages/public/StaysPage";
import WholeHousePage from "@/pages/public/WholeHousePage";

const publicRouteElements = (
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="stays" element={<StaysPage />} />
    <Route path="homestay" element={<HomestayPage />} />
    <Route path="roomstay" element={<RoomstayPage />} />
    <Route path="whole-house" element={<WholeHousePage />} />
    <Route path="facilities" element={<FacilitiesPage />} />
    <Route path="gallery" element={<GalleryPage />} />
    <Route path="how-it-works" element={<HowItWorksPage />} />
    <Route path="reviews" element={<ReviewsPage />} />
    <Route path="contact" element={<ContactPage />} />
    <Route path="availability" element={<AvailabilityPage />} />
    <Route path="booking" element={<BookingPage />} />
    <Route path="booking/success" element={<BookingSuccessPage />} />
    <Route path="*" element={<Navigate replace to="/" />} />
  </Route>
);

export default publicRouteElements;
