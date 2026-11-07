import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import googleicon from "../img/icons/google.png";
import { auth, db, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/* ---------- Класи (перенесено з .auth-* у main.scss) ---------- */
const wrapper =
  "relative flex min-h-screen flex-col items-center justify-center bg-page px-4 py-6 " +
  "bg-[image:radial-gradient(circle_at_50%_15%,rgba(105,48,195,0.12)_0%,rgba(10,10,10,1)_70%)]";
const backBtn =
  "mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-fg-secondary " +
  "transition-all duration-200 hover:border-line-focus hover:bg-[#181818] hover:text-white";
const card =
  "w-full max-w-[420px] rounded-2xl border border-line bg-card px-7 py-8 " +
  "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]";
const title = "mb-1.5 text-2xl font-extrabold tracking-[-0.02em] text-white";
const subtitle = "mb-6 text-sm text-fg-secondary";
const label = "mb-1.5 text-[13px] font-medium text-fg-secondary";
const labelNoMargin = "text-[13px] font-medium text-fg-secondary";
const input =
  "h-11 w-full rounded-lg border border-line bg-page text-sm font-normal text-white outline-none " +
  "transition-colors duration-150 placeholder:text-[#525252] focus:border-line-focus";
const eyeBtn =
  "absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center p-1 text-fg-muted " +
  "transition-colors duration-150 hover:text-white";
const hint = "mt-1 text-xs text-fg-muted";
const link =
  "text-[12.5px] text-fg-secondary transition-colors duration-150 hover:text-white";
const linkBold =
  "text-[13.5px] font-semibold text-white transition-colors duration-150 hover:text-accent-cyan";
const error = "mt-1 text-[12.5px] text-[#ef4444]";
const submitBtn =
  "mt-2 h-11 w-full cursor-pointer rounded-lg border border-white bg-white text-sm font-semibold text-black " +
  "transition-all duration-200 hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";
const divider = "relative my-6 border-t border-line text-center";
const dividerText =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-fg-muted";
const googleBtn =
  "flex h-11 w-full cursor-pointer items-center justify-center rounded-lg border border-line bg-page " +
  "text-[13.5px] font-medium text-fg transition-all duration-200 " +
  "hover:border-line-focus hover:bg-[#161616] hover:text-white";

function Auth({ goal }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        const nameParts = (user.displayName || "Студент").split(" ");
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          firstName: nameParts[0] || "Студент",
          lastName: nameParts.slice(1).join(" ") || "",
          photoURL: user.photoURL || "",
          status: "Шукаю кімнату",
          createdAt: new Date(),
        });
      }

      navigate("/profile");
    } catch (error) {
      // Ігноруємо закриття попапу або конфлікт паралельних запитів
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      console.error("Google Auth Error:", error);
      alert("Помилка авторизації: " + error.message);
    }
  };

  const validateInputs = () => {
    setEmailError("");
    setPasswordError("");
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email не може бути порожнім");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Введіть коректний формат email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Пароль не може бути порожнім");
      isValid = false;
    } else if (password.length < 8 || password.length > 20) {
      setPasswordError("Пароль має бути від 8 до 20 символів");
      isValid = false;
    }

    if (goal === "reg") {
      if (!confirmPassword) {
        setPasswordError("Будь ласка, підтвердіть пароль");
        isValid = false;
      } else if (password !== confirmPassword) {
        setPasswordError("Паролі не співпадають");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      if (goal === "reg") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        alert("Акаунт створено! Перевірте пошту для підтвердження.");
        navigate("/login");
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        if (!user.emailVerified) {
          await signOut(auth);
          alert("Будь ласка, підтвердіть пошту перед входом!");
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            firstName: "Студент",
            lastName: "",
            status: "Не шукаю",
            photoURL: "",
            createdAt: new Date(),
          });
        }

        navigate("/profile");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Користувач з таким email вже існує");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        alert("Неправильний email або пароль");
      } else {
        alert("Сталася помилка. Спробуйте ще раз.");
      }
    }
  };

  return (
    <main className={wrapper}>
      <Link to="/" className={backBtn} title="На головну">
        <i className="bi bi-arrow-left"></i>
      </Link>

      <section className={card} aria-labelledby="auth-heading">
        <header className="text-center">
          <h1 id="auth-heading" className={title}>
            {goal === "log" ? t("auth.welcome") : t("auth.createAccount")}
          </h1>
          <p className={subtitle}>
            {goal === "log" ? t("auth.subtitleLogin") : t("auth.subtitleReg")}
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4 flex flex-col">
            <label className={label} htmlFor="emailInput">
              {t("auth.emailLabel")}
            </label>
            <input
              type="email"
              id="emailInput"
              name="email"
              autoComplete="email"
              className={`${input} px-3.5`}
              placeholder="student@lpnu.ua"
              required
              maxLength="64"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <p className={error}>{emailError}</p>}
          </div>

          <div className="mb-2 flex flex-col">
            <div className="mb-1 flex items-center justify-between">
              <label className={labelNoMargin} htmlFor="passwordInput">
                {t("auth.passwordLabel")}
              </label>
              {goal === "log" && (
                <Link to="/resetPass" className={link}>
                  {t("auth.forgotPassword")}
                </Link>
              )}
            </div>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                id="passwordInput"
                name="password"
                autoComplete={
                  goal === "log" ? "current-password" : "new-password"
                }
                className={`${input} pl-3.5 pr-12`}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Сховати пароль" : "Показати пароль"}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                ></i>
              </button>
            </div>
            <span className={hint}>{t("auth.passwordHint")}</span>
          </div>

          {goal === "reg" && (
            <div className="mb-4 mt-4 flex flex-col">
              <label className={label} htmlFor="confirmPasswordInput">
                {t("auth.confirmPasswordLabel")}
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPasswordInput"
                  name="confirmPassword"
                  autoComplete="new-password"
                  className={`${input} pl-3.5 pr-12`}
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={eyeBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Сховати підтвердження"
                      : "Показати підтвердження"
                  }
                >
                  <i
                    className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"}`}
                  ></i>
                </button>
              </div>
            </div>
          )}

          {passwordError && <p className={`${error} mb-2`}>{passwordError}</p>}

          <button type="submit" className={submitBtn}>
            {goal === "log" ? t("auth.loginBtn") : t("auth.registerBtn")}
          </button>

          <div className={divider}>
            <span className={dividerText}>{t("auth.or")}</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className={googleBtn}
          >
            <img
              src={googleicon}
              alt="Google"
              className="mr-2.5 h-[18px] w-[18px]"
            />
            {t("auth.googleBtn")}
          </button>
        </form>

        <footer className="mt-6 text-center">
          <p className="m-0 text-[13.5px] text-fg-secondary">
            {goal === "log" ? (
              <>
                {t("auth.noAccount")}{" "}
                <Link to="/regist" className={linkBold}>
                  {t("auth.toRegister")}
                </Link>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <Link to="/login" className={linkBold}>
                  {t("auth.toLogin")}
                </Link>
              </>
            )}
          </p>
        </footer>
      </section>
    </main>
  );
}

export default Auth;
