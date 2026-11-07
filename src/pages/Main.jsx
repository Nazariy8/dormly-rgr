import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HashLink } from "react-router-hash-link";

/* ---------- Повторювані класи ---------- */

const containerBase = "mx-auto flex w-full max-w-[1140px] flex-col";

const sectionBase = "border-t border-line px-4 py-[60px] md:py-[100px]";

// Обгортка колонки: центрує останній ряд (як було в Bootstrap row + justify-content-center)
const colBase =
  "flex w-full flex-col md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]";

const cardBase =
  "group flex h-full grow flex-col rounded-2xl border border-line bg-[#111111] p-6 " +
  "transition duration-200 hover:-translate-y-0.5 hover:border-line-focus hover:bg-[#161616] " +
  "md:min-h-[280px] md:px-8 md:py-10";

const sectionBadge =
  "mb-4 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan";
const sectionHeading =
  "mb-3 text-[length:clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em] text-white";
const sectionDescription =
  "mx-auto max-w-[520px] text-[15px] leading-[1.6] text-fg-secondary";

const btnPrimary =
  "rounded-lg border border-white bg-white px-6 py-2.5 text-sm font-semibold text-black " +
  "transition-all duration-200 hover:-translate-y-px hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";
const btnSecondary =
  "rounded-lg border border-line bg-white/5 px-6 py-2.5 text-sm font-medium text-fg " +
  "transition-all duration-200 hover:-translate-y-px hover:border-line-focus hover:bg-white/10 hover:text-white";

/* ---------- Дані ---------- */

const features = [
  { key: "security", icon: "bi-shield-check" },
  { key: "match", icon: "bi-sliders" },
  { key: "community", icon: "bi-people" },
];

const reviews = ["user1", "user2", "user3"];

const Main = ({ user }) => {
  const { t } = useTranslation();

  return (
    <main>
      {/* ================= HERO ================= */}
      <section
        className={
          "relative bg-page " +
          "bg-[image:radial-gradient(circle_at_50%_20%,rgba(105,48,195,0.12)_0%,rgba(10,10,10,0)_60%)] " +
          "px-4 pb-10 pt-20 text-center text-fg"
        }
      >
        <div className={`${containerBase} min-h-[80vh] items-center`}>
          <span className="mb-6 rounded-full bg-[#ffc107] px-4 py-2 text-base font-bold text-black">
            ! Product is in beta testing. Full version coming soon !
          </span>

          {/* Бейдж */}
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-fg-secondary">
            <span className="h-[7px] w-[7px] rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span>{t("hero.badge", "Dormly 2.0 для студентів")}</span>
          </div>

          {/* Заголовок */}
          <h1 className="mb-4 max-w-[750px] text-[length:clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-white">
            {t("hero.title", "Знайди свого ідеального сусіда по кімнаті")}
          </h1>

          {/* Підзаголовок */}
          <p className="mb-6 max-w-[540px] text-[length:clamp(0.95rem,2vw,1.15rem)] leading-[1.6] text-fg-secondary">
            {t(
              "hero.subtitle",
              "Алгоритм підбору співмешканців за спільними інтересами, звичками та графіком навчання.",
            )}
          </p>

          {/* Кнопки дій */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={user ? "/test" : "/login"} className={btnPrimary}>
              {t("hero.passTest", "Пройти тест")}
            </Link>
            <HashLink to="#advantage-heading" className={btnSecondary}>
              {t("hero.howItWorks", "Як це працює")}
            </HashLink>
          </div>

          {/* Прев'ю-картка */}
          <div
            className={
              "mt-12 w-full max-w-[650px] rounded-2xl border border-[#333333] " +
              "bg-[image:linear-gradient(180deg,rgba(25,25,25,0.8)_0%,rgba(15,15,15,0.95)_100%)] " +
              "px-6 py-[18px] text-left shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]"
            }
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#ef4444]" />
                <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#eab308]" />
                <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#22c55e]" />
                <span className="ml-2 text-xs text-fg-secondary">
                  {t("hero.preview.matchFound")}
                </span>
              </div>
              <span className="rounded-full border border-accent-mint/20 bg-accent-mint/10 px-2.5 py-[3px] text-center text-[11px] font-semibold text-accent-mint">
                {t("hero.preview.perfectMatch")}
              </span>
            </div>

            <div className="mt-4 flex flex-col items-center gap-6 max-[467px]:text-center md:flex-row">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-line-focus bg-line font-bold text-white">
                {t("hero.preview.avatar")}
              </div>
              <div className="grow">
                <h4 className="m-0 text-2xl font-bold text-white">
                  {t("hero.preview.name")}
                </h4>
                <p className="m-0 text-sm text-fg-secondary">
                  {t("hero.preview.meta")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 max-[467px]:justify-center">
                  {["tagGames", "tagDev", "tagQuiet"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[#333] bg-[#1f1f1f] px-2.5 py-[3px] text-xs text-[#d1d5db]"
                    >
                      {t(`hero.preview.${tag}`)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ПЕРЕВАГИ ================= */}
      <section className={sectionBase} id="advantage-heading">
        <div className={`${containerBase} min-h-[80vh] justify-center`}>
          <div className="mb-12 text-center">
            <span className={sectionBadge}>{t("advantages.badge")}</span>
            <h2 className={sectionHeading}>{t("advantages.title")}</h2>
            <p className={sectionDescription}>{t("advantages.subtitle")}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {features.map(({ key, icon }) => (
              <div key={key} className={colBase}>
                <div className={cardBase}>
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[10px] border border-line bg-white/[0.03] text-xl text-accent-cyan transition duration-200 group-hover:border-accent-purple group-hover:text-white">
                    <i className={`bi ${icon}`} />
                  </div>
                  <h3 className="mb-2.5 text-lg font-bold tracking-[-0.01em] text-white md:mb-3 md:text-xl">
                    {t(`advantages.cards.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-[1.6] text-fg-secondary md:text-[15px] md:leading-[1.7]">
                    {t(`advantages.cards.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ВІДГУКИ ================= */}
      <section className={sectionBase} id="feedbacks-heading">
        <div className={`${containerBase} min-h-[80vh] justify-center`}>
          <div className="mb-12 text-center">
            <span className={sectionBadge}>{t("feedbacks.badge")}</span>
            <h2 className={sectionHeading}>{t("feedbacks.title")}</h2>
            <p className={sectionDescription}>{t("feedbacks.subtitle")}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {reviews.map((id) => (
              <div key={id} className={colBase}>
                <div className={cardBase}>
                  <p className="mb-6 grow text-sm leading-[1.6] text-fg-secondary md:text-[15px] md:leading-[1.7]">
                    {t(`feedbacks.reviews.${id}.quote`)}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-input text-[13px] font-semibold tracking-[0.05em] text-fg">
                      {t(`feedbacks.reviews.${id}.avatar`)}
                    </div>
                    <div>
                      <h4 className="m-0 text-[15px] font-semibold text-white">
                        {t(`feedbacks.reviews.${id}.name`)}
                      </h4>
                      <span className="block text-[12.5px] text-fg-muted">
                        {t(`feedbacks.reviews.${id}.role`)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
