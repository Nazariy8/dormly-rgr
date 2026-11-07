import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

// Структура зберігає тільки ідентифікатори (контент береться з i18n)
const testSchema = [
  { id: 1, category: "cleanliness", optionIds: ["1.1", "1.2", "1.3"] },
  { id: 2, category: "cleanliness", optionIds: ["2.1", "2.2", "2.3"] },
  { id: 3, category: "cleanliness", optionIds: ["3.1", "3.2", "3.3"] },
  { id: 4, category: "routine", optionIds: ["4.1", "4.2", "4.3"] },
  { id: 5, category: "routine", optionIds: ["5.1", "5.2", "5.3"] },
  { id: 6, category: "routine", optionIds: ["6.1", "6.2", "6.3"] },
  { id: 7, category: "social", optionIds: ["7.1", "7.2", "7.3"] },
  { id: 8, category: "social", optionIds: ["8.1", "8.2", "8.3"] },
  { id: 9, category: "social", optionIds: ["9.1", "9.2", "9.3"] },
  { id: 10, category: "rules", optionIds: ["10.1", "10.2", "10.3"] },
  { id: 11, category: "rules", optionIds: ["11.1", "11.2", "11.3"] },
  { id: 12, category: "rules", optionIds: ["12.1", "12.2", "12.3"] },
  { id: 13, category: "comfort", optionIds: ["13.1", "13.2", "13.3"] },
  { id: 14, category: "comfort", optionIds: ["14.1", "14.2", "14.3"] },
  { id: 15, category: "comfort", optionIds: ["15.1", "15.2", "15.3"] },
];

/* ---------- Класи (перенесено з test.scss) ---------- */
const wrapperCls =
  "relative flex min-h-screen w-full flex-col items-center justify-center bg-page px-4 py-8 " +
  "bg-[image:radial-gradient(circle_at_50%_15%,rgba(105,48,195,0.12)_0%,rgba(10,10,10,1)_70%)]";
const backBtnCls =
  "mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-fg-secondary " +
  "transition-all duration-200 hover:border-line-focus hover:bg-[#181818] hover:text-white";
const cardCls =
  "relative flex min-h-[420px] w-full max-w-[680px] flex-col justify-between overflow-hidden rounded-[20px] " +
  "border border-line bg-card px-5 pb-5 pt-7 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] " +
  "min-[577px]:min-h-[460px] min-[577px]:px-8 min-[577px]:pb-7 min-[577px]:pt-9";
const categoryBadgeCls =
  "mb-4 self-start rounded-full border border-accent-cyan/20 bg-accent-cyan/[0.08] px-3 py-1 " +
  "text-[12.5px] font-semibold tracking-[0.02em] text-accent-cyan";
const questionTitleCls =
  "mb-6 text-[length:clamp(1.25rem,2.5vw,1.6rem)] font-bold leading-[1.35] tracking-[-0.02em] text-white";
const optionBase =
  "flex cursor-pointer items-center justify-between rounded-xl border px-[18px] py-3.5 text-[14.5px] " +
  "leading-[1.4] transition-all duration-200";
const optionIdle =
  "border-line bg-[#0e0e0e] text-fg hover:border-line-focus hover:bg-[#171717]";
const optionSelected =
  "border-accent-purple/60 bg-accent-purple/[0.12] font-semibold text-white";
const btnPrevCls =
  "cursor-pointer rounded-lg border border-line bg-transparent px-[18px] py-2 text-[13.5px] font-medium " +
  "text-fg-secondary transition-all duration-150 enabled:hover:border-line-focus enabled:hover:bg-[#171717] " +
  "enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30";
const btnNextCls =
  "cursor-pointer rounded-lg border border-white bg-white px-6 py-2 text-[13.5px] font-semibold text-black " +
  "transition-all duration-200 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";

const Test = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIds, setSelectedOptionIds] = useState({});
  const [isExiting, setIsExiting] = useState(false);

  const currentQ = testSchema[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testSchema.length - 1;

  const handleSelect = (optId) => {
    setSelectedOptionIds((prev) => ({
      ...prev,
      [String(currentQ.id)]: optId,
    }));
  };

  const handleSubmit = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          // Зберігаємо виключно ID варіантів для коректного метчингу
          answers: selectedOptionIds,
          hasPassedTest: true,
          lastTestDate: new Date(),
        });
      } catch (error) {
        console.error("Помилка збереження результатів:", error);
      }
    }

    navigate("/resultoftest", {
      state: {
        userAnswerIds: selectedOptionIds,
        testSchema: testSchema,
      },
    });
  }, [selectedOptionIds, navigate]);

  const handleNext = useCallback(() => {
    if (!selectedOptionIds[currentQ.id]) {
      alert(t("test.alertSelect"));
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsExiting(false);
      }, 250);
    }
  }, [selectedOptionIds, currentQ.id, isLastQuestion, handleSubmit, t]);

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setIsExiting(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev - 1);
        setIsExiting(false);
      }, 250);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext]);

  const progressPercentage =
    ((currentQuestionIndex + 1) / testSchema.length) * 100;

  return (
    <main className={wrapperCls}>
      <Link to="/" className={backBtnCls} title={t("test.backHome")}>
        <i className="bi bi-arrow-left"></i>
      </Link>

      <section className={cardCls} aria-label="Habit Test">
        <div
          className="absolute left-0 top-0 h-1 w-full bg-white/5"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="h-full bg-[image:linear-gradient(90deg,#7928ca,#4fb7b3)] transition-[width] duration-[350ms] ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div
          className={
            "mb-6 flex grow flex-col transition-[opacity,transform] duration-[250ms] ease-in-out " +
            (isExiting
              ? "-translate-y-2 opacity-0"
              : "translate-y-0 opacity-100")
          }
        >
          <div className={categoryBadgeCls}>
            {t(`test.categories.${currentQ.category}`)}
          </div>

          <h1 className={questionTitleCls}>
            {t(`test.questions.${currentQ.id}.text`)}
          </h1>

          <div>
            <div className="flex flex-col gap-3">
              {currentQ.optionIds.map((optId) => {
                const isSelected = selectedOptionIds[currentQ.id] === optId;
                return (
                  <div
                    key={optId}
                    className={`${optionBase} ${isSelected ? optionSelected : optionIdle}`}
                    onClick={() => handleSelect(optId)}
                    role="button"
                    tabIndex={0}
                  >
                    <span>
                      {t(`test.questions.${currentQ.id}.options.${optId}`)}
                    </span>
                    {isSelected && (
                      <i className="bi bi-check-lg ml-3 shrink-0 text-[15px] text-accent-mint"></i>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <footer className="flex items-center justify-between border-t border-white/5 pt-[18px]">
            <button
              type="button"
              className={btnPrevCls}
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              {t("test.btnBack")}
            </button>

            <button type="button" className={btnNextCls} onClick={handleNext}>
              {isLastQuestion ? t("test.btnFinish") : t("test.btnNext")}
            </button>
          </footer>

          <div className="mt-3.5 text-center text-[12.5px] tracking-[0.01em] text-fg-muted">
            {t("test.stepIndicator", {
              current: currentQuestionIndex + 1,
              total: testSchema.length,
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Test;
