import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";

const navLink =
  "block rounded-md px-3 py-2.5 text-[15px] font-medium text-fg-secondary transition-colors duration-150 " +
  "hover:bg-white/5 hover:text-white lg:px-3.5 lg:py-2 lg:text-sm";

const btnBase =
  "inline-block w-full rounded-lg px-4 py-[9px] text-center text-sm transition-all duration-200 lg:w-auto";
const btnOutline =
  `${btnBase} border border-line bg-white/[0.03] font-medium text-fg ` +
  "hover:border-line-focus hover:bg-white/[0.08] hover:text-white";
const btnSolid =
  `${btnBase} border border-white bg-white font-semibold text-black ` +
  "hover:border-[#e5e5e5] hover:bg-[#e5e5e5]";

const langBtn = (active) =>
  "cursor-pointer rounded-2xl px-2.5 py-[3px] text-xs font-semibold tracking-[0.04em] transition-all duration-200 " +
  (active
    ? "bg-line text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
    : "bg-transparent text-fg-secondary hover:text-white");

const Header = ({ user }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = i18n.language?.startsWith("en") ? "en" : "ua";
  const toggleLanguage = (lang) => i18n.changeLanguage(lang);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-line bg-[rgba(10,10,10,0.85)] backdrop-blur-xl">
      <nav className="min-h-16 px-4 py-3">
        <div className="mx-auto flex w-full max-w-[1140px] flex-wrap items-center justify-between">
          {/* ЛОГОТИП */}
          <Link
            to="/"
            title="logo"
            onClick={close}
            className="bg-[image:linear-gradient(to_right,#7928ca,#4fb7b3)] bg-clip-text text-[30px] font-extrabold leading-[34px] tracking-[-0.02em] text-transparent"
          >
            Dormly
          </Link>

          {/* БУРГЕР (тільки до lg) */}
          <button
            type="button"
            title="navbar-toggler"
            aria-label="Toggle navigation"
            aria-controls="navbarSupportedContent"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer px-2 text-white lg:hidden"
          >
            <i className={`bi ${open ? "bi-x" : "bi-list"} text-[32px]`} />
          </button>

          {/* МЕНЮ */}
          <div
            id="navbarSupportedContent"
            className={
              (open ? "block" : "hidden") +
              " mt-3 basis-full border-t border-white/[0.06] pb-2 pt-4 " +
              "lg:mt-0 lg:flex lg:basis-auto lg:justify-end lg:border-0 lg:p-0"
            }
          >
            <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
              <li>
                <Link className={navLink} to="/faq" onClick={close}>
                  {t("header.questions")}
                </Link>
              </li>

              {!user ? (
                <>
                  <li>
                    <HashLink
                      className={navLink}
                      to="/#advantage-heading"
                      smooth
                      onClick={close}
                    >
                      {t("header.advantages")}
                    </HashLink>
                  </li>
                  <li>
                    <HashLink
                      className={navLink}
                      to="/#feedbacks-heading"
                      smooth
                      onClick={close}
                    >
                      {t("header.feedbacks")}
                    </HashLink>
                  </li>

                  {/* Кнопки авторизації */}
                  <li className="mt-2 lg:ml-2 lg:mt-0">
                    <Link className={btnOutline} to="/login" onClick={close}>
                      {t("header.login")}
                    </Link>
                  </li>
                  <li className="mt-2 lg:ml-1 lg:mt-0">
                    <Link className={btnSolid} to="/regist" onClick={close}>
                      {t("header.register")}
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/chat" className={navLink} onClick={close}>
                      {t("header.chat")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/roommates" className={navLink} onClick={close}>
                      {t("header.roommates")}
                    </Link>
                  </li>
                  <li className="mt-2 lg:ml-2 lg:mt-0">
                    <Link
                      to="/profile"
                      onClick={close}
                      className={`${btnSolid} lg:px-6`}
                    >
                      {t("header.profile")}
                    </Link>
                  </li>
                </>
              )}

              {/* ПЕРЕМИКАЧ МОВИ UA / EN */}
              <li className="mt-4 flex justify-center lg:ml-4 lg:mt-0">
                <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-white/5 p-[3px]">
                  <button
                    type="button"
                    className={langBtn(currentLang === "ua")}
                    onClick={() => toggleLanguage("ua")}
                  >
                    UA
                  </button>
                  <button
                    type="button"
                    className={langBtn(currentLang === "en")}
                    onClick={() => toggleLanguage("en")}
                  >
                    EN
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
