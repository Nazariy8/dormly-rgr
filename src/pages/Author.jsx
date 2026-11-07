import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import avatarImg from "../img/profile/user.jpg";

const stack = ["React JS", "Firebase", "Tailwind CSS", "Vite"];

const Author = () => {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-page p-5">
      <section className="w-full max-w-[520px] rounded-2xl border border-line bg-card p-6 text-center md:p-12">
        <img
          src={avatarImg}
          alt="Author"
          className="mx-auto mb-4 h-[110px] w-[110px] rounded-full border-2 border-line-focus object-cover"
        />
        <h1 className="mb-1 text-[length:calc(1.275rem+0.3vw)] font-bold text-white xl:text-2xl">
          {t("rgr.author-title")}
        </h1>
        <p className="mb-4 text-sm font-semibold text-[#0d6efd]">
          {t("rgr.authorRole")}
        </p>

        <p className="mb-6 text-sm leading-[1.6] text-[#6c757d]">
          {t("rgr.authorBio")}
        </p>

        <div className="mb-6 flex justify-center gap-2">
          {stack.map((item) => (
            <span
              key={item}
              className="inline-block whitespace-nowrap rounded-md border border-[#333] bg-input px-[0.65em] py-[0.35em] text-center text-xs font-bold leading-none text-[#ccc]"
            >
              {item}
            </span>
          ))}
        </div>

        <Link
          to="/"
          className="inline-block rounded-full border border-[#f8f9fa] px-6 py-2 text-sm leading-normal text-[#f8f9fa] transition-colors duration-150 hover:bg-[#f8f9fa] hover:text-black"
        >
          {t("rgr.backHome")}
        </Link>
      </section>
    </main>
  );
};

export default Author;
