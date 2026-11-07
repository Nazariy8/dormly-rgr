import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import nazar from "../img/team/nazar.webp";
import olena from "../img/team/olena.webp";
import julia from "../img/team/julia.webp";
import zlata from "../img/team/zlata.webp";
import maks from "../img/team/maks.webp";

const teamMembers = [
  { id: "nazar", img: nazar },
  { id: "olena", img: olena },
  { id: "julia", img: julia },
  { id: "zlata", img: zlata },
  { id: "maks", img: maks },
];

/* ---------- Класи ---------- */
const sectionBadge =
  "mb-4 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan";
const sectionHeading =
  "mb-3 text-[length:clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em] text-white";
const sectionDescription =
  "mx-auto max-w-[520px] text-[15px] leading-[1.6] text-fg-secondary";

// Колонки: 1 / 2 / 3 / 4 в ряд (gap-6 = 24px), останній ряд центрується
const colCls =
  "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)]";

const AboutUs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="px-4 py-12">
      <div className="mx-auto w-full max-w-[1140px]">
        <div className="mb-12 text-center">
          <span className={sectionBadge}>{t("about.badge")}</span>
          <h1 className={sectionHeading}>{t("about.title")}</h1>
          <p className={sectionDescription}>{t("about.subtitle")}</p>
        </div>

        {/* Сітка карток команди */}
        <div className="mb-12 flex flex-wrap justify-center gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className={colCls}>
              <div className="h-full rounded-2xl border border-line bg-card p-6 text-center transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-focus">
                <div className="mb-4">
                  <img
                    src={member.img}
                    alt={t(`about.team.${member.id}.name`)}
                    className="mx-auto h-[90px] w-[90px] rounded-full border-2 border-line object-cover"
                  />
                </div>
                <h4 className="mb-1 text-base font-bold text-white">
                  {t(`about.team.${member.id}.name`)}
                </h4>
                <p className="m-0 text-[13px] text-accent-cyan">
                  {t(`about.team.${member.id}.role`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Заклик до дії */}
        <div
          className={
            "mt-6 rounded-2xl border border-line p-12 text-center " +
            "bg-[image:radial-gradient(circle_at_50%_50%,rgba(105,48,195,0.15)_0%,rgba(18,18,18,1)_100%)]"
          }
        >
          <h3 className="mb-4 text-[length:calc(1.3rem+0.6vw)] font-bold text-white xl:text-[1.75rem]">
            {t("about.cta.title")}
          </h3>
          <button
            className="cursor-pointer rounded-lg border border-white bg-white px-6 py-2 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-px hover:border-[#e5e5e5] hover:bg-[#e5e5e5]"
            onClick={() => navigate("/test")}
          >
            {t("about.cta.button")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
