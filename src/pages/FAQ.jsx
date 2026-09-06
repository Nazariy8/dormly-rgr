import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import "../css/faq.scss";

const FAQ = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

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
    <>
      <main className="faq-page py-5">
        <div className="container">
          <header className="text-center mb-5">
            <span className="section-badge mb-3">
              {t("faq.badge", "Допомога")}
            </span>
            <h1 className="section-heading">
              {t("faq.title", "Чим ми можемо вам допомогти?")}
            </h1>
            <p className="section-description">
              {t(
                "faq.subtitle",
                "Знаходьте відповіді на свої запитання нижче.",
              )}
            </p>

            {/* Віджет погоди (Інформер згідно методички) */}
            {weather && (
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 mt-3 rounded-pill"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #262626",
                  fontSize: "13px",
                }}
              >
                <span>📍 Львів:</span>
                <span className="text-white fw-bold">
                  {weather.temperature}°C
                </span>
                <span className="text-secondary">
                  | Вітер: {weather.windspeed} км/год
                </span>
              </div>
            )}

            <div className="faq-search-wrapper mt-4 mx-auto">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="faq-search-input"
                placeholder={t("faq.searchPlaceholder", "Пошук запитання...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <div className="row g-4 justify-content-center mt-2">
            <aside className="col-12 col-lg-4">
              <div className="faq-sidebar">
                <div className="quick-links mb-4">
                  <button
                    type="button"
                    className="quick-link-btn"
                    onClick={() =>
                      user ? navigate("/profile") : navigate("/regist")
                    }
                  >
                    <i className="bi bi-person me-2"></i>{" "}
                    {t("faq.sidebar.profileLink", "Профіль")}
                  </button>
                  <button
                    type="button"
                    className="quick-link-btn"
                    onClick={() => navigate("/test")}
                  >
                    <i className="bi bi-person-check-fill me-2"></i>{" "}
                    {t("faq.sidebar.testLink", "Тест")}
                  </button>
                </div>

                {/* Вбудоване YouTube відео (згідно методички) */}
                <div
                  className="p-3 rounded-4 mb-4"
                  style={{ background: "#121212", border: "1px solid #262626" }}
                >
                  <div className="small text-secondary fw-bold mb-2">
                    <i className="bi bi-youtube text-danger me-2"></i>Як
                    користуватися Dormly
                  </div>
                  <div
                    className="ratio ratio-16x9 rounded-3 overflow-hidden"
                    style={{ border: "1px solid #262626" }}
                  >
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Dormly Demo"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                <div className="support-card text-center p-4">
                  <div className="support-icon-wrapper mb-3">
                    <i className="bi bi-patch-question fs-4"></i>
                  </div>
                  <h2 className="support-title h5 mb-2">
                    {t("faq.sidebar.supportTitle", "Підтримка")}
                  </h2>
                  <p className="support-text mb-3">
                    {t(
                      "faq.sidebar.supportText",
                      "Зв'яжіться з нами за потреби.",
                    )}
                  </p>
                  <a
                    href="mailto:support@dormly.app"
                    className="btn btn-support w-100"
                  >
                    {t("faq.sidebar.contactBtn", "Написати нам")}
                  </a>
                </div>
              </div>
            </aside>

            <section className="col-12 col-lg-8">
              <div
                className="accordion custom-faq-accordion mb-5"
                id="faqAccordion"
              >
                {filteredItems.map((item, index) => (
                  <div className="accordion-item" key={item.id || index}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${index !== 0 ? "collapsed" : ""}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faq-${index}`}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id={`faq-${index}`}
                      className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">{item.answer}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Інтерактивна карта кампусу (згідно методички) */}
              <div
                className="p-4 rounded-4"
                style={{ background: "#121212", border: "1px solid #262626" }}
              >
                <h3 className="h5 fw-bold text-white mb-2">
                  <i className="bi bi-geo-alt me-2 text-primary"></i>Студентське
                  містечко та локації
                </h3>
                <p className="text-secondary small mb-3">
                  Карта розташування гуртожитків Національного університету
                  «Львівська політехніка».
                </p>
                <div
                  className="rounded-3 overflow-hidden"
                  style={{ height: "300px", border: "1px solid #262626" }}
                >
                  <iframe
                    title="Lviv Polytechnic Campus"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: "invert(90%) hue-rotate(180deg)",
                    }}
                    loading="lazy"
                    src="https://maps.google.com/maps?q=Lviv%20Polytechnic%20National%20University&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  ></iframe>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default FAQ;
