import { redirect } from "next/navigation";

/** The portal has no public landing page: send everyone to sign in (signed-in users are forwarded to their area). */
export default function Home() {
  redirect("/login");
}
