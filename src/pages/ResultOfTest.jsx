import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Схема питань за замовчуванням на випадок прямого рендеру
const defaultSchema = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
  { id: 8 },
  { id: 9 },
  { id: 10 },
  { id: 11 },
  { id: 12 },
  { id: 13 },
  { id: 14 },
  { id: 15 },
];

/* ---------- Класи (перенесено з test.scss) ---------- */
const pageCls =
  "min-h-screen w-full bg-page px-4 pb-20 pt-12 " +
  "bg-[image:radial-gradient(circle_at_50%_10%,rgba(105,48,195,0.1)_0%,rgba(10,10,10,1)_70%)]";
const btnPrimaryCls =
  "cursor-pointer rounded-lg border border-white bg-white px-6 py-2.5 text-[13.5px] font-semibold text-black " +
  "transition-all duration-200 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";
const btnRetestCls =
  "cursor-pointer rounded-lg border border-line bg-transparent px-5 py-2.5 text-[13.5px] font-medium " +
  "text-fg-secondary transition-all duration-150 hover:border-line-focus hover:bg-[#181818] hover:text-white";

const ResultOfTest = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Підтримуємо як новий формат (userAnswerIds, testSchema), так і старий (userAnswers, questions)
  const { userAnswerIds, userAnswers, testSchema, questions } =
    location.state || {};

  const answers = userAnswerIds || userAnswers;
  const items = testSchema || questions || (answers ? defaultSchema : null);

  const handleSubmitForSearch = () => {
    navigate("/profile", {
      state: {
        userAnswerIds: answers,
      },
    });
  };

  if (!answers) {
    return (
      <main className={`${pageCls} flex items-center justify-center`}>
        <section className="mx-auto mt-20 w-full max-w-[440px] rounded-2xl border border-line bg-card px-6 py-12 text-center">
          <i className="bi bi-clipboard-x text-[36px] text-fg-muted"></i>
          <h2 className="mb-2 text-xl font-bold text-white">
            {t("test.noResultsTitle", "Результатів немає")}
          </h2>
          <p className="mb-6 text-sm text-fg-secondary">
            {t(
              "test.noResultsSubtitle",
              "Будь ласка, пройдіть тест для отримання рекомендацій.",
            )}
          </p>
          <button className={btnPrimaryCls} onClick={() => navigate("/test")}>
            {t("test.passTestBtn", "Пройти тест")}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={pageCls}>
      <div className="mx-auto max-w-[760px]">
        <header className="mb-9 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent-mint/20 bg-accent-mint/[0.08] px-3.5 py-1 text-[12.5px] font-semibold text-accent-mint">
            <i className="bi bi-check2-circle"></i>{" "}
            {t("test.completedBadge", "Тест завершено")}
          </div>
          <h1 className="mb-2 text-[length:clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.03em] text-white">
            {t("test.resultsTitle", "Ваші звички та вподобання")}
          </h1>
          <p className="text-sm text-fg-secondary">
            {t(
              "test.resultsSubtitle",
              "Ось сформовані параметри, які допоможуть знайти найбільш сумісного сусіда",
            )}
          </p>
        </header>

        <section
          className="mb-8 flex flex-col gap-3"
          aria-label="Список відповідей"
        >
          {items.map((q) => {
            const rawAnswer = answers[q.id];
            // Якщо значення — це ключ варіанту ("1.1", "4.2"), витягуємо переклад
            const isKeyFormat =
              typeof rawAnswer === "string" && rawAnswer.includes(".");
            const displayedText = isKeyFormat
              ? t(`test.questions.${q.id}.options.${rawAnswer}`, {
                  defaultValue: rawAnswer,
                })
              : rawAnswer || q.questionText;

            return (
              <article
                key={q.id}
                className="rounded-xl border border-line bg-card px-[22px] py-[18px] transition-colors duration-150 hover:border-line-focus"
              >
                <h2 className="mb-2.5 text-[14.5px] font-semibold leading-[1.4] text-white">
                  {q.id}.{" "}
                  {t(`test.questions.${q.id}.text`, {
                    defaultValue: q.questionText,
                  })}
                </h2>
                <div className="flex items-center gap-2 text-[13.5px] text-fg-secondary">
                  <span>{t("test.answerLabel", "Відповідь")}:</span>
                  <span className="rounded-md border border-line bg-input px-2.5 py-1 font-medium text-fg">
                    {displayedText}
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="flex items-center justify-between gap-4">
          <button
            type="button"
            className={btnRetestCls}
            onClick={() => navigate("/test")}
          >
            {t("test.retestBtn", "Пройти знову")}
          </button>

          <button
            type="button"
            className={btnPrimaryCls}
            onClick={handleSubmitForSearch}
          >
            {t("test.toProfileBtn", "Перейти до профілю")}
          </button>
        </footer>
      </div>
    </main>
  );
};

export default ResultOfTest;
