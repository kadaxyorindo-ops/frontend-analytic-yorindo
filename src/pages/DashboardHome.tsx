import { Clock3, Compass, Sparkles, Waypoints } from "lucide-react";

const comingSoonIdeas = [
  {
    title: "Portfolio Health",
    description:
      "Ringkasan performa seluruh event aktif, pending approval, dan tren check-in lintas periode.",
    icon: Compass,
  },
  {
    title: "Audience Momentum",
    description:
      "Distribusi industri, kota, dan conversion rate per event untuk melihat event mana yang paling relevan.",
    icon: Waypoints,
  },
  {
    title: "AI Operations Brief",
    description:
      "Ringkasan otomatis area event yang butuh perhatian, misalnya attendance drop atau respons survey yang melemah.",
    icon: Sparkles,
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8 rounded-[28px] border border-[#D7E1F0] bg-[#F8FAFD] p-8 shadow-[0_14px_30px_rgba(10,38,71,0.05)]">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#94A3B8]">
            Dashboard
          </p>
          <h1 className="text-[2.2rem] font-bold tracking-[-0.04em] text-[#0A2647]">
            Overall Command Center
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[#5B6B7F]">
            Halaman dashboard global sedang kami siapkan. Untuk sekarang, area ini
            dipakai sebagai placeholder arah produk supaya nanti analytics seluruh
            event bisa dirancang lebih matang dan tetap konsisten dengan workflow EMS.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#D7E1F0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7EEFF] text-[#0A2647]">
              <Clock3 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A2647]">Coming Soon</p>
              <p className="text-xs text-[#6F8098]">Masih tahap eksplorasi KPI</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {comingSoonIdeas.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-[24px] border border-[#D7E1F0] bg-white p-6 shadow-[0_12px_32px_rgba(10,38,71,0.06)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF3FF] text-[#0A2647]">
                <Icon size={22} />
              </div>
              <h2 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#0A2647]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5B6B7F]">
                {item.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[24px] border border-dashed border-[#C9D7F3] bg-[linear-gradient(135deg,#FFFFFF_0%,#F1F6FF_100%)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7B8CA3]">
          Rekomendasi Ruang Dashboard
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/80 bg-white/80 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-base font-semibold text-[#0A2647]">
              KPI yang cocok untuk fase awal
            </p>
            <p className="mt-2 text-sm leading-7 text-[#5B6B7F]">
              Total event aktif, total registrasi lintas event, approval rate,
              attendance rate, dan top industry paling sering hadir.
            </p>
          </div>
          <div className="rounded-[20px] border border-white/80 bg-white/80 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-base font-semibold text-[#0A2647]">
              Arah AI summary global
            </p>
            <p className="mt-2 text-sm leading-7 text-[#5B6B7F]">
              AI bisa merangkum event mana yang perform, event mana yang lemah,
              dan rekomendasi follow-up operasional mingguan untuk tim.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
