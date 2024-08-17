import Link from "next/link";
import Image from "next/image";

import getUser from "@/utils/getUser";
import getPrefix from "@/utils/getPrefix";
import Path from "@/components/Path";
import getModule from "@/utils/getModule";
import getSubjects from "@/utils/getSubjects";

export default async function SubjectsPage({
  params: { moduleId },
}: {
  params: { moduleId: number };
}) {
  const { yearId } = await getUser();
  const myModule = await getModule(yearId, moduleId);
  const subjects = await getSubjects(yearId, moduleId);
  return (
    <>
      <Path>
        {myModule.semesterName}
        <sup>{getPrefix(myModule.semesterName)}</sup> Semester → {myModule.name}
      </Path>
      <main className="main">
        <ul className="card-container">
          {subjects.map(({ id, name, icon }, index) => (
            <li key={index}>
              <Link href={`/subjects/${id}`} className="card">
                <span>
                  <Image src={icon} alt={name} width={48} height={48} />
                </span>
                <h2>{name}</h2>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
