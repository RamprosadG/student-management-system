import { HomeHeader } from "@/components/features/home/HomeHeader";
import { PortalSection } from "@/components/features/home/PortalSection";
import { staffLinks, studentLinks } from "@/components/features/home/portalLinks";

export default function Home() {
  return (
    <main className="flex w-full flex-col gap-6 pb-8">
      <HomeHeader />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <PortalSection
          title="Staff Operations"
          subtitle="Registry administration and academic management"
          badge="Staff Portal"
          portal="staff"
          links={staffLinks}
        />

        <PortalSection
          title="Student Portal"
          subtitle="Academic information and student self-service"
          badge="Student Access"
          portal="student"
          links={studentLinks}
        />
      </div>
    </main>
  );
}
