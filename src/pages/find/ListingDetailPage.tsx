import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { roomToRoommateListing } from "@/features/roommate/fromRoom";
import { useRoommate } from "@/features/roommate/store";
import { toListingDetail } from "@/features/roommate/toDetail";
import type { RoommateListing } from "@/features/roommate/types";
import { loadAccessToken } from "@/lib/authStorage";
import { inquireErrorMessage, inquireRoom, getRoom } from "@/service/room";
import { ApiError } from "@/service/http";
import { ListingDetail } from "./listingDetail";
import styles from "./listingDetail/ListingDetail.module.css";

export function ListingDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId = "" } = useParams<{ listingId: string }>();
  const returnTo =
    (location.state as { returnTo?: string } | null)?.returnTo ?? "/explore";
  const { listings, openInquiry, recordView, rememberListing } = useRoommate();
  const stored = listings.find((item) => item.id === listingId);
  const [remote, setRemote] = useState<RoommateListing | null>(null);
  const [failedId, setFailedId] = useState("");
  const [inquireError, setInquireError] = useState("");
  const error = failedId === listingId ? "공고를 불러오지 못했어요." : "";
  const viewed = useRef("");
  const source = stored ?? (remote?.id === listingId ? remote : null);
  const listing = useMemo(
    () => (source ? toListingDetail(source) : null),
    [source],
  );

  useEffect(() => {
    if (stored || !listingId) return;
    let active = true;
    getRoom(listingId)
      .then((room) => {
        if (active) setRemote(roomToRoommateListing(room));
      })
      .catch(() => {
        if (active) setFailedId(listingId);
      });
    return () => {
      active = false;
    };
  }, [listingId, stored]);

  useEffect(() => {
    if (!stored || viewed.current === stored.id) return;
    viewed.current = stored.id;
    recordView(stored.id);
  }, [stored, recordView]);

  useEffect(() => {
    if (!inquireError) return;
    const timer = window.setTimeout(() => setInquireError(""), 2800);
    return () => window.clearTimeout(timer);
  }, [inquireError]);

  const handleInquire = async () => {
    if (!source) return;
    setInquireError("");
    if (!loadAccessToken()) {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }
    try {
      const { chat_room_id } = await inquireRoom(listingId);
      rememberListing(source);
      const threadId = openInquiry(source.id, chat_room_id);
      navigate(`/roommate/chat/${threadId}`);
    } catch (err) {
      const message = inquireErrorMessage(err);
      setInquireError(message);
      if (
        err instanceof ApiError &&
        (err.status === 401 ||
          (err.body &&
            typeof err.body === "object" &&
            ((err.body as { code?: string }).code === "MISSING_TOKEN" ||
              (err.body as { code?: string }).code === "INVALID_TOKEN")))
      ) {
        navigate("/login", {
          state: { from: `${location.pathname}${location.search}` },
        });
      }
    }
  };

  if (!listing) {
    return (
      <section className={styles.pending}>
        <p>{error || "공고를 불러오고 있어요"}</p>
        {error ? (
          <button type="button" onClick={() => navigate(returnTo)}>
            찾기로 돌아가기
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <>
      <ListingDetail
        listing={listing}
        onBack={() => navigate(returnTo)}
        onInquire={handleInquire}
      />
      {inquireError ? (
        <p className={styles.toast} role="status">
          {inquireError}
        </p>
      ) : null}
    </>
  );
}
