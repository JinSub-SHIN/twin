import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ListingDetail, getMockListingDetail } from "./listingDetail";

export function ListingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId = "mock" } = useParams<{ listingId: string }>();
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? "/explore";
  const listing = useMemo(() => getMockListingDetail(listingId), [listingId]);

  return <ListingDetail listing={listing} onBack={() => navigate(returnTo)} />;
}
