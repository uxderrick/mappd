import { redirect } from "next/navigation";

export async function POST() {
  // In a real app, you would validate credentials here
  redirect("/");
}
