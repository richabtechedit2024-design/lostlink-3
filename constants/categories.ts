export const CATEGORIES = [
  "Electronics",
  "ID Cards / Documents",
  "Bags",
  "Books & Stationery",
  "Keys",
  "Clothing",
  "Water Bottles",
  "Accessories",
  "Other",
];

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "resolved";

export interface LostFoundItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  photoUrl?: string;
  location: string;
  postedBy: string;
  postedByName: string;
  status: ItemStatus;
  createdAt: number;
}
