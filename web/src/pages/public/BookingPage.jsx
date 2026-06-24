import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    navigate(`/availability${location.search}`, { replace: true });
  }, [location.search, navigate]);

  return null;
}
