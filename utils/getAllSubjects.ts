import { Subject } from "@/types";

export default async function getAllSubjects(
  yearId: number
): Promise<Subject[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/years/${yearId}/subjects`
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message);
  return json.data;
}
