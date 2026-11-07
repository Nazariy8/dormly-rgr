import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const heading = "mb-4 text-[13px] font-semibold text-white";
const list = "m-0 flex list-none flex-col gap-3 p-0";
const link =
  "text-[13px] text-fg-secondary transition-colors duration-150 hover:text-white";

const Footer = () => {
  return (
    <footer className="border-t border-line bg-page px-4 pb-8 pt-12 lg:pt-16">
      <div className="mx-auto w-full max-w-[1030px]">
        <div className="grid grid-cols-12 gap-x-6 gap-y-8 lg:gap-x-12">
          {/* Колонка 1: Лого та опис */}
          <div className="col-span-12 lg:col-span-4">
            <Link
              to="/"
              className="text-[30px] font-extrabold tracking-[-0.02em] text-white"
            >
              Dormly
            </Link>
            <p className="mt-3 text-[13px] leading-[1.7] text-fg-secondary">
              Твої люди. Твій простір.
              <br />
              Комфортне студентське життя починається зі спільних звичок.
            </p>
          </div>

          {/* Колонка 2: Платформа */}
          <div className="col-span-6 md:col-span-4 lg:col-span-2 lg:col-start-6">
            <h4 className={heading}>Платформа</h4>
            <ul className={list}>
              <li>
                <HashLink smooth to="/#advantage-heading" className={link}>
                  Як це працює
                </HashLink>
              </li>
              <li>
                <Link to="/roommates" className={link}>
                  Знайти сусіда
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Студентам */}
          <div className="col-span-6 md:col-span-4 lg:col-span-2">
            <h4 className={heading}>Студентам</h4>
            <ul className={list}>
              <li>
                <Link to="/test" className={link}>
                  Пройти тест
                </Link>
              </li>
              <li>
                <Link to="/faq" className={link}>
                  Питання та відповіді
                </Link>
              </li>
              <li>
                <Link to="/faq" className={link}>
                  Підтримка
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Правила */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <h4 className={heading}>Правила</h4>
            <ul className={list}>
              <li>
                <Link to="#" className={link}>
                  Умови користування
                </Link>
              </li>
              <li>
                <Link to="#" className={link}>
                  Конфіденційність
                </Link>
              </li>
              <li>
                <Link to="#" className={link}>
                  Безпека спільноти
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-line pt-6 text-xs text-fg-muted sm:flex-row sm:items-center">
          <div>
            © 2026 Dormly. Автор розробки:{" "}
            <Link
              to="/author"
              className="font-semibold text-fg-secondary transition-colors duration-150 hover:text-white"
            >
              Яворський Н.П.
            </Link>
          </div>
          <div>
            <span>Українська · UA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
