import React from "react";
import { Link } from "react-router-dom";
import "../css/footer.scss";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="row g-4 g-lg-5">
          {/* Колонка 1: Лого та опис */}
          <div className="col-12 col-lg-4">
            <Link to="/" className="footer-brand">
              Dormly
            </Link>
            <p className="footer-desc">
              Твої люди. Твій простір.
              <br />
              Комфортне студентське життя починається зі спільних звичок.
            </p>
          </div>

          {/* Колонка 2: Платформа */}
          <div className="col-6 col-md-4 col-lg-2 offset-lg-1">
            <h4 className="footer-heading">Платформа</h4>
            <ul className="footer-list">
              <li>
                <Link to="/#how-it-works">Як це працює</Link>
              </li>
              <li>
                <Link to="/roommates">Знайти сусіда</Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Студентам */}
          <div className="col-6 col-md-4 col-lg-2">
            <h4 className="footer-heading">Студентам</h4>
            <ul className="footer-list">
              <li>
                <Link to="/test">Пройти тест</Link>
              </li>
              <li>
                <Link to="/faq">Питання та відповіді</Link>
              </li>
              <li>
                <Link to="/faq">Підтримка</Link>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Правила */}
          <div className="col-12 col-md-4 col-lg-3">
            <h4 className="footer-heading">Правила</h4>
            <ul className="footer-list">
              <li>
                <Link to="#">Умови користування</Link>
              </li>
              <li>
                <Link to="#">Конфіденційність</Link>
              </li>
              <li>
                <Link to="#">Безпека спільноти</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="footer-bottom">
          <div className="copyright">
            © 2026 Dormly. Автор розробки:{" "}
            <Link to="/author" className="copyright-link">
              Яворський Н.П.
            </Link>
          </div>

          <div className="lang-selector">
            <span>Українська · UA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
