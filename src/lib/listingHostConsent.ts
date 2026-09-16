export type ListingHostConsentKey =
  | "resident"
  | "platform"
  | "nofee"
  | "truth";

export type ListingHostConsentSegment = {
  text: string;
  emphasis?: boolean;
};

export type ListingHostConsentItem = {
  key: ListingHostConsentKey;
  title: string;
  segments: ListingHostConsentSegment[];
};

export const LISTING_HOST_CONSENT_ITEMS: ListingHostConsentItem[] = [
  {
    key: "resident",
    title: "거주 자격 확인",
    segments: [
      { text: "저는 해당 주택에 " },
      {
        text: "현재 거주하고 있는 임차인(또는 적법한 거주자)",
        emphasis: true,
      },
      { text: "임을 확인합니다." },
    ],
  },
  {
    key: "platform",
    title: "플랫폼 역할 확인",
    segments: [
      { text: "살짝은 주택을 " },
      { text: "임대하거나 전대하는 당사자가 아니며", emphasis: true },
      { text: ", " },
      { text: "동거인을 연결하는 플랫폼", emphasis: true },
      { text: "이라는 것을 이해했습니다." },
    ],
  },
  {
    key: "nofee",
    title: "수수료 없음 · 사칭 주의",
    segments: [
      { text: "살짝은 " },
      { text: "공고 등록 및 매칭 완료 시에도 별도의 수수료는 일체 요구하지 않", emphasis: true },
      { text: "습니다. " },
      { text: "플랫폼을 사칭하거나 수수료·알선", emphasis: true },
      { text: " 등의 명목으로 금전을 요구하는 행위는 " },
      { text: "사기", emphasis: true },
      { text: "임을 확인했습니다." },
    ],
  },
  {
    key: "truth",
    title: "정보의 정확성 확인",
    segments: [
      { text: "공고에 입력하는 정보는 " },
      { text: "사실과 다르지 않으며", emphasis: true },
      { text: ", " },
      { text: "허위 정보로 인해 발생하는 문제에 대한 책임", emphasis: true },
      { text: "은 공고 등록자에게 있음을 확인했습니다." },
    ],
  },
];
