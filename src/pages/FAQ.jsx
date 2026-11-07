import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ---------- Класи (перенесено з faq.scss) ---------- */
const sectionBadge =
  "mb-4 inline-block text-xs font-semibold uppercase tracking-[0.08em] text-accent-cyan";
const sectionHeading =
  "mb-3 text-[length:clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.03em] text-white";
const sectionDescription =
  "mx-auto max-w-[520px] text-[15px] leading-[1.6] text-fg-secondary";

const quickLinkBtn =
  "mb-2.5 w-full cursor-pointer rounded-xl border border-line bg-card px-[18px] py-3.5 text-left text-[14.5px] " +
  "font-medium text-fg transition-all duration-200 hover:border-line-focus hover:bg-[#181818]";

const FAQ = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  // Акордеон: відкрите питання (за замовчуванням перше), одночасно лише одне
  const [openIndex, setOpenIndex] = useState(0);

  // Міні-віджет погоди у Львові для закриття вимоги «Інформер»
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=49.8383&longitude=24.0232&current_weather=true",
    )
      .then((res) => res.json())
      .then((data) => setWeather(data.current_weather))
      .catch(() => null);
  }, []);

  const faqItems = t("faq.items", { returnObjects: true }) || [];

  const filteredItems = Array.isArray(faqItems)
    ? faqItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  return (
    <main className="bg-page px-4 py-12 text-fg">
      <div className="mx-auto w-full max-w-[1140px]">
        <header className="mb-12 text-center">
          <span className={sectionBadge}>{t("faq.badge", "Допомога")}</span>
          <h1 className={sectionHeading}>
            {t("faq.title", "Чим ми можемо вам допомогти?")}
          </h1>
          <p className={sectionDescription}>
            {t("faq.subtitle", "Знаходьте відповіді на свої запитання нижче.")}
          </p>

          {weather && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-1 text-[13px]">
              <span>📍 {t("rgr.weatherCity")}:</span>
              <span className="font-bold text-white">
                {weather.temperature}°C
              </span>
              <span className="text-[#6c757d]">
                | {t("rgr.weatherWind")}: {weather.windspeed}{" "}
                {t("rgr.weatherSpeedUnit")}
              </span>
            </div>
          )}

          <div className="relative mx-auto mt-6 max-w-[550px]">
            <i className="bi bi-search absolute left-[18px] top-1/2 -translate-y-1/2 text-fg-secondary"></i>
            <input
              type="text"
              className="h-12 w-full rounded-xl border border-line bg-card pl-12 pr-5 text-white outline-none transition-colors duration-200 focus:border-line-focus"
              placeholder={t("faq.searchPlaceholder", "Пошук запитання...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="mt-2 flex flex-wrap justify-center gap-6">
          <aside className="w-full lg:w-[calc(33.333%-16px)]">
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  className={quickLinkBtn}
                  onClick={() =>
                    user ? navigate("/profile") : navigate("/regist")
                  }
                >
                  <i className="bi bi-person mr-2"></i>{" "}
                  {t("faq.sidebar.profileLink", "Профіль")}
                </button>
                <button
                  type="button"
                  className={quickLinkBtn}
                  onClick={() => navigate("/test")}
                >
                  <i className="bi bi-person-check-fill mr-2"></i>{" "}
                  {t("faq.sidebar.testLink", "Тест")}
                </button>
              </div>

              <div className="mb-6 rounded-2xl border border-line bg-card p-4">
                <div className="mb-2 text-sm font-bold text-[#6c757d]">
                  <i className="bi bi-youtube mr-2 text-[#dc3545]"></i>
                  {t("rgr.videoTitle")}
                </div>
                <div className="aspect-video overflow-hidden rounded-lg border border-line">
                  <iframe
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Dormly Demo"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent-cyan/10 text-accent-cyan">
                  <i className="bi bi-patch-question text-[1.5rem]"></i>
                </div>
                <h2 className="mb-2 text-[17px] font-bold text-white">
                  {t("faq.sidebar.supportTitle", "Підтримка")}
                </h2>
                <p className="mb-4 text-[13.5px] leading-normal text-fg-secondary">
                  {t(
                    "faq.sidebar.supportText",
                    "Зв'яжіться з нами за потреби.",
                  )}
                </p>
                <a
                  href="mailto:support@dormly.app"
                  className="block w-full rounded-lg border border-transparent bg-white p-[9px] text-center text-sm font-semibold text-black transition-all duration-200 hover:bg-[#e5e5e5]"
                >
                  {t("faq.sidebar.contactBtn", "Написати нам")}
                </a>
              </div>
            </div>
          </aside>

          <section className="w-full lg:w-[calc(66.667%-8px)]">
            <div className="mb-12">
              {filteredItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={item.id || index}
                    className="mb-3 overflow-hidden rounded-xl border border-line bg-card"
                  >
                    <h2 className="m-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`faq-${index}`}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="flex w-full cursor-pointer items-center bg-card px-5 py-[18px] text-left text-[15.5px] font-semibold text-white"
                      >
                        {item.question}
                        <i
                          className={
                            "bi bi-chevron-down ml-auto pl-3 text-sm transition-transform duration-200 " +
                            (isOpen ? "rotate-180" : "")
                          }
                        ></i>
                      </button>
                    </h2>
                    <div
                      id={`faq-${index}`}
                      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-[18px] text-[14.5px] leading-[1.6] text-fg-secondary">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-line bg-card p-6">
              <h3 className="mb-2 text-xl font-bold text-white">
                <i className="bi bi-geo-alt mr-2 text-[#0d6efd]"></i>
                {t("rgr.mapTitle")}
              </h3>
              <p className="mb-4 text-sm text-[#6c757d]">{t("rgr.mapDesc")}</p>
              <div className="h-[300px] overflow-hidden rounded-lg border border-line">
                <iframe
                  title="Lviv Polytechnic Campus"
                  width="100%"
                  height="100%"
                  className="border-0 [filter:invert(90%)_hue-rotate(180deg)]"
                  loading="lazy"
                  src="https://maps.google.com/maps?q=Lviv%20Polytechnic%20National%20University&t=&z=14&ie=UTF8&iwloc=&output=embed"
                ></iframe>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default FAQ;
