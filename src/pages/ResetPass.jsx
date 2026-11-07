import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ---------- Класи (перенесено з resetPass.scss) ---------- */
const wrapperCls =
  "flex min-h-[calc(100vh-65px)] flex-col items-center justify-center bg-page px-4 py-6 " +
  "bg-[image:radial-gradient(circle_at_50%_20%,rgba(105,48,195,0.12)_0%,rgba(10,10,10,1)_70%)]";
const backBtnCls =
  "mb-4 flex cursor-pointer gap-1 rounded-lg border border-line bg-card px-3 py-2 text-fg " +
  "transition-all duration-200 hover:border-line-focus hover:bg-[#181818] hover:text-white";
const cardCls =
  "w-full max-w-[420px] rounded-2xl border border-line bg-card px-7 py-8 " +
  "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]";
const inputCls =
  "h-11 w-full rounded-lg border border-line bg-page px-3.5 text-sm text-white outline-none " +
  "transition-colors duration-150 placeholder:text-[#525252] focus:border-line-focus";
const submitCls =
  "h-11 w-full cursor-pointer rounded-lg border border-white bg-white text-sm font-semibold text-black " +
  "transition-all duration-200 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";
const backLoginCls =
  "mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-line " +
  "bg-transparent text-[13.5px] font-medium text-fg-secondary transition-all duration-150 " +
  "hover:border-line-focus hover:bg-[#181818] hover:text-white";

const ResetPass = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      alert(t("resetPass.alertEmpty"));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(t("resetPass.alertSuccess", { email }));
      navigate("/login");
    } catch (error) {
      console.error("Помилка:", error.code);
      alert(t("resetPass.alertError"));
    }
  };

  return (
    <main className={wrapperCls}>
      <button className={backBtnCls} onClick={() => navigate("/")}>
        <i className="bi bi-house"></i>
        {t("test.backHome")}
      </button>

      <section className={cardCls} aria-labelledby="reset-heading">
        <header className="text-center">
          <h1
            id="reset-heading"
            className="mb-1.5 text-[22px] font-extrabold tracking-[-0.02em] text-white"
          >
            {t("resetPass.title")}
          </h1>
          <p className="mb-6 text-[13.5px] leading-normal text-fg-secondary">
            {t("resetPass.subtitle")}
          </p>
        </header>

        <form onSubmit={handleReset} noValidate>
          <div className="mb-5 flex flex-col">
            <label
              className="mb-1.5 text-[13px] font-medium text-fg-secondary"
              htmlFor="resetEmail"
            >
              {t("resetPass.emailLabel")}
            </label>
            <input
              id="resetEmail"
              type="email"
              placeholder={t("resetPass.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className={submitCls}>
            {t("resetPass.sendBtn")}
          </button>
        </form>

        <button
          type="button"
          className={backLoginCls}
          onClick={() => navigate("/login")}
        >
          <i className="bi bi-arrow-left"></i> {t("resetPass.backBtn")}
        </button>
      </section>
    </main>
  );
};

export default ResetPass;
